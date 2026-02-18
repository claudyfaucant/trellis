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
  
  // Ethereum gets special pulsing circle effect
  if (isEth) {
    return (
      <g>
        {/* Outer glow */}
        <circle
          r={radius + 20}
          fill={color}
          opacity={0.12 * pulse}
          filter="url(#eth-glow)"
        />
        {/* Inner glow */}
        <circle
          r={radius + 8}
          fill={color}
          opacity={0.25 * pulse}
        />
        {/* Main circle */}
        <circle
          r={radius}
          fill={color}
          opacity={0.7 + 0.3 * pulse}
          filter="url(#eth-glow)"
        />
      </g>
    );
  }
  
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
