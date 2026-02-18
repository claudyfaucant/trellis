import { useState, useMemo } from "react";
import type { Network } from "../data/types";

export type TypeFilter = "all" | "optimistic" | "zk" | "l1";
export type StageFilter = "all" | 0 | 1 | 2;

export function useFilters(networks: Network[]) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [stageFilter, setStageFilter] = useState<StageFilter>("all");

  const filtered = useMemo(() => {
    return networks.filter((n) => {
      // Always show Ethereum
      if (n.category === "ethereum") return true;
      
      // Type filtering
      if (typeFilter === "optimistic" && !n.type.startsWith("optimistic")) return false;
      if (typeFilter === "zk" && n.type !== "zk_rollup") return false;
      if (typeFilter === "l1" && n.type !== "L1") return false;
      
      // Stage filtering (only applies to L2s)
      if (stageFilter !== "all" && n.category === "l2" && n.security_stage !== stageFilter) return false;
      
      return true;
    });
  }, [networks, typeFilter, stageFilter]);

  return {
    typeFilter, setTypeFilter,
    stageFilter, setStageFilter,
    filtered,
  };
}
