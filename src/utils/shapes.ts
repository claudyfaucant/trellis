import type { NetworkType } from "../data/types";

/**
 * Shape definitions by network type:
 * - OP Stack → Hexagon (6 sides)
 * - Arbitrum Orbit → Diamond (4 sides, rotated square)
 * - ZK Rollup → Pentagon (5 sides)
 * - Ethereum → 8-point Star
 * - Other L1 → Circle
 */

export type ShapeType = "star" | "hexagon" | "diamond" | "pentagon" | "circle";

export function getShapeType(networkType: NetworkType, isEthereum: boolean): ShapeType {
  // Ethereum is a circle for easier comparison with other L1s
  if (isEthereum) return "circle";
  
  switch (networkType) {
    case "optimistic_rollup_op":
      return "hexagon";
    case "optimistic_rollup_arbitrum":
      return "diamond";
    case "zk_rollup":
      return "pentagon";
    case "L1":
    default:
      return "circle";
  }
}

/**
 * Generate SVG path for regular polygon
 */
function regularPolygonPath(sides: number, radius: number, rotationDeg: number = 0): string {
  const angleStep = (2 * Math.PI) / sides;
  const rotationRad = (rotationDeg * Math.PI) / 180;
  
  const points: string[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = i * angleStep - Math.PI / 2 + rotationRad;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  
  return `M ${points.join(" L ")} Z`;
}

/**
 * Generate 8-point star path for Ethereum
 */
function starPath(radius: number, innerRadiusRatio: number = 0.5): string {
  const points = 8;
  const innerRadius = radius * innerRadiusRatio;
  const angleStep = Math.PI / points;
  
  const pathPoints: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = i * angleStep - Math.PI / 2;
    const r = i % 2 === 0 ? radius : innerRadius;
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);
    pathPoints.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  
  return `M ${pathPoints.join(" L ")} Z`;
}

/**
 * Get SVG path for a shape at given radius
 */
export function getShapePath(shape: ShapeType, radius: number): string {
  switch (shape) {
    case "star":
      return starPath(radius, 0.55);
    case "hexagon":
      return regularPolygonPath(6, radius, 0);
    case "diamond":
      return regularPolygonPath(4, radius, 0); // Square rotated 45° by default orientation
    case "pentagon":
      return regularPolygonPath(5, radius, 0);
    case "circle":
    default:
      // Circle approximated as path for consistency, or return empty for <circle> element
      return "";
  }
}

/**
 * Stage-based distance from Ethereum center
 * Stage 2 = closest (5), Stage 1 = mid (15), Stage 0 = far (30)
 */
export function getStageDistance(stage: number | null, baseUnit: number): number {
  if (stage === null) return baseUnit * 50; // External L1s at the outer edge
  
  switch (stage) {
    case 2:
      return baseUnit * 12;   // Closest to Ethereum
    case 1:
      return baseUnit * 18;   // Medium distance  
    case 0:
    default:
      return baseUnit * 32;   // Furthest L2s
  }
}

/**
 * Connector style by stage
 */
export interface ConnectorStyle {
  strokeDasharray: string | undefined;
  flowDirection: "bidirectional" | "toEthereum";
  strokeWidth: number;
}

export function getConnectorStyle(stage: number | null): ConnectorStyle {
  switch (stage) {
    case 2:
      return {
        strokeDasharray: undefined, // Solid
        flowDirection: "bidirectional",
        strokeWidth: 2,
      };
    case 1:
      return {
        strokeDasharray: "8,4", // Dashed
        flowDirection: "toEthereum",
        strokeWidth: 1.5,
      };
    case 0:
    default:
      return {
        strokeDasharray: "3,6", // Dotted/droplet spacing
        flowDirection: "toEthereum",
        strokeWidth: 1,
      };
  }
}
