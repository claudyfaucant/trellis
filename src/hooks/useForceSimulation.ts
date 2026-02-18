import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import type { Network } from "../data/types";
import { createRadiusScale, getMetricValue } from "../utils/scales";
import { getStageDistance } from "../utils/shapes";

export interface SimNode extends d3.SimulationNodeDatum {
  network: Network;
  radius: number;
  targetDistance: number;
}

/**
 * Force simulation that positions networks around Ethereum.
 * 
 * Distance rules (from Ethereum center):
 * - Stage 2: 10 base units (closest)
 * - Stage 1: 22 base units (mid)
 * - Stage 0: 40 base units (far)
 * - External L1s: 60 base units (outer edge)
 */
export function useForceSimulation(
  networks: Network[],
  width: number,
  height: number,
  _sizeMetric: "tvl" | "stablecoins" | "transactions" = "stablecoins"
) {
  const [nodes, setNodes] = useState<SimNode[]>([]);
  const simRef = useRef<d3.Simulation<SimNode, undefined> | null>(null);

  useEffect(() => {
    if (!width || !height) return;

    const radiusScale = createRadiusScale(networks, "stablecoins");
    const cx = width / 2;
    const cy = height / 2;
    const baseUnit = Math.min(width, height) / 100;

    // Group networks by stage for even angular distribution
    const byStage: Record<string, Network[]> = {
      'eth': [],
      'stage2': [],
      'stage1': [],
      'stage0': [],
      'l1': [],
    };

    networks.forEach((n) => {
      if (n.category === "ethereum") byStage.eth.push(n);
      else if (n.category === "external_l1") byStage.l1.push(n);
      else if (n.security_stage === 2) byStage.stage2.push(n);
      else if (n.security_stage === 1) byStage.stage1.push(n);
      else byStage.stage0.push(n);
    });

    const simNodes: SimNode[] = [];

    // Position Ethereum at center (fixed)
    byStage.eth.forEach((n) => {
      const val = getMetricValue(n, "stablecoins");
      const r = val > 0 ? radiusScale(val) : 20;
      simNodes.push({
        network: n,
        radius: r,
        targetDistance: 0,
        x: cx,
        y: cy,
        fx: cx,
        fy: cy,
      });
    });

    // Helper to distribute nodes evenly around a ring
    const distributeOnRing = (
      nets: Network[],
      distance: number,
      startAngle: number = 0
    ) => {
      const count = nets.length;
      if (count === 0) return;
      
      const angleStep = (2 * Math.PI) / Math.max(count, 1);
      
      nets.forEach((n, i) => {
        const val = getMetricValue(n, "stablecoins");
        const r = val > 0 ? radiusScale(val) : 20;
        const angle = startAngle + i * angleStep;
        
        simNodes.push({
          network: n,
          radius: r,
          targetDistance: distance,
          x: cx + Math.cos(angle) * distance,
          y: cy + Math.sin(angle) * distance,
        });
      });
    };

    // Distribute each stage on its ring with offset angles to avoid alignment
    distributeOnRing(byStage.stage2, getStageDistance(2, baseUnit), 0);
    distributeOnRing(byStage.stage1, getStageDistance(1, baseUnit), Math.PI / 6);
    distributeOnRing(byStage.stage0, getStageDistance(0, baseUnit), Math.PI / 8);
    distributeOnRing(byStage.l1, getStageDistance(null, baseUnit), Math.PI / 4);

    if (simRef.current) simRef.current.stop();

    // Simulation: mainly for collision avoidance within rings
    const sim = d3
      .forceSimulation(simNodes)
      // Collision to prevent overlap
      .force("collision", d3.forceCollide<SimNode>()
        .radius((d) => d.radius + 8)
        .strength(0.5)
      )
      // VERY strong radial force to keep nodes on their orbit
      .force("radial", d3.forceRadial<SimNode>(
        (d) => d.targetDistance,
        cx,
        cy
      ).strength((d) => d.network.category === "ethereum" ? 0 : 2.0))
      // Repulsion only between nearby nodes (spread on same ring)
      .force("charge", d3.forceManyBody<SimNode>()
        .strength((d) => d.network.category === "external_l1" ? -50 : -15)
        .distanceMax(60)
      )
      .alpha(0.8)
      .alphaDecay(0.02)
      .on("tick", () => {
        setNodes([...simNodes]);
      });

    simRef.current = sim;

    return () => { sim.stop(); };
  }, [networks, width, height]);

  return nodes;
}
