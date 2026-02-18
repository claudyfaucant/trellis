export type NetworkType =
  | "L1"
  | "optimistic_rollup_arbitrum"
  | "optimistic_rollup_op"
  | "zk_rollup";

export type NetworkCategory = "ethereum" | "l2" | "external_l1";

export interface Network {
  name: string;
  type: NetworkType;
  tvl_billion_usd: number;
  stablecoin_billion_usd: number;
  daily_transactions_thousands: number;
  security_stage: number | null;
  monthly_bridge_volume_million_usd: number | null;
  category: NetworkCategory;
}
