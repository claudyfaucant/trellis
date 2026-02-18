import type { TypeFilter, StageFilter } from "../hooks/useFilters";

interface Props {
  typeFilter: TypeFilter;
  stageFilter: StageFilter;
  onTypeChange: (f: TypeFilter) => void;
  onStageChange: (f: StageFilter) => void;
}

function Btn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
        active
          ? "bg-white/15 text-white border border-white/20"
          : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
      }`}
    >
      {children}
    </button>
  );
}

export function FilterControls({
  typeFilter, stageFilter,
  onTypeChange, onStageChange,
}: Props) {
  return (
    <div className="absolute top-4 left-4 z-40 flex flex-wrap gap-4 items-center bg-gray-900/80 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-800">
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-500 mr-1 uppercase tracking-wider">Type</span>
        <Btn active={typeFilter === "all"} onClick={() => onTypeChange("all")}>All</Btn>
        <Btn active={typeFilter === "optimistic"} onClick={() => onTypeChange("optimistic")}>Optimistic</Btn>
        <Btn active={typeFilter === "zk"} onClick={() => onTypeChange("zk")}>ZK</Btn>
        <Btn active={typeFilter === "l1"} onClick={() => onTypeChange("l1")}>L1s</Btn>
      </div>
      <div className="w-px h-6 bg-gray-700" />
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-500 mr-1 uppercase tracking-wider">Stage</span>
        <Btn active={stageFilter === "all"} onClick={() => onStageChange("all")}>All</Btn>
        <Btn active={stageFilter === 0} onClick={() => onStageChange(0)}>0</Btn>
        <Btn active={stageFilter === 1} onClick={() => onStageChange(1)}>1</Btn>
        <Btn active={stageFilter === 2} onClick={() => onStageChange(2)}>2</Btn>
      </div>
      <div className="w-px h-6 bg-gray-700" />
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <span>Size = Stablecoin Liquidity</span>
      </div>
    </div>
  );
}
