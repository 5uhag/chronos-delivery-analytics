# Chronos — Project Context for Claude Code

## What This Is
BCA 6th Semester project at BES Degree College (BCU).
**Team:** Lakshmi and Vinodhini R | **Guide:** Prof. Jyothi MN

Chronos is a full-stack analytics dashboard showing how weather, traffic, and time-of-day affect food delivery times across Bengaluru zones.

---

## Architecture (Three-tier)

```
frontend/   → React 18 + Vite + Tailwind + Recharts  →  Vercel (hosted, already live)
backend/    → Node.js + Express + Mongoose            →  Render.com (free tier, spins down after 15 min idle)
python/     → pandas data cleaning + pymongo seeder   →  run once locally, not deployed
database    → MongoDB Atlas M0 free cluster (chronos db)
```

**Critical:** The frontend is Vercel-hosted. `VITE_API_URL` must point to the Render backend URL. When Render spins down, the frontend shows "Could not reach the API" — the backend just needs a warm-up request, it's not broken.

---

## Environment Variables

| Variable       | Where set            | Value                                      |
|----------------|----------------------|--------------------------------------------|
| `MONGO_URI`    | Render env vars      | MongoDB Atlas connection string            |
| `VITE_API_URL` | Vercel env vars      | `https://<your-app>.onrender.com`          |

Frontend fallback: `api.js` defaults to `http://localhost:5000` if `VITE_API_URL` is not set.

---

## API Routes (backend on Render)

| Route                    | Returns                                          |
|--------------------------|--------------------------------------------------|
| GET /api/stats           | Total orders, avg delay, worst area/weather      |
| GET /api/areas           | Zones with avg delay and peak hour               |
| GET /api/weather-impact  | Delay by weather × area (`?area=` filter)        |
| GET /api/time-analysis   | Delay by hour of day (`?area=` filter)           |
| GET /api/deliveries      | Paginated records (`?area=&weather=&hour=`)      |

---

## Frontend Components

- `Dashboard.jsx` — main page layout
- `StatsCards.jsx` — 4 summary cards at top
- `AreaFilter.jsx` — dropdown: All / Koramangala / Bommanahalli / Indiranagar / HSR Layout
- `DelayChart.jsx` — bar chart: avg delay by area
- `WeatherHeatmap.jsx` — grouped bar: delay by weather per area
- `TimeComparison.jsx` — line chart: delay by hour (6AM–11PM)
- `ZonesLeaderboard.jsx` — table ranking zones by delay

---

## MongoDB Collections

- `deliveries` — individual delivery records (~45,000 rows from Kaggle dataset)
- `areas` — pre-aggregated zone stats
- `weather_logs` — pre-aggregated weather × area stats

---

## Data Pipeline (run once, locally)

```bash
cd python
pip install -r requirements.txt
# Place Kaggle CSV at python/data/raw_delivery.csv
python clean.py        # outputs python/data/processed.csv
python seed_mongo.py   # seeds MongoDB Atlas
```

Dataset: Kaggle "Food Delivery Time Prediction" (~45k records). City type labels mapped to Bengaluru areas (Urban→Koramangala, Semi-Urban→Bommanahalli, Metropolitian→Indiranagar).

---

## Common Issues

**"Could not reach the API"** — Render backend is spun down (free tier). Hit the backend URL directly in browser to wake it, then refresh the frontend.

**Backend local dev:**
```bash
cd backend && npm install && node server.js   # runs on :5000
```

**Frontend local dev:**
```bash
cd frontend && npm install && npm run dev     # runs on :5173
```

---

## Key Findings (for viva)
- Rain adds 18–22 min delay across all zones
- Peak delay hour is 7 PM–8 PM (not 9 PM)
- Indiranagar and Koramangala have highest traffic-related delays
