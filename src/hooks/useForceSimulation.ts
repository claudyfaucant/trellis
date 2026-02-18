import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import type { Network } from "../data/types";
import { createRadiusScale, getMetricValue } from "../utils/scales";
import { getStageDistance } from "../utils/shapes";

export interface SimNode extends d3.SimulationNodeDatum {
  network: Network;
  radius: number;
  targetDistance: number; // Distance from Ethereum based on stage
}

/**
 * Force simulation that positions networks around Ethereum.
 * 
 * Distance rules (from Ethereum center):
 * - Stage 2: closest (5 base units) — fully decentralized
 * - Stage 1: mid (15 base units) — safety net
 * - Stage 0: far (30 base units) — training wheels
 * - External L1s: outer edge (40+ base units)
 * 
 * Size: proportional to stablecoin liquidity
 */
export function useForceSimulation(
  networks: Network[],
  width: number,
  height: number,
  sizeMetric: "tvl" | "stablecoins" | "transactions" = "stablecoins"
) {
  const [nodes, setNodes] = useState<SimNode[]>([]);
  const simRef = useRef<d3.Simulation<SimNode, undefined> | null>(null);

  useEffect(() => {
    if (!width || !height) return;

    // Always use stablecoins for sizing as per spec
    const radiusScale = createRadiusScale(networks, "stablecoins");
    const cx = width / 2;
    const cy = height / 2;
    
    // Base unit for distance scaling (responsive to viewport)
    const baseUnit = Math.min(width, height) / 100;

    const simNodes: SimNode[] = networks.map((n) => {
      const val = getMetricValue(n, "stablecoins");
      const r = val > 0 ? radiusScale(val) : 20;
      const targetDist = getStageDistance(n.security_stage, baseUnit);
      
      return { 
        network: n, 
        radius: r,
        targetDistance: n.category === "ethereum" ? 0 : targetDist,
      };
    });

    // Assign initial positions
    simNodes.forEach((sn, idx) => {
      if (sn.network.category === "ethereum") {
        // Ethereum fixed at center
        sn.x = cx;
        sn.y = cy;
        sn.fx = cx;
        sn.fy = cy;
      } else {
        // Distribute others around their target orbit
        const angle = (idx / simNodes.length) * Math.PI * 2 + Math.random() * 0.3;
        sn.x = cx + Math.cos(angle) * sn.targetDistance;
        sn.y = cy + Math.sin(angle) * sn.targetDistance;
      }
    });

    if (simRef.current) simRef.current.stop();

    const sim = d3
      .forceSimulation(simNodes)
      // Prevent overlapping - lower strength so radial dominates
      .force("collision", d3.forceCollide<SimNode>()
        .radius((d) => d.radius + 6)
        .strength(0.7)
      )
      // Pull nodes STRONGLY to their stage-appropriate orbit
      .force("radial", d3.forceRadial<SimNode>(
        (d) => d.targetDistance,
        cx, 
        cy
      ).strength((d) => d.network.category === "ethereum" ? 0 : 1.5))
      // Very gentle centering force
      .force("center", d3.forceCenter(cx, cy).strength(0.005))
      // Slight repulsion to spread nodes on same orbit
      .force("charge", d3.forceManyBody<SimNode>()
        .strength(-20)
        .distanceMax(80)
      )
      .alpha(1.0)
      .alphaDecay(0.01)
      .on("tick", () => {
        setNodes([...simNodes]);
      });

    simRef.current = sim;

    return () => { sim.stop(); };
  }, [networks, width, height, sizeMetric]);

  return nodes;
}
