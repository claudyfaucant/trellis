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
 * Simple approach: just enforce radial distances by stage.
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

    const simNodes: SimNode[] = networks.map((n, idx) => {
      const val = getMetricValue(n, "stablecoins");
      const r = val > 0 ? radiusScale(val) : 20;
      const targetDist = n.category === "ethereum" ? 0 : getStageDistance(n.security_stage, baseUnit);
      
      // Initial position
      let x = cx;
      let y = cy;
      
      if (n.category !== "ethereum") {
        const angle = (idx / networks.length) * Math.PI * 2 + Math.random() * 0.2;
        x = cx + Math.cos(angle) * targetDist;
        y = cy + Math.sin(angle) * targetDist;
      }
      
      return { 
        network: n, 
        radius: r,
        targetDistance: targetDist,
        x,
        y,
        fx: n.category === "ethereum" ? cx : undefined,
        fy: n.category === "ethereum" ? cy : undefined,
      };
    });

    if (simRef.current) simRef.current.stop();

    const sim = d3
      .forceSimulation(simNodes)
      // Collision to prevent overlap
      .force("collision", d3.forceCollide<SimNode>()
        .radius((d) => d.radius + 10)
        .strength(0.8)
      )
      // Strong radial force to keep nodes at their stage distance
      .force("radial", d3.forceRadial<SimNode>(
        (d) => d.targetDistance,
        cx,
        cy
      ).strength((d) => d.network.category === "ethereum" ? 0 : 0.8))
      // Spread nodes around the ring
      .force("charge", d3.forceManyBody<SimNode>()
        .strength(-50)
        .distanceMax(150)
      )
      .alpha(1)
      .alphaDecay(0.02)
      .on("tick", () => {
        setNodes([...simNodes]);
      });

    simRef.current = sim;

    return () => { sim.stop(); };
  }, [networks, width, height]);

  return nodes;
}
