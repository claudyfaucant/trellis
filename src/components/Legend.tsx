import { COLORS, STAGE_COLORS } from "../utils/constants";

export function Legend() {
  return (
    <div className="absolute bottom-4 left-4 z-40 bg-gray-900/80 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-800 text-xs max-w-xs">
      {/* Shapes by Network Type */}
      <div className="font-semibold text-gray-300 mb-2 uppercase tracking-wider">Shapes</div>
      <div className="space-y-1.5 mb-3">
        <ShapeItem shape="circle" color={COLORS.ethereum} label="Ethereum / L1" />
        <ShapeItem shape="hexagon" color={COLORS.optimistic_rollup_op} label="OP Stack" />
        <ShapeItem shape="diamond" color={COLORS.optimistic_rollup_arbitrum} label="Arbitrum Orbit" />
        <ShapeItem shape="pentagon" color={COLORS.zk_rollup} label="ZK Rollup" />
      </div>

      {/* Security Stages */}
      <div className="font-semibold text-gray-300 mb-2 uppercase tracking-wider">Security Stages</div>
      <div className="space-y-1.5 mb-3">
        <StageItem stage={2} label="Stage 2 — Closest to ETH" />
        <StageItem stage={1} label="Stage 1 — Mid distance" />
        <StageItem stage={0} label="Stage 0 — Furthest" />
      </div>

      {/* Sizing */}
      <div className="font-semibold text-gray-300 mb-2 uppercase tracking-wider">Size</div>
      <div className="text-gray-400 mb-3">
        Shape area = Stablecoin liquidity
      </div>

      {/* Connections */}
      <div className="font-semibold text-gray-300 mb-2 uppercase tracking-wider">Connectors</div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-gray-400">
          <svg width="32" height="10" className="flex-shrink-0">
            <line x1="0" y1="5" x2="32" y2="5" stroke="#627EEA" strokeWidth="2" />
            <polygon points="28,2 32,5 28,8" fill="#627EEA" />
            <polygon points="4,2 0,5 4,8" fill="#627EEA" />
          </svg>
          <span>Stage 2: Bidirectional</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <svg width="32" height="10" className="flex-shrink-0">
            <line x1="0" y1="5" x2="32" y2="5" stroke="#627EEA" strokeWidth="1.5" strokeDasharray="6,3" />
          </svg>
          <span>Stage 1: Dashed</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <svg width="32" height="10" className="flex-shrink-0">
            <circle cx="6" cy="5" r="3" fill="#627EEA" />
            <circle cx="18" cy="5" r="3" fill="#627EEA" opacity="0.7" />
            <circle cx="30" cy="5" r="3" fill="#627EEA" opacity="0.4" />
          </svg>
          <span>Stage 0: Droplets → ETH</span>
        </div>
      </div>

      {/* Data Sources */}
      <div className="mt-4 pt-3 border-t border-gray-700">
        <div className="text-gray-500 text-[10px] space-y-0.5">
          <div>Data: <a href="https://l2beat.com" target="_blank" rel="noopener" className="text-blue-400 hover:underline">L2Beat</a> (stages, TVL)</div>
          <div><a href="https://defillama.com" target="_blank" rel="noopener" className="text-blue-400 hover:underline">DefiLlama</a> (stablecoins)</div>
        </div>
      </div>
    </div>
  );
}

function ShapeItem({ shape, color, label }: { shape: string; color: string; label: string }) {
  const renderShape = () => {
    const size = 14;
    switch (shape) {
      case "hexagon":
        return (
          <svg width={size} height={size} viewBox="-8 -8 16 16">
            <path d="M 0,-7 L 6,-3.5 L 6,3.5 L 0,7 L -6,3.5 L -6,-3.5 Z" fill={color} />
          </svg>
        );
      case "diamond":
        return (
          <svg width={size} height={size} viewBox="-8 -8 16 16">
            <path d="M 0,-7 L 7,0 L 0,7 L -7,0 Z" fill={color} />
          </svg>
        );
      case "pentagon":
        return (
          <svg width={size} height={size} viewBox="-8 -8 16 16">
            <path d="M 0,-7 L 6.5,-2 L 4,6 L -4,6 L -6.5,-2 Z" fill={color} />
          </svg>
        );
      case "circle":
      default:
        return <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />;
    }
  };

  return (
    <div className="flex items-center gap-2 text-gray-400">
      <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
        {renderShape()}
      </div>
      <span>{label}</span>
    </div>
  );
}

function StageItem({ stage, label }: { stage: number; label: string }) {
  const color = STAGE_COLORS[stage as keyof typeof STAGE_COLORS];
  const icon = stage === 0 ? "⚠️" : stage === 1 ? "🔒" : "✅";
  
  return (
    <div className="flex items-center gap-2 text-gray-400">
      <div 
        className="w-3 h-3 rounded-full flex-shrink-0 border-2" 
        style={{ borderColor: color, backgroundColor: 'transparent' }} 
      />
      <span className="text-xs">{icon}</span>
      <span>{label}</span>
    </div>
  );
}
