export const COLORS = {
  ethereum: "#627EEA",
  optimistic_rollup_op: "#FF0420",
  optimistic_rollup_arbitrum: "#28A0F0",
  zk_rollup: "#8B5CF6",
  L1: "#6B7280",
} as const;

export const STAGE_COLORS = {
  0: "#F97316",
  1: "#EAB308",
  2: "#22C55E",
} as const;

export const STAGE_LABELS: Record<number, string> = {
  0: "Stage 0 — Training Wheels",
  1: "Stage 1 — Safety Net",
  2: "Stage 2 — Full Autonomy",
};

export const STAGE_DESCRIPTIONS: Record<number, string> = {
  0: "The rollup is functional but relies on a trusted operator. Think of it as a new highway with construction workers still managing traffic.",
  1: "Fraud proofs are live and permissionless. Safety mechanisms exist but the security council can still intervene. Like a highway with guardrails and emergency services.",
  2: "Fully autonomous — the rollup operates with minimal trust assumptions. The highway is complete, well-maintained, and self-governing.",
};

export const TYPE_LABELS: Record<string, string> = {
  L1: "Layer 1 Blockchain",
  optimistic_rollup_op: "Optimistic Rollup (OP Stack)",
  optimistic_rollup_arbitrum: "Optimistic Rollup (Arbitrum)",
  zk_rollup: "ZK Rollup",
};

export const BG_COLOR = "#0F1117";
export const GRID_COLOR = "#1a1c25";
