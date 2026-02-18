import { useRef, useState, useEffect, useMemo } from "react";
import * as d3 from "d3";
import type { Network } from "../data/types";
import { useForceSimulation } from "../hooks/useForceSimulation";
import { useResponsive } from "../hooks/useResponsive";
import { getNodeColor } from "../utils/scales";
import type { SizeMetric } from "../utils/scales";
import { COLORS, STAGE_COLORS, GRID_COLOR, BG_COLOR } from "../utils/constants";
import { Tooltip } from "./Tooltip";
import { InfoPanel } from "./InfoPanel";

interface Props {
  networks: Network[];
  sizeMetric: SizeMetric;
}

export function TrellisMap({ networks, sizeMetric }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const { width, height } = useResponsive(containerRef);
  const nodes = useForceSimulation(networks, width, height, sizeMetric);
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

  // Bridge volume scale for link widths
  const bridgeScale = useMemo(() => {
    const vols = networks
      .filter((n) => n.monthly_bridge_volume_million_usd)
      .map((n) => n.monthly_bridge_volume_million_usd!);
    return d3.scaleLinear().domain([0, d3.max(vols) || 1]).range([1, 6]);
  }, [networks]);

  // Flow particles state
  const [particlePhase, setParticlePhase] = useState(0);
  useEffect(() => {
    let frame: number;
    const animate = () => {
      setParticlePhase((p) => (p + 0.004) % 1);
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
        </defs>

        <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
          {/* Background grid */}
          {Array.from({ length: Math.ceil(width / 40) + 1 }).map((_, i) => (
            <line key={`gv${i}`} x1={i * 40} y1={0} x2={i * 40} y2={height} stroke={GRID_COLOR} strokeWidth={0.5} />
          ))}
          {Array.from({ length: Math.ceil(height / 40) + 1 }).map((_, i) => (
            <line key={`gh${i}`} x1={0} y1={i * 40} x2={width} y2={i * 40} stroke={GRID_COLOR} strokeWidth={0.5} />
          ))}

          {/* Connection links */}
          {ethereum && nodes.filter((n) => n.network.category === "l2").map((n) => {
            const vol = n.network.monthly_bridge_volume_million_usd || 0;
            const sw = bridgeScale(vol);
            const stage = n.network.security_stage;
            const dash = stage === 2 ? undefined : stage === 1 ? "8,4" : "3,3";
            const ex = ethereum.x || 0;
            const ey = ethereum.y || 0;
            const nx = n.x || 0;
            const ny = n.y || 0;

            // Multiple flow particles along the link
            const particles = [0, 0.33, 0.66].map((offset) => {
              const t = (particlePhase + offset) % 1;
              const px = nx + (ex - nx) * t;
              const py = ny + (ey - ny) * t;
              return { px, py, t };
            });

            return (
              <g key={n.network.name}>
                <line
                  x1={ex} y1={ey}
                  x2={nx} y2={ny}
                  stroke={COLORS.ethereum}
                  strokeWidth={sw}
                  strokeOpacity={0.3}
                  strokeDasharray={dash}
                />
                {/* Flow particles */}
                {particles.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.px}
                    cy={p.py}
                    r={2}
                    fill={COLORS.ethereum}
                    opacity={0.7}
                  />
                ))}
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((n) => {
            const x = n.x || 0;
            const y = n.y || 0;
            const color = getNodeColor(n.network);
            const isEth = n.network.category === "ethereum";
            const stage = n.network.security_stage;
            const stageColor = stage !== null ? STAGE_COLORS[stage as keyof typeof STAGE_COLORS] : null;

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
                {/* Ethereum outer glow */}
                {isEth && (
                  <circle r={n.radius + 15} fill={color} opacity={0.15 * ethPulse} filter="url(#eth-glow)" />
                )}

                {/* Security stage ring */}
                {stageColor && (
                  <circle
                    r={n.radius + 4}
                    fill="none"
                    stroke={stageColor}
                    strokeWidth={3}
                    opacity={0.7}
                  />
                )}

                {/* Main circle */}
                <circle
                  r={n.radius}
                  fill={color}
                  opacity={isEth ? ethPulse * 0.3 + 0.7 : 0.85}
                  filter={isEth ? "url(#eth-glow)" : "url(#node-glow)"}
                />

                {/* Stage icon */}
                {stage !== null && (
                  <text
                    y={-n.radius - 8}
                    textAnchor="middle"
                    fontSize={12}
                    fill="white"
                  >
                    {stage === 0 ? "⚠️" : stage === 1 ? "🔒" : "✅"}
                  </text>
                )}

                {/* Label */}
                <text
                  y={n.radius + 16}
                  textAnchor="middle"
                  fontSize={13}
                  fontWeight={600}
                  fill="white"
                  style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
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
