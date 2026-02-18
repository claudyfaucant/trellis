import type { Network } from "../data/types";
import { TYPE_LABELS, STAGE_LABELS, STAGE_DESCRIPTIONS, STAGE_COLORS } from "../utils/constants";
import { getNodeColor } from "../utils/scales";

interface Props {
  network: Network;
  onClose: () => void;
}

export function InfoPanel({ network, onClose }: Props) {
  const color = getNodeColor(network);

  return (
    <div className="fixed top-0 right-0 w-96 h-full bg-gray-900/98 border-l border-gray-800 shadow-2xl z-50 overflow-y-auto backdrop-blur-md">
      <div className="p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
        >
          ✕
        </button>
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-8 h-8 rounded-full"
            style={{ backgroundColor: color, boxShadow: `0 0 20px ${color}60` }}
          />
          <h2 className="text-2xl font-bold text-white">{network.name}</h2>
        </div>

        <div className="text-gray-400 text-sm mb-6">{TYPE_LABELS[network.type]}</div>

        {network.category === "l2" && (
          <div className="mb-6 p-4 bg-gray-800/60 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">What is this?</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              {network.type.startsWith("optimistic")
                ? "An Optimistic Rollup is like a satellite town that sends its records to the main city (Ethereum) for safekeeping. Transactions are assumed honest, but anyone can challenge them within a dispute window."
                : "A ZK Rollup is like a satellite town that proves mathematically to the main city (Ethereum) that all its transactions are valid — no trust required, just math."}
            </p>
          </div>
        )}

        <div className="space-y-4">
          {network.tvl_billion_usd > 0 && (
            <Stat label="Total Value Locked" value={`$${network.tvl_billion_usd.toFixed(2)}B`} />
          )}
          {network.stablecoin_billion_usd > 0 && (
            <Stat label="Stablecoin Market Cap" value={`$${network.stablecoin_billion_usd.toFixed(2)}B`} />
          )}
          {network.daily_transactions_thousands > 0 && (
            <Stat label="Daily Transactions" value={`${network.daily_transactions_thousands.toLocaleString()}K`} />
          )}
          {network.monthly_bridge_volume_million_usd && (
            <Stat label="Monthly Bridge Volume" value={`$${network.monthly_bridge_volume_million_usd}M`} />
          )}
        </div>

        {network.security_stage !== null && (
          <div className="mt-6 p-4 rounded-lg border" style={{ borderColor: STAGE_COLORS[network.security_stage as keyof typeof STAGE_COLORS] + "60" }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{network.security_stage === 0 ? "⚠️" : network.security_stage === 1 ? "🔒" : "✅"}</span>
              <span className="font-semibold text-white">{STAGE_LABELS[network.security_stage]}</span>
            </div>
            <p className="text-sm text-gray-400">{STAGE_DESCRIPTIONS[network.security_stage]}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-800">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm font-semibold text-white font-mono">{value}</span>
    </div>
  );
}
