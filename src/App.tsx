import { useMemo } from "react";
import { parseNetworks } from "./data/parseData";
import { useFilters } from "./hooks/useFilters";
import { TrellisMap } from "./components/TrellisMap";
import { FilterControls } from "./components/FilterControls";
import { Legend } from "./components/Legend";
import { Header } from "./components/Header";

function App() {
  const networks = useMemo(() => parseNetworks(), []);
  const {
    typeFilter, setTypeFilter,
    stageFilter, setStageFilter,
    filtered,
  } = useFilters(networks);

  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ fontFamily: "'Inter', sans-serif" }}>
      <TrellisMap networks={filtered} />
      <Header />
      <FilterControls
        typeFilter={typeFilter}
        stageFilter={stageFilter}
        onTypeChange={setTypeFilter}
        onStageChange={setStageFilter}
      />
      <Legend />
    </div>
  );
}

export default App;
