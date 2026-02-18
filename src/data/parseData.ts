import Papa from "papaparse";
import type { Network, NetworkType, NetworkCategory } from "./types";
import csvData from "./networks.csv?raw";

interface RawRow {
  network_name: string;
  type: string;
  tvl_billion_usd: string;
  stablecoin_billion_usd: string;
  daily_transactions_thousands: string;
  security_stage: string;
  monthly_bridge_volume_million_usd: string;
}

function deriveCategory(name: string, type: string): NetworkCategory {
  if (name === "Ethereum") return "ethereum";
  if (type === "L1") return "external_l1";
  return "l2";
}

export function parseNetworks(): Network[] {
  const parsed = Papa.parse<RawRow>(csvData, {
    header: true,
    skipEmptyLines: true,
  });

  return parsed.data.map((row) => ({
    name: row.network_name,
    type: row.type as NetworkType,
    tvl_billion_usd: parseFloat(row.tvl_billion_usd) || 0,
    stablecoin_billion_usd: parseFloat(row.stablecoin_billion_usd) || 0,
    daily_transactions_thousands: parseFloat(row.daily_transactions_thousands) || 0,
    security_stage: row.security_stage && !isNaN(Number(row.security_stage))
      ? Number(row.security_stage)
      : null,
    monthly_bridge_volume_million_usd:
      row.monthly_bridge_volume_million_usd && row.monthly_bridge_volume_million_usd !== "N/A"
        ? parseFloat(row.monthly_bridge_volume_million_usd)
        : null,
    category: deriveCategory(row.network_name, row.type),
  }));
}
