import { useMemo } from "react";
import { parseNetworks } from "./data/parseData";
import { useFilters } from "./hooks/useFilters";
import { TrellisMap } from "./components/TrellisMap";
import { FilterControls } from "./components/FilterControls";
import { Legend } from "./components/Legend";

function App() {
  const networks = useMemo(() => parseNetworks(), []);
  const {
    typeFilter, setTypeFilter,
    stageFilter, setStageFilter,
    sizeMetric, setSizeMetric,
    filtered,
  } = useFilters(networks);

  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ fontFamily: "'Inter', sans-serif" }}>
      <TrellisMap networks={filtered} sizeMetric={sizeMetric} />
      <FilterControls
        typeFilter={typeFilter}
        stageFilter={stageFilter}
        sizeMetric={sizeMetric}
        onTypeChange={setTypeFilter}
        onStageChange={setStageFilter}
        onMetricChange={setSizeMetric}
      />
      <Legend />
      <div className="absolute bottom-4 right-4 z-40 text-gray-600 text-xs">
        The Trellis — Ethereum L2 Ecosystem Map
      </div>
    </div>
  );
}

export default App;
