# CLAUDE.md — The Trellis: An Ethereum Ecosystem Map

## Mission

Build a single-page, browser-based interactive visualization that maps Ethereum's Layer 2 ecosystem for enterprise audiences. Think of it as a living map: Ethereum is the city center, L2s are satellite towns growing from it, and the visual must make a non-crypto executive immediately understand the architecture, scale, and maturity of each network.

**The audience is enterprise decision-makers, not crypto natives.** Every design choice must serve clarity over cleverness.

**Reference:** [chainviz.app](https://chainviz.app/) for spirit, but our scope is ecosystem topology, not real-time block data.

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **React 18+ with TypeScript** | Component reusability, strong typing for data models |
| Visualization | **D3.js v7** (force-directed graph + custom layouts) | Full control over node/link rendering, animation, interactivity |
| Styling | **Tailwind CSS** | Rapid, consistent styling. Enterprise-clean aesthetic |
| Build | **Vite** | Fast dev server, optimized production builds |
| Data | **Static CSV → JSON at build time** | Simple update path — swap CSV, rebuild. No backend needed |
| Deployment | **Static site** (Vercel/Netlify/GitHub Pages compatible) | Zero infra overhead |

### Why D3 over a charting library
This is not a chart — it's a spatial relationship map with custom metaphors, animations, and interactive drill-downs. D3 gives us pixel-level control. Libraries like Recharts or Chart.js would constrain the artistic vision.

---

## Architecture

```
src/
├── components/
│   ├── TrellisMap.tsx          # Main visualization canvas
│   ├── NetworkNode.tsx         # Individual network bubble/node
│   ├── ConnectionLink.tsx      # Bridge/relationship lines between nodes
│   ├── SecurityBadge.tsx       # Stage 0/1/2 indicator on nodes
│   ├── Tooltip.tsx             # Hover detail panel
│   ├── Legend.tsx              # Map legend (types, stages, scale)
│   ├── FilterControls.tsx     # Filter by type, stage, metric
│   └── InfoPanel.tsx          # Click-to-expand detail sidebar
├── data/
│   ├── networks.csv           # Source of truth — editable by non-devs
│   ├── parseData.ts           # CSV → typed JSON transformer
│   └── types.ts               # TypeScript interfaces for all data
├── hooks/
│   ├── useForceSimulation.ts  # D3 force layout logic
│   ├── useResponsive.ts       # Viewport-aware sizing
│   └── useFilters.ts          # Filter state management
├── styles/
│   └── trellis.css            # Custom animations, gradients, glow effects
├── utils/
│   ├── scales.ts              # D3 scales for size, color, opacity
│   └── constants.ts           # Colors, breakpoints, animation durations
├── App.tsx
└── main.tsx
```

---

## Data Model

### Network (node)

```typescript
interface Network {
  name: string;                    // "Arbitrum One"
  type: NetworkType;               // "optimistic_rollup_arbitrum" | "optimistic_rollup_op" | "zk_rollup" | "L1"
  tvl_billion_usd: number;        // Total Value Locked
  stablecoin_billion_usd: number; // Stablecoin amount
  daily_transactions_thousands: number;
  security_stage: number | null;   // 0, 1, 2, or null for L1s/mainnet
  monthly_bridge_volume_million_usd: number | null;
  category: "ethereum" | "l2" | "external_l1";  // derived
}
```

### NetworkType enum
```typescript
type NetworkType =
  | "L1"
  | "optimistic_rollup_arbitrum"
  | "optimistic_rollup_op"
  | "zk_rollup";
```

### Source CSV format
```
network_name,type,tvl_billion_usd,stablecoin_billion_usd,daily_transactions_thousands,security_stage,monthly_bridge_volume_million_usd
Ethereum,L1,48.2,42.0,4500,mainnet,N/A
Arbitrum One,optimistic_rollup_arbitrum,2.1,1.8,820,2,980
...
```

**Update workflow:** Replace `src/data/networks.csv` → rebuild. That's it. No API, no database.

---

## Visual Design Specification

### Layout Concept: Gravitational Map

**Mental model:** Solar system, not org chart.

- **Ethereum** = the sun. Largest node, center of canvas. Glowing, pulsing subtly to convey "alive."
- **L2 networks** = planets orbiting at distances proportional to their connection strength (bridge volume). Bigger planets = more TVL.
- **External L1s** (Bitcoin, Solana, Avalanche, etc.) = distant stars at the periphery. Visible but clearly separate — no bridge connections to Ethereum shown.

### Node Sizing
- Radius scales with `tvl_billion_usd` using `d3.scaleSqrt()` (area perception is more accurate than radius).
- Minimum radius: 20px (so tiny networks like BOB are still clickable).
- Maximum radius: 120px (Ethereum).

### Node Colors (by type)
| Type | Color | Hex |
|------|-------|-----|
| Ethereum mainnet | Deep indigo with glow | `#627EEA` (Ethereum brand) |
| Optimistic Rollup (OP Stack) | Warm red | `#FF0420` (Optimism brand) |
| Optimistic Rollup (Arbitrum) | Teal blue | `#28A0F0` (Arbitrum brand) |
| ZK Rollup | Electric purple | `#8B5CF6` |
| External L1 | Muted gray | `#6B7280` |

### Connection Links (bridges)
- Only drawn between L2s and Ethereum (no L2-to-L2 bridges in v1).
- **Stroke width** scales with `monthly_bridge_volume_million_usd`.
- **Stroke style:**
  - Stage 2: solid line (full trust)
  - Stage 1: dashed line (partial trust)
  - Stage 0: dotted line (training wheels)
- **Subtle animated flow** along lines (particles moving toward Ethereum) to convey "activity." Keep it understated — no Las Vegas.

### Security Stage Indicators
Small badge/ring on each L2 node:
- **Stage 0:** Orange ring, ⚠ icon — "Training Wheels"
- **Stage 1:** Yellow ring, 🔒 icon — "Safety Net"
- **Stage 2:** Green ring, ✅ icon — "Full Autonomy"

On hover, show a one-sentence explanation (from the analogy in the brief).

### Typography
- Font: `Inter` (clean, professional, great at small sizes).
- Node labels: 13px semibold, white with subtle text-shadow for readability on colored backgrounds.
- Data values in tooltips: tabular nums variant.

### Background
- Dark theme (near-black: `#0F1117`) — lets the nodes and connections glow.
- Subtle grid or constellation-like dots in background for depth.
- Enterprise audiences expect dark dashboards (Bloomberg, trading terminals).

---

## Interaction Design

### Hover
- Node highlights, connections illuminate.
- Tooltip appears with: name, type (plain English: "Optimistic Rollup"), TVL, stablecoin amount, daily transactions, security stage with label.

### Click
- Opens **InfoPanel** sidebar with full details.
- Includes a brief "What is this?" explanation for each rollup type (use the city/satellite analogy from the brief).
- Shows bridge volume as a bar relative to other L2s.

### Filter Controls (top bar)
- **By type:** All | Optimistic | ZK | External L1s
- **By stage:** All | Stage 0 | Stage 1 | Stage 2
- **Size metric toggle:** TVL | Stablecoins | Daily Transactions (changes what drives node radius)
- Smooth animated transitions when filters change.

### Zoom & Pan
- Mouse wheel zoom, click-drag pan.
- "Reset view" button to snap back to default.
- Mobile: pinch-zoom, drag-pan.

---

## Responsive Behavior

| Breakpoint | Behavior |
|-----------|----------|
| Desktop (>1024px) | Full force layout, side panel, all controls visible |
| Tablet (768-1024px) | Compact layout, bottom sheet instead of side panel |
| Mobile (<768px) | Simplified view — nodes in a structured vertical list-map hybrid, tap to expand. Force layout is too chaotic on small screens. |

---

## Performance Requirements

- **Initial load:** < 3 seconds on 4G.
- **60fps** during zoom/pan/hover on modern browsers.
- **Node count:** ~20 networks. This is lightweight — no virtualization needed.
- **Bundle size target:** < 500KB gzipped (React + D3 + Tailwind).
- Lazy-load the InfoPanel content.

---

## Phased Build Plan

### Phase 1: Data & Static Layout (Day 1)
1. Set up Vite + React + TypeScript + Tailwind project.
2. Create CSV parser (`parseData.ts`) with full type safety.
3. Render all nodes as static circles on canvas, sized by TVL.
4. Color-code by type.
5. Draw connection lines between L2s and Ethereum.

**Checkpoint:** All 18 networks visible, correctly sized and colored, connections drawn.

### Phase 2: Force Layout & Interactions (Day 2)
1. Implement D3 force simulation:
   - Center force pulling Ethereum to middle.
   - Radial force pushing L2s to orbit distance based on bridge volume (closer = more volume).
   - Collision detection so nodes don't overlap.
   - External L1s pushed to outer ring.
2. Add hover tooltips.
3. Add click → InfoPanel.
4. Zoom & pan.

**Checkpoint:** Interactive, explorable map with meaningful spatial layout.

### Phase 3: Visual Polish & Filters (Day 3)
1. Security stage badges on nodes.
2. Animated flow particles on connection links.
3. Filter controls (type, stage, metric toggle).
4. Smooth transitions on filter changes.
5. Legend.
6. Ethereum node glow/pulse animation.
7. Background treatment (grid/dots).

**Checkpoint:** Presentation-ready visualization.

### Phase 4: Responsive & Production (Day 4)
1. Mobile/tablet layouts.
2. Performance audit (Lighthouse).
3. Accessibility: keyboard navigation, ARIA labels on interactive elements, color-blind safe palette (use patterns in addition to color).
4. Meta tags, OG image, favicon.
5. Production build optimization.

**Checkpoint:** Deployable, shareable, conference-demo ready.

---

## Key Design Principles

1. **Enterprise-first:** No memes, no crypto-bro energy. Think Bloomberg terminal meets NASA mission control. Clean, authoritative, trustworthy.

2. **Analogy-driven:** Every visual metaphor should map to the city/satellite/transportation analogy. If a design choice can't be explained in plain English, simplify it.

3. **Data honesty:** Node sizes must be proportional. Don't inflate small networks for aesthetics. The visualization IS the argument — let the data speak.

---

## Files to Deliver

```
dist/
├── index.html        # Single entry point
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── inter-[variants].woff2
└── data/
    └── networks.json  # Compiled from CSV at build
```

The final output is a **static folder** deployable anywhere. No server, no API keys, no dependencies at runtime.

---

## CSV Update Instructions (for non-technical team members)

1. Open `src/data/networks.csv` in Excel or Google Sheets.
2. Edit numbers (TVL, transactions, etc.) or add new rows.
3. Save as CSV.
4. Run `npm run build`.
5. Deploy the `dist/` folder.

That's it. The visualization auto-adapts to new data.

---

## Out of Scope for v1

- Real-time data feeds (future: L2Beat API integration).
- L2-to-L2 bridge connections.
- Historical time-series animation ("watch the ecosystem grow").
- User accounts or saved views.
- Embedded wallet connections.

These are natural v2 features once the static map proves its value with enterprise audiences.

---

## Reference Links

- [L2Beat](https://l2beat.com) — Data source for stages, TVL
- [DeFiLlama](https://defillama.com) — Data source for TVL, stablecoins
- [Chainviz](https://chainviz.app/) — Spiritual reference for feel
- [growthepie.xyz](https://www.growthepie.xyz/) — Data reference
- [Symphony of Blockchain](https://symphony.iohk.io/) — Artistic inspiration
- [Cosmos Map of Zones](https://www.mapofzones.com/) — Layout inspiration

---

## Success Criteria

The visualization succeeds if a Fortune 500 CTO can look at it for 30 seconds and answer:

1. **"What is Ethereum's L2 ecosystem?"** → The map shows it spatially.
2. **"Which L2s are most mature and active?"** → Size + stage badges answer this instantly.
3. **"Should I care about this?"** → $48B TVL on Ethereum + billions across L2s. The scale speaks for itself.
