# Trellis — Ethereum L2 Ecosystem Visualization

An interactive force-directed visualization mapping Ethereum's Layer 2 ecosystem, showing network relationships, security stages, and liquidity flows.

![Trellis Screenshot](docs/screenshot.png)

## 🎯 What This Shows

Trellis visualizes the **security and liquidity landscape** of Ethereum rollups and competing L1s:

- **Ethereum** sits at the center — the settlement layer everything connects to
- **L2 rollups** orbit Ethereum at distances proportional to their **security stage**
- **External L1s** (Bitcoin, Solana, etc.) appear at the outer edge
- **Shape size** reflects **stablecoin liquidity** — more stablecoins = larger shape

## 🔷 Visual Language

### Shapes by Network Type

| Shape | Network Type | Examples |
|-------|--------------|----------|
| ✦ Star (8-point) | Ethereum | Ethereum Mainnet |
| ⬡ Hexagon | OP Stack | Base, OP Mainnet, Blast, Zora |
| ◆ Diamond | Orbit (Arbitrum) | Arbitrum One |
| ⬠ Pentagon | ZK Rollup | zkSync Era, Starknet, Scroll, Linea |
| ● Circle | Other L1 | Bitcoin, Solana, Avalanche |

### Distance = Security Stage (L2s only)

| Stage | Distance from ETH | Connector | Meaning |
|-------|-------------------|-----------|---------|
| Stage 2 ✅ | 5 (closest) | Solid line, bidirectional | Full decentralization — fraud/validity proofs live, no security council override |
| Stage 1 🔒 | 15 | Dashed line | Safety net — proofs work but security council can intervene |
| Stage 0 ⚠️ | 30 (furthest) | Droplets → ETH | Training wheels — still relies on trusted operator |

*Note: As of Feb 2025, no major rollup has achieved Stage 2. Arbitrum, Base, OP Mainnet, and Scroll are at Stage 1.*

### Size = Stablecoin Liquidity

All shapes are scaled proportionally to **stablecoin market cap** on that network:
- More stablecoins = larger shape
- Reflects real economic activity and trust in the network

### Flow Animation

- **Stage 0/1**: Droplet particles flow **toward Ethereum** (value seeking security)
- **Stage 2**: Bidirectional flow (mature, integrated ecosystem)

## 📊 Data Sources

| Metric | Source | Update Frequency |
|--------|--------|------------------|
| TVL (Total Value Locked) | [DefiLlama](https://defillama.com/) | Daily |
| Stablecoin Market Cap | [DefiLlama Stablecoins](https://defillama.com/stablecoins) | Daily |
| Security Stage | [L2Beat](https://l2beat.com/) | As updated |
| Bridge Volume | [DefiLlama Bridges](https://defillama.com/bridges) | Daily |
| Transaction Count | Chain explorers | Daily |

## 🔧 Data Schema

```typescript
interface Network {
  name: string;
  type: "L1" | "optimistic_rollup_op" | "optimistic_rollup_arbitrum" | "zk_rollup";
  category: "ethereum" | "l2" | "external_l1";
  tvl_billion_usd: number;
  stablecoin_billion_usd: number;           // Used for sizing
  daily_transactions_thousands: number;
  security_stage: 0 | 1 | 2 | null;         // null for L1s
  monthly_bridge_volume_million_usd: number | null;
}
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

## 🏗️ Architecture

```
src/
├── components/
│   ├── TrellisMap.tsx    # Main D3 visualization
│   ├── NetworkShape.tsx   # SVG shape renderer by type
│   ├── Tooltip.tsx        # Hover details
│   └── InfoPanel.tsx      # Click-through details
├── data/
│   ├── networks.csv       # Source data
│   ├── types.ts           # TypeScript interfaces
│   └── parseData.ts       # CSV → typed objects
├── hooks/
│   └── useForceSimulation.ts  # D3 force layout
└── utils/
    ├── constants.ts       # Colors, labels
    ├── scales.ts          # Size/color scales
    └── shapes.ts          # SVG path generators
```

## 📐 Design Decisions

1. **Force simulation** keeps nodes from overlapping while respecting stage-distance constraints
2. **Stage distance is semantic** — closer to ETH = more secure = more "native"
3. **Stablecoin sizing** chosen over TVL because stablecoins better represent actual usage/trust
4. **Shapes differentiate tech stacks** — instantly see if a network is OP, Arbitrum, or ZK-based
5. **Flow direction** shows value movement — Stage 0 funds flow toward ETH security

## 📋 Full Specification

For complete technical specification to recreate this project, see:

**[docs/SPECIFICATION.md](docs/SPECIFICATION.md)**

Covers:
- Visual design rules (shapes, colors, distances, connectors)
- Data model and sources
- Force simulation parameters
- Interaction patterns
- Accessibility requirements

## 🎨 Customization

Edit `src/utils/constants.ts` for colors:

```typescript
export const COLORS = {
  ethereum: "#627EEA",
  optimistic_rollup_op: "#FF0420",
  optimistic_rollup_arbitrum: "#28A0F0",
  zk_rollup: "#8B5CF6",
  L1: "#6B7280",
};
```

## 📝 License

MIT

---

Built for [Enterprise Ethereum Alliance](https://entethalliance.org)
