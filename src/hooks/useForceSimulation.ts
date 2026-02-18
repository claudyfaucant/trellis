import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import type { Network } from "../data/types";
import type { SizeMetric } from "../utils/scales";
import { createRadiusScale, getMetricValue } from "../utils/scales";

export interface SimNode extends d3.SimulationNodeDatum {
  network: Network;
  radius: number;
}

export function useForceSimulation(
  networks: Network[],
  width: number,
  height: number,
  sizeMetric: SizeMetric
) {
  const [nodes, setNodes] = useState<SimNode[]>([]);
  const simRef = useRef<d3.Simulation<SimNode, undefined> | null>(null);

  useEffect(() => {
    if (!width || !height) return;

    const radiusScale = createRadiusScale(networks, sizeMetric);
    const cx = width / 2;
    const cy = height / 2;

    const simNodes: SimNode[] = networks.map((n) => {
      const val = getMetricValue(n, sizeMetric);
      const r = val > 0 ? radiusScale(val) : 20;
      return { network: n, radius: r };
    });

    // Assign initial positions
    simNodes.forEach((sn) => {
      if (sn.network.category === "ethereum") {
        sn.x = cx;
        sn.y = cy;
        sn.fx = cx;
        sn.fy = cy;
      } else if (sn.network.category === "external_l1") {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.min(width, height) * 0.42;
        sn.x = cx + Math.cos(angle) * dist;
        sn.y = cy + Math.sin(angle) * dist;
      } else {
        // L2: orbit distance based on bridge volume (inverted: more volume = closer)
        const vol = sn.network.monthly_bridge_volume_million_usd || 50;
        const maxVol = 900;
        const minDist = Math.min(width, height) * 0.12;
        const maxDist = Math.min(width, height) * 0.32;
        const dist = minDist + (maxDist - minDist) * (1 - Math.min(vol / maxVol, 1));
        const angle = Math.random() * Math.PI * 2;
        sn.x = cx + Math.cos(angle) * dist;
        sn.y = cy + Math.sin(angle) * dist;
      }
    });

    if (simRef.current) simRef.current.stop();

    const sim = d3
      .forceSimulation(simNodes)
      .force("collision", d3.forceCollide<SimNode>().radius((d) => d.radius + 6).strength(0.8))
      .force("radial-l2", d3.forceRadial<SimNode>(
        (d) => {
          if (d.network.category === "ethereum") return 0;
          if (d.network.category === "external_l1") return Math.min(width, height) * 0.42;
          const vol = d.network.monthly_bridge_volume_million_usd || 50;
          const minDist = Math.min(width, height) * 0.12;
          const maxDist = Math.min(width, height) * 0.32;
          return minDist + (maxDist - minDist) * (1 - Math.min(vol / 900, 1));
        },
        cx, cy
      ).strength(0.6))
      .force("center", d3.forceCenter(cx, cy).strength(0.02))
      .alpha(0.8)
      .alphaDecay(0.02)
      .on("tick", () => {
        setNodes([...simNodes]);
      });

    simRef.current = sim;

    return () => { sim.stop(); };
  }, [networks, width, height, sizeMetric]);

  return nodes;
}
