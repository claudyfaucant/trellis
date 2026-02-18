import { useRef, useState, useEffect, useMemo } from "react";
import * as d3 from "d3";
import type { Network } from "../data/types";
import { useForceSimulation } from "../hooks/useForceSimulation";
import { useResponsive } from "../hooks/useResponsive";
import { COLORS, GRID_COLOR, BG_COLOR } from "../utils/constants";
import { getConnectorStyle } from "../utils/shapes";
import { NetworkShape } from "./NetworkShape";
import { Tooltip } from "./Tooltip";
import { InfoPanel } from "./InfoPanel";

interface Props {
  networks: Network[];
}

/**
 * Main visualization component.
 * 
 * Visual rules:
 * - Ethereum at center (8-point star)
 * - L2s orbit at stage-based distances: Stage 2 (5), Stage 1 (15), Stage 0 (30)
 * - Shapes by type: OP=hexagon, Arbitrum=diamond, ZK=pentagon, L1=circle
 * - Size proportional to stablecoin liquidity
 * - Connectors: Stage 2=solid bidirectional, Stage 1=dashed, Stage 0=droplets→ETH
 */
export function TrellisMap({ networks }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const { width, height } = useResponsive(containerRef);
  const nodes = useForceSimulation(networks, width, height);
  const [hoveredNode, setHoveredNode] = useState<{ network: Network; x: number; y: number } | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [transform, setTransform] = useState(d3.zoomIdentity);

  // Zoom & Pan
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 4])
      .on("zoom", (event) => {
        setTransform(event.transform);
      });
    svg.call(zoom);
    return () => { svg.on(".zoom", null); };
  }, [width, height]);

  const ethereum = useMemo(() => nodes.find((n) => n.network.category === "ethereum"), [nodes]);

  // Animation phase for flow particles
  const [particlePhase, setParticlePhase] = useState(0);
  useEffect(() => {
    let frame: number;
    const animate = () => {
      setParticlePhase((p) => (p + 0.003) % 1);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Ethereum glow pulse
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    let frame: number;
    const animate = () => {
      setPulse(Date.now());
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);
  const ethPulse = 0.6 + 0.4 * Math.sin(pulse / 500);

  return (
    <div ref={containerRef} className="w-full h-full relative" style={{ background: BG_COLOR }}>
      <svg ref={svgRef} width={width} height={height} className="absolute inset-0">
        <defs>
          {/* Ethereum glow filter */}
          <filter id="eth-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Node glow */}
          <filter id="node-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Droplet marker for Stage 0 */}
          <marker
            id="droplet"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <circle cx="5" cy="5" r="3" fill={COLORS.ethereum} opacity="0.8" />
          </marker>
          {/* Arrow marker for bidirectional Stage 2 */}
          <marker
            id="arrow-end"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.ethereum} opacity="0.6" />
          </marker>
          <marker
            id="arrow-start"
            viewBox="0 0 10 10"
            refX="1"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 10 0 L 0 5 L 10 10 z" fill={COLORS.ethereum} opacity="0.6" />
          </marker>
        </defs>

        <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
          {/* Background grid */}
          {Array.from({ length: Math.ceil(width / 40) + 1 }).map((_, i) => (
            <line key={`gv${i}`} x1={i * 40} y1={0} x2={i * 40} y2={height} stroke={GRID_COLOR} strokeWidth={0.5} />
          ))}
          {Array.from({ length: Math.ceil(height / 40) + 1 }).map((_, i) => (
            <line key={`gh${i}`} x1={0} y1={i * 40} x2={width} y2={i * 40} stroke={GRID_COLOR} strokeWidth={0.5} />
          ))}

          {/* Stage orbit rings (visual guide) */}
          {ethereum && [10, 22, 40].map((dist) => {
            const baseUnit = Math.min(width, height) / 100;
            const r = dist * baseUnit;
            return (
              <circle
                key={`orbit-${dist}`}
                cx={ethereum.x || 0}
                cy={ethereum.y || 0}
                r={r}
                fill="none"
                stroke={GRID_COLOR}
                strokeWidth={1}
                strokeDasharray="4,8"
                opacity={0.4}
              />
            );
          })}

          {/* Connection links from L2s to Ethereum - rendered BEFORE nodes */}
          {ethereum && nodes.filter((n) => n.network.category === "l2").map((n) => {
            const stage = n.network.security_stage ?? 0;
            const style = getConnectorStyle(stage);
            const ex = ethereum.x || 0;
            const ey = ethereum.y || 0;
            const nx = n.x || 0;
            const ny = n.y || 0;

            // Calculate line endpoints (offset from node edges)
            const dx = ex - nx;
            const dy = ey - ny;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist === 0) return null;
            const ux = dx / dist;
            const uy = dy / dist;
            
            // Start from edge of L2 node, end at edge of Ethereum
            const startX = nx + ux * (n.radius + 8);
            const startY = ny + uy * (n.radius + 8);
            const endX = ex - ux * (ethereum.radius + 8);
            const endY = ey - uy * (ethereum.radius + 8);

            // Check if connector would overlap with other nodes
            // If so, reduce opacity
            const otherNodes = nodes.filter(
              (other) => other.network.name !== n.network.name && 
                         other.network.category !== "ethereum"
            );
            
            let hasOverlap = false;
            for (const other of otherNodes) {
              const ox = other.x || 0;
              const oy = other.y || 0;
              // Distance from point to line segment
              const t = Math.max(0, Math.min(1, 
                ((ox - startX) * (endX - startX) + (oy - startY) * (endY - startY)) / 
                ((endX - startX) ** 2 + (endY - startY) ** 2)
              ));
              const nearX = startX + t * (endX - startX);
              const nearY = startY + t * (endY - startY);
              const distToLine = Math.sqrt((ox - nearX) ** 2 + (oy - nearY) ** 2);
              if (distToLine < other.radius + 5) {
                hasOverlap = true;
                break;
              }
            }

            const baseOpacity = hasOverlap ? 0.15 : 0.3;

            // Flow particles (always toward Ethereum for Stage 0/1)
            const particleCount = stage === 2 ? 4 : 3;
            const particles = Array.from({ length: particleCount }).map((_, i) => {
              const offset = i / particleCount;
              let t = (particlePhase + offset) % 1;
              
              // Stage 2: bidirectional (alternate directions)
              if (stage === 2 && i % 2 === 1) {
                t = 1 - t;
              }
              
              const px = startX + (endX - startX) * t;
              const py = startY + (endY - startY) * t;
              return { px, py };
            });

            return (
              <g key={n.network.name} opacity={hasOverlap ? 0.5 : 1}>
                {/* Main connector line */}
                <line
                  x1={startX} y1={startY}
                  x2={endX} y2={endY}
                  stroke={COLORS.ethereum}
                  strokeWidth={style.strokeWidth}
                  strokeOpacity={baseOpacity}
                  strokeDasharray={style.strokeDasharray}
                  markerEnd={stage === 2 ? "url(#arrow-end)" : undefined}
                  markerStart={stage === 2 ? "url(#arrow-start)" : undefined}
                />
                {/* Flow particles / droplets */}
                {particles.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.px}
                    cy={p.py}
                    r={stage === 0 ? 4 : stage === 1 ? 3 : 2.5}
                    fill={COLORS.ethereum}
                    opacity={(stage === 0 ? 0.9 : 0.7) * (hasOverlap ? 0.5 : 1)}
                  />
                ))}
              </g>
            );
          })}

          {/* Network nodes */}
          {nodes.map((n) => {
            const x = n.x || 0;
            const y = n.y || 0;
            const isEth = n.network.category === "ethereum";

            return (
              <g
                key={n.network.name}
                transform={`translate(${x},${y})`}
                style={{ cursor: "pointer" }}
                onMouseEnter={(e) => setHoveredNode({ network: n.network, x: e.clientX, y: e.clientY })}
                onMouseMove={(e) => setHoveredNode({ network: n.network, x: e.clientX, y: e.clientY })}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => setSelectedNetwork(n.network)}
              >
                {/* Main shape */}
                <NetworkShape
                  network={n.network}
                  radius={n.radius}
                  pulse={isEth ? ethPulse : 1}
                />

                {/* Ethereum logo */}
                {isEth && (
                  <g transform={`scale(${n.radius / 40})`}>
                    <path
                      d="M0,-32 L18,0 L0,12 L-18,0 Z"
                      fill="white"
                      opacity={0.9}
                    />
                    <path
                      d="M0,12 L18,0 L0,32 L-18,0 Z"
                      fill="white"
                      opacity={0.6}
                    />
                  </g>
                )}

                {/* Network name label */}
                <text
                  y={n.radius + 18}
                  textAnchor="middle"
                  fontSize={13}
                  fontWeight={600}
                  fill="white"
                  style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}
                >
                  {n.network.name}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {hoveredNode && <Tooltip network={hoveredNode.network} x={hoveredNode.x} y={hoveredNode.y} />}
      {selectedNetwork && <InfoPanel network={selectedNetwork} onClose={() => setSelectedNetwork(null)} />}
    </div>
  );
}
