import * as d3 from "d3";
import type { Network } from "../data/types";
import { COLORS } from "./constants";

export type SizeMetric = "tvl" | "stablecoins" | "transactions";

export function getMetricValue(n: Network, metric: SizeMetric): number {
  switch (metric) {
    case "tvl": return n.tvl_billion_usd;
    case "stablecoins": return n.stablecoin_billion_usd;
    case "transactions": return n.daily_transactions_thousands;
  }
}

export function createRadiusScale(networks: Network[], metric: SizeMetric) {
  const values = networks.map((n) => getMetricValue(n, metric)).filter((v) => v > 0);
  return d3.scaleSqrt()
    .domain([0, d3.max(values) || 1])
    .range([20, 120]);
}

export function getNodeColor(n: Network): string {
  if (n.category === "ethereum") return COLORS.ethereum;
  return COLORS[n.type] || COLORS.L1;
}
