import type { Network } from "../data/types";
import { TYPE_LABELS, STAGE_LABELS } from "../utils/constants";

interface Props {
  network: Network;
  x: number;
  y: number;
}

export function Tooltip({ network, x, y }: Props) {
  return (
    <div
      className="absolute pointer-events-none bg-gray-900/95 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white shadow-xl backdrop-blur-sm z-50 min-w-[220px]"
      style={{
        left: x + 16,
        top: y - 20,
        transform: x > window.innerWidth / 2 ? "translateX(-110%)" : undefined,
      }}
    >
      <div className="font-semibold text-base mb-2">{network.name}</div>
      <div className="text-gray-400 text-xs mb-2">{TYPE_LABELS[network.type]}</div>
      <div className="space-y-1 font-mono text-xs">
        {network.tvl_billion_usd > 0 && (
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">TVL</span>
            <span>${network.tvl_billion_usd.toFixed(2)}B</span>
          </div>
        )}
        {network.stablecoin_billion_usd > 0 && (
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">Stablecoins</span>
            <span>${network.stablecoin_billion_usd.toFixed(2)}B</span>
          </div>
        )}
        {network.daily_transactions_thousands > 0 && (
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">Daily Txns</span>
            <span>{network.daily_transactions_thousands.toLocaleString()}K</span>
          </div>
        )}
        {network.security_stage !== null && (
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">Security</span>
            <span>{STAGE_LABELS[network.security_stage]}</span>
          </div>
        )}
      </div>
    </div>
  );
}
