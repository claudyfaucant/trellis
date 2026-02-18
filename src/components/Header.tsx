export function Header() {
  return (
    <div className="absolute top-4 right-4 z-40 max-w-sm">
      <div className="bg-gray-900/85 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-800">
        <h1 className="text-white font-bold text-lg mb-2">The Trellis</h1>
        <p className="text-gray-400 text-xs leading-relaxed">
          An interactive force-directed visualization mapping the Ethereum Layer 2 ecosystem. 
          Shows the relationship between Ethereum, its rollups, and competing L1 blockchains, 
          with visual encoding for security maturity, network type, and economic activity.
        </p>
      </div>
    </div>
  );
}
