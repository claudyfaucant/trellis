import type { Network } from "../data/types";
import { getShapeType, getShapePath } from "../utils/shapes";
import { getNodeColor } from "../utils/scales";

interface Props {
  network: Network;
  radius: number;
  pulse?: number; // For Ethereum glow effect
}

/**
 * Renders the appropriate SVG shape for a network type:
 * - Ethereum → 8-point Star
 * - OP Stack → Hexagon
 * - Arbitrum Orbit → Diamond
 * - ZK Rollup → Pentagon
 * - Other L1 → Circle
 */
export function NetworkShape({ network, radius, pulse = 1 }: Props) {
  const isEth = network.category === "ethereum";
  const shape = getShapeType(network.type, isEth);
  const color = getNodeColor(network);
  const path = getShapePath(shape, radius);
  
  // Circle uses SVG circle element for smoother rendering
  if (shape === "circle") {
    return (
      <circle
        r={radius}
        fill={color}
        opacity={0.85}
        filter="url(#node-glow)"
      />
    );
  }
  
  // Ethereum gets special pulsing effect
  if (isEth) {
    return (
      <g>
        {/* Outer glow */}
        <path
          d={getShapePath("star", radius + 20)}
          fill={color}
          opacity={0.12 * pulse}
          filter="url(#eth-glow)"
        />
        {/* Inner glow */}
        <path
          d={getShapePath("star", radius + 8)}
          fill={color}
          opacity={0.25 * pulse}
        />
        {/* Main shape */}
        <path
          d={path}
          fill={color}
          opacity={0.7 + 0.3 * pulse}
          filter="url(#eth-glow)"
        />
      </g>
    );
  }
  
  // Standard shape rendering for L2s
  return (
    <path
      d={path}
      fill={color}
      opacity={0.85}
      filter="url(#node-glow)"
    />
  );
}
