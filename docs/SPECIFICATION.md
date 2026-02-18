# Trellis Specification Document

> Complete specification for recreating the Ethereum L2 Ecosystem Visualization

## 1. Overview

**Trellis** is an interactive force-directed visualization that maps the Ethereum Layer 2 ecosystem. It shows the relationship between Ethereum, its rollups, and competing L1 blockchains, with visual encoding for security maturity, network type, and economic activity.

### 1.1 Purpose

- Visualize L2 security stages relative to Ethereum
- Compare rollup architectures (OP Stack, Arbitrum Orbit, ZK)
- Show relative economic activity via stablecoin liquidity
- Provide interactive exploration of the ecosystem

---

## 2. Visual Design Specification

### 2.1 Layout

| Element | Position | Behavior |
|---------|----------|----------|
| Ethereum | Fixed center | Anchor point, does not move |
| L2 Rollups | Orbital rings around ETH | Distance based on security stage |
| External L1s | Outer edge | Furthest from center |

**Canvas:**
- Dark background: `#0F1117`
- Grid overlay: `#1a1c25`, 40px spacing, 0.5px stroke
- Full viewport (responsive)

### 2.2 Distance Rules (from Ethereum center)

Distance is measured in "base units" where `1 base unit = min(viewport_width, viewport_height) / 100`.

| Category | Security Stage | Distance (base units) |
|----------|---------------|----------------------|
| Ethereum | — | 0 (center, fixed) |
| L2 Rollup | Stage 2 | 5 |
| L2 Rollup | Stage 1 | 15 |
| L2 Rollup | Stage 0 | 30 |
| External L1 | — | 55 |

### 2.3 Shape Encoding

Each network type has a distinct shape:

| Network Type | Shape | SVG Definition |
|--------------|-------|----------------|
| Ethereum | Circle | `<circle>` |
| OP Stack (Optimism, Base, etc.) | Hexagon (6 sides) | Regular polygon, flat top |
| Arbitrum Orbit | Diamond (4 sides) | Square rotated 45° |
| ZK Rollup | Pentagon (5 sides) | Regular polygon, point up |
| External L1 | Circle | `<circle>` |

**Shape generation formula (regular polygon):**
```
For n-sided polygon with radius r:
for i in 0..n:
    angle = (i * 2π / n) - π/2  // Start from top
    x = r * cos(angle)
    y = r * sin(angle)
```

### 2.4 Size Encoding

**All shapes are sized proportionally to stablecoin market cap.**

| Metric | Source | Usage |
|--------|--------|-------|
| `stablecoin_billion_usd` | DefiLlama | Determines node radius |

**Radius calculation:**
```
scale = d3.scaleSqrt()
    .domain([0, max(stablecoin values)])
    .range([20, 120])  // min 20px, max 120px radius

radius = scale(network.stablecoin_billion_usd)
```

### 2.5 Color Encoding

**Network type colors:**

| Type | Hex Color | Usage |
|------|-----------|-------|
| Ethereum | `#627EEA` | Node fill, connectors |
| OP Stack | `#FF0420` | Node fill |
| Arbitrum Orbit | `#28A0F0` | Node fill |
| ZK Rollup | `#8B5CF6` | Node fill |
| External L1 | `#6B7280` | Node fill |

**Security stage ring colors:**

| Stage | Hex Color | Meaning |
|-------|-----------|---------|
| Stage 0 | `#F97316` | Orange - Training wheels |
| Stage 1 | `#EAB308` | Yellow - Safety net |
| Stage 2 | `#22C55E` | Green - Full autonomy |

### 2.6 Connector Styles

Connectors link L2s to Ethereum:

| Stage | Line Style | Flow Animation | Arrow Markers |
|-------|------------|----------------|---------------|
| Stage 2 | Solid | Bidirectional particles | Both ends |
| Stage 1 | Dashed (`8,4`) | Particles toward ETH | None |
| Stage 0 | Dotted (`3,6`) | Droplets toward ETH | None |

**Connector specifications:**
- Color: Ethereum blue (`#627EEA`)
- Opacity: 0.35
- Width: Stage 2 = 2px, Stage 1 = 1.5px, Stage 0 = 1px
- Start/end offset: 5px from node edge

**Particle animation:**
- 3-4 particles per connector
- Animation speed: phase += 0.003 per frame
- Particle radius: Stage 0 = 4px, Stage 1 = 3px, Stage 2 = 2.5px

### 2.7 Special Effects

**Ethereum glow:**
- Pulsing effect: `opacity = 0.6 + 0.4 * sin(time / 500)`
- Outer glow: +20px radius, 12% opacity
- Inner glow: +8px radius, 25% opacity
- Filter: Gaussian blur 12px

**Node glow (all others):**
- Filter: Gaussian blur 4px

**Security stage ring:**
- Radius: node radius + 5px
- Stroke width: 3px
- Opacity: 0.8

### 2.8 Labels

**Network name:**
- Position: Below node, offset = radius + 18px
- Font: 13px, weight 600
- Color: White
- Shadow: `0 1px 4px rgba(0,0,0,0.9)`

**Stage indicator (emoji):**
- Position: Above node, offset = -(radius + 10px)
- Stage 0: ⚠️
- Stage 1: 🔒
- Stage 2: ✅

---

## 3. Data Model

### 3.1 Network Schema

```typescript
interface Network {
  name: string;                              // Display name
  type: NetworkType;                         // Determines shape
  category: "ethereum" | "l2" | "external_l1";
  tvl_billion_usd: number;                   // Total Value Locked
  stablecoin_billion_usd: number;            // Stablecoin market cap (sizing)
  daily_transactions_thousands: number;       // Activity metric
  security_stage: 0 | 1 | 2 | null;          // null for L1s
  monthly_bridge_volume_million_usd: number | null;
}

type NetworkType = 
  | "L1"                        // External L1 (circle)
  | "optimistic_rollup_op"      // OP Stack (hexagon)
  | "optimistic_rollup_arbitrum" // Arbitrum Orbit (diamond)
  | "zk_rollup";                // ZK Rollup (pentagon)
```

### 3.2 Data Sources

| Field | Source | URL |
|-------|--------|-----|
| Security Stage | L2Beat | https://l2beat.com/scaling/summary |
| TVL | DefiLlama | https://defillama.com/ |
| Stablecoin Market Cap | DefiLlama | https://defillama.com/stablecoins |
| Bridge Volume | DefiLlama | https://defillama.com/bridges |
| Transaction Count | Chain explorers | Various |

### 3.3 Network Selection Criteria

Include:
1. **Top 10 rollups by TVL** from L2Beat
2. **Additional networks:** Celo, Mantle, World Chain, Polygon POS
3. **External L1s for comparison:** Bitcoin, Solana, Tron

Exclude:
- Validiums (off-chain DA)
- Sidechains without Ethereum settlement
- Testnets

---

## 4. Interaction Specification

### 4.1 Pan & Zoom

- **Zoom range:** 0.3x to 4x
- **Implementation:** D3 zoom behavior
- **Gesture:** Mouse wheel / pinch

### 4.2 Hover

- **Trigger:** Mouse enter on node
- **Effect:** Show tooltip with network details
- **Tooltip content:**
  - Network name
  - Type (human readable)
  - Security stage (if L2)
  - TVL
  - Stablecoin market cap
  - Daily transactions

### 4.3 Click

- **Trigger:** Click on node
- **Effect:** Open info panel (sidebar or modal)
- **Panel content:**
  - Full network details
  - Stage explanation
  - External links (L2Beat, explorer)

### 4.4 Filters

**Type filter:**
- All | Optimistic | ZK | L1s
- Implementation: Filter `networks` array before rendering

**Stage filter:**
- All | Stage 0 | Stage 1 | Stage 2
- Only applies to L2s (Ethereum always visible)

---

## 5. Force Simulation

### 5.1 Forces Applied

```typescript
simulation = d3.forceSimulation(nodes)
  .force("collision", d3.forceCollide()
    .radius(d => d.radius + 8)
    .strength(0.9))
  .force("radial", d3.forceRadial()
    .radius(d => d.targetDistance)
    .x(centerX)
    .y(centerY)
    .strength(0.8))
  .force("center", d3.forceCenter(centerX, centerY)
    .strength(0.01))
  .force("charge", d3.forceManyBody()
    .strength(-30)
    .distanceMax(100));
```

### 5.2 Node Initialization

```typescript
// Ethereum: fixed at center
if (category === "ethereum") {
  node.x = centerX;
  node.y = centerY;
  node.fx = centerX;  // Fixed
  node.fy = centerY;
}

// Others: distribute around target orbit
else {
  const angle = (index / totalNodes) * 2π + random(0, 0.3);
  node.x = centerX + cos(angle) * targetDistance;
  node.y = centerY + sin(angle) * targetDistance;
}
```

### 5.3 Simulation Parameters

| Parameter | Value |
|-----------|-------|
| Alpha (initial) | 0.8 |
| Alpha decay | 0.015 |
| Alpha min | 0.001 |

---

## 6. Responsive Behavior

### 6.1 Viewport Adaptation

- Base unit scales with viewport: `min(width, height) / 100`
- Distances remain proportional
- Node sizes remain absolute (20-120px)

### 6.2 Breakpoints

| Viewport | Adjustments |
|----------|-------------|
| < 768px | Legend collapses, smaller fonts |
| < 480px | Filters stack vertically |

---

## 7. Accessibility

### 7.1 Requirements

- All interactive elements keyboard accessible
- ARIA labels on controls
- High contrast text (white on dark)
- Focus indicators visible

### 7.2 Screen Reader

- Nodes should have `aria-label` with network name and stage
- Filters should announce current selection

---

## 8. Technical Implementation

### 8.1 Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18+ |
| Build | Vite |
| Visualization | D3.js v7 |
| Styling | Tailwind CSS |
| Language | TypeScript |

### 8.2 File Structure

```
src/
├── components/
│   ├── TrellisMap.tsx      # Main SVG canvas
│   ├── NetworkShape.tsx     # Shape renderer
│   ├── Tooltip.tsx          # Hover tooltip
│   ├── InfoPanel.tsx        # Click detail panel
│   ├── Legend.tsx           # Visual key
│   └── FilterControls.tsx   # Type/stage filters
├── data/
│   ├── networks.csv         # Source data
│   ├── types.ts             # TypeScript interfaces
│   └── parseData.ts         # CSV parser
├── hooks/
│   ├── useForceSimulation.ts # D3 force layout
│   ├── useResponsive.ts      # Viewport tracking
│   └── useFilters.ts         # Filter state
└── utils/
    ├── constants.ts          # Colors, labels
    ├── scales.ts             # D3 scales
    └── shapes.ts             # SVG path generators
```

### 8.3 Performance Considerations

- Use `requestAnimationFrame` for animations
- Memoize expensive calculations (`useMemo`)
- Limit force simulation iterations
- Use CSS transforms over SVG attributes where possible

---

## 9. Deployment

### 9.1 Build

```bash
npm run build
# Output: dist/
```

### 9.2 Hosting Options

| Platform | Command/Config |
|----------|----------------|
| GitHub Pages | `npm run deploy` (uses gh-pages) |
| Vercel | Auto-detect Vite, output `dist` |
| Netlify | Build `npm run build`, publish `dist` |

### 9.3 Base Path

For GitHub Pages subdirectory deployment:
```typescript
// vite.config.ts
export default defineConfig({
  base: '/trellis/',
});
```

---

## 10. Future Enhancements

Potential additions (not in current scope):

1. **Real-time data** - API integration for live updates
2. **Time travel** - Historical snapshots
3. **Network comparison** - Side-by-side metrics
4. **3D visualization** - WebGL rendering
5. **Mobile app** - React Native port
6. **Embeddable widget** - iframe/web component

---

## Appendix A: Security Stage Definitions

From L2Beat:

| Stage | Criteria |
|-------|----------|
| Stage 0 | Rollup is functional but centralized. Operator can censor/freeze. "Training wheels" |
| Stage 1 | Fraud/validity proofs work. Security council exists but with safeguards. Users can exit |
| Stage 2 | Fully decentralized. No single party can censor or upgrade without governance |

---

## Appendix B: Sample Data

```csv
network_name,type,tvl_billion_usd,stablecoin_billion_usd,daily_transactions_thousands,security_stage,monthly_bridge_volume_million_usd
Ethereum,L1,52.0,85.0,1100,,
Arbitrum One,optimistic_rollup_arbitrum,2.4,3.8,950,1,850
Base,optimistic_rollup_op,4.0,5.2,2800,1,720
OP Mainnet,optimistic_rollup_op,0.8,1.1,380,1,520
Scroll,zk_rollup,0.22,0.35,95,1,80
Starknet,zk_rollup,0.35,0.28,710,0,140
zkSync Era,zk_rollup,0.45,0.22,320,0,190
Linea,zk_rollup,0.38,0.18,200,0,120
Blast,optimistic_rollup_op,0.4,0.15,280,0,180
Mantle,optimistic_rollup_op,0.5,0.85,150,0,210
World Chain,optimistic_rollup_op,0.18,0.08,2200,0,95
Celo,optimistic_rollup_op,0.12,0.45,1550,0,55
Polygon POS,L1,0.0,1.2,3500,,
Bitcoin,L1,0.0,0.5,350,,
Solana,L1,0.0,12.5,45000,,
Tron,L1,0.0,62.0,8500,,
```

---

*Document version: 1.0*
*Last updated: 2026-02-18*
