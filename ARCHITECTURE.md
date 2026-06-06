# POC-53 Architecture — Newsletter Distribution Economics

## Overview

Real Rails intelligence demo exploring how independent newsletter publishers build distribution rails outside platform algorithms. The system follows a **backend-first ETL → insight enrichment → frontend visualization** pattern with automatic mock-data fallback.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Browser (Client)                            │
│  ┌──────────────────────────────┐  ┌─────────────────────────────┐  │
│  │     Main Stage (70%)         │  │  Intelligence Sidebar (30%) │  │
│  │  Neon Navbar + Charts        │  │  Metrics · Why · Who        │  │
│  │  Recharts + ECharts          │  │  Filters · Export           │  │
│  └──────────────┬───────────────┘  └──────────────┬──────────────┘  │
│                 │         fetchDashboard()         │                  │
└─────────────────┼──────────────────────────────────┼──────────────────┘
                  │                                  │
                  ▼                                  ▼
         ┌────────────────┐              ┌───────────────────┐
         │  FastAPI :8000 │──fail───────▶│ public/mock_data  │
         │  /api/dashboard│              │     .json         │
         │  /api/export   │              └───────────────────┘
         └───────┬────────┘
                 │
    ┌────────────┼────────────┐
    ▼            ▼            ▼
 mock_data   World Bank    DuckDB
   .json      Public API    CSV Export
 (synthetic)  (live, no key)
```

---

## Repository Structure

```
POC-53-Newsletter_Distribution_Economics-Adithya_M/
├── ARCHITECTURE.md          # This file — system design
├── README.md                # Setup & run instructions
├── .gitignore
│
├── backend/                 # Python FastAPI service
│   ├── main.py              # REST endpoints + CORS
│   ├── run.py               # uvicorn entry point
│   ├── requirements.txt
│   ├── .env.example
│   ├── data/
│   │   └── mock_data.json   # Synthetic newsletter metrics
│   └── services/
│       ├── newsletter_data.py  # ETL, filtering, insights, export
│       └── world_bank.py       # Live World Bank API client
│
└── frontend/                # Next.js 14 App Router
    ├── public/
    │   └── mock_data.json   # Client-side API fallback
    ├── src/
    │   ├── app/             # layout, page, globals.css
    │   ├── components/
    │   │   ├── dashboard/   # Navbar, MainStage, Sidebar
    │   │   ├── charts/      # Recharts + ECharts
    │   │   └── ui/          # shadcn-style primitives
    │   ├── lib/
    │   │   ├── api.ts       # API client + fallback logic
    │   │   └── utils.ts
    │   └── types/
    │       └── dashboard.ts # Shared TypeScript interfaces
    └── .env.local.example
```

---

## Backend

### Stack
| Layer | Technology |
|-------|------------|
| API | FastAPI |
| Data processing | Python stdlib (json, csv) |
| Export | CSV via stdlib |
| External data | World Bank REST API (no API key) |
| Config | python-dotenv |

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Service health check |
| GET | `/api/dashboard` | Full dashboard payload with insights |
| GET | `/api/export` | ZIP of CSV datasets |
| GET | `/api/mock` | Raw synthetic data |

### Query Parameters (dashboard & export)
- `cohort` — filter by quarter (e.g. `2024-Q3`)
- `start_month` / `end_month` — date range (`YYYY-MM`)
- `use_live` — attempt World Bank fetch (default `true`)

### Data Layers

1. **Synthetic (core)** — cohorts, referrals, deliverability, sponsorship, engagement, ESP economics, list health
2. **Live (context)** — World Bank internet penetration & GDP indicators
3. **Insights** — server-side enrichment (e.g. open rate vs benchmark delta)

### Fallback Protocol
Any API error → return `mock_data.json` with `meta.active_source = "synthetic_fallback"`. UI never breaks.

---

## Frontend

### Stack
| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Components | shadcn/ui (customized) |
| Charts | Recharts + Apache ECharts |
| Font | Geist Sans |

### Layout Protocol
- **Background:** `#030712` (Obsidian Black)
- **Main Stage:** 70% width — charts + neon glass navbar
- **Sidebar:** 30% width — intelligence panels, filters, export

### Key Components

| Component | Role |
|-----------|------|
| `DashboardNavbar` | Sticky neon/glass header with live ticker + section nav |
| `MainStage` | KPI strip + all chart cards |
| `RelatedDataPanel` | Engagement, ESP economics, channels, list health |
| `IntelligenceSidebar` | Why / Who panels, filters, download |
| `lib/api.ts` | Fetches API; falls back to `/mock_data.json` |

### Visual System
- **Primary accent:** `#38BDF8` (Electric Cyan) — neon glow
- **Secondary:** `#818CF8` (Indigo)
- **Surface:** `#0B1117` with glassmorphism (`backdrop-filter: blur`)
- **Borders:** `#1F2937` at 1px

---

## Data Model (Key Entities)

| Entity | Fields | Source |
|--------|--------|--------|
| `cohorts` | subscribers, churn_rate, retained | Synthetic |
| `referral_flows` | source, target, value | Synthetic |
| `deliverability` | open/bounce/spam + benchmarks | Synthetic |
| `sponsorship` | cpm, slots, revenue_per_send | Synthetic |
| `engagement_metrics` | click_rate, read_time, unsub_rate | Synthetic |
| `esp_economics` | platform costs, deliverability score | Synthetic |
| `distribution_channels` | share, CAC, LTV | Synthetic |
| `list_health` | domain reputation, SPF/DKIM/DMARC | Synthetic |
| `rail_benchmarks` | publisher vs platform algo | Synthetic |
| `world_bank_context` | indicator, country, value | Live API |

---

## Security Guardrails

- No hardcoded API keys
- World Bank API is public (no auth required)
- `.env` files gitignored
- All synthetic data clearly labeled in UI and exports

---

## Deployment Notes

| Service | Suggested Host | Port |
|---------|---------------|------|
| Frontend | Vercel | 3000 |
| Backend | Railway / Render / Fly.io | 8000 |

Set `NEXT_PUBLIC_API_URL` to the deployed backend URL in production.
