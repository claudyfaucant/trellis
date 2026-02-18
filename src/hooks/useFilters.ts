import { useState, useMemo } from "react";
import type { Network } from "../data/types";
import type { SizeMetric } from "../utils/scales";

export type TypeFilter = "all" | "optimistic" | "zk" | "l1";
export type StageFilter = "all" | 0 | 1 | 2;

export function useFilters(networks: Network[]) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [stageFilter, setStageFilter] = useState<StageFilter>("all");
  const [sizeMetric, setSizeMetric] = useState<SizeMetric>("tvl");

  const filtered = useMemo(() => {
    return networks.filter((n) => {
      if (typeFilter === "optimistic" && !n.type.startsWith("optimistic")) return false;
      if (typeFilter === "zk" && n.type !== "zk_rollup") return false;
      if (typeFilter === "l1" && n.type !== "L1") return false;
      if (stageFilter !== "all" && n.security_stage !== stageFilter && n.category === "l2") return false;
      return true;
    });
  }, [networks, typeFilter, stageFilter]);

  return {
    typeFilter, setTypeFilter,
    stageFilter, setStageFilter,
    sizeMetric, setSizeMetric,
    filtered,
  };
}
