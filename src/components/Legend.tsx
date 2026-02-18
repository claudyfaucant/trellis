import { COLORS, STAGE_COLORS } from "../utils/constants";

export function Legend() {
  return (
    <div className="absolute bottom-4 left-4 z-40 bg-gray-900/80 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-800 text-xs">
      <div className="font-semibold text-gray-300 mb-2 uppercase tracking-wider">Network Types</div>
      <div className="space-y-1.5 mb-3">
        <LegendItem color={COLORS.ethereum} label="Ethereum" />
        <LegendItem color={COLORS.optimistic_rollup_op} label="Optimistic (OP Stack)" />
        <LegendItem color={COLORS.optimistic_rollup_arbitrum} label="Optimistic (Arbitrum)" />
        <LegendItem color={COLORS.zk_rollup} label="ZK Rollup" />
        <LegendItem color={COLORS.L1} label="External L1" />
      </div>
      <div className="font-semibold text-gray-300 mb-2 uppercase tracking-wider">Security Stages</div>
      <div className="space-y-1.5 mb-3">
        <LegendItem color={STAGE_COLORS[0]} label="Stage 0 — Training Wheels" />
        <LegendItem color={STAGE_COLORS[1]} label="Stage 1 — Safety Net" />
        <LegendItem color={STAGE_COLORS[2]} label="Stage 2 — Full Autonomy" />
      </div>
      <div className="font-semibold text-gray-300 mb-2 uppercase tracking-wider">Connections</div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-gray-400">
          <svg width="24" height="6"><line x1="0" y1="3" x2="24" y2="3" stroke="#627EEA" strokeWidth="2" /></svg>
          <span>Bridge to Ethereum</span>
        </div>
        <div className="text-gray-500">Width = bridge volume</div>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-gray-400">
      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      <span>{label}</span>
    </div>
  );
}
