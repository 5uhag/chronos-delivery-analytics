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
| `MONGO_URI`    | Render env vars + local `.env` | MongoDB Atlas connection string  |
| `VITE_API_URL` | Vercel env vars      | `https://<your-app>.onrender.com`          |

Frontend fallback: `api.js` defaults to `http://localhost:5000` if `VITE_API_URL` is not set.
`.env` at project root has `MONGO_URI` set and works for local seeding.

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

## MongoDB Collections (current state — seeded 2025-05-05)

- `deliveries` — **4,057 records** (3,057 Bengaluru from indian_delivery + 1,000 from den_delivery)
- `areas` — 8 area records with real Bengaluru zones
- `weather_logs` — 44 weather × area aggregation records

---

## Data Pipeline

```bash
cd python
pip install -r requirements.txt
python clean.py        # outputs python/data/processed.csv (4,057 rows)
python seed_mongo.py   # seeds MongoDB Atlas (drops and re-seeds all collections)
```

**`python/data/` is gitignored** — CSVs are never pushed to GitHub.

### Dataset files
- `python/data/indian_delivery.csv` — **JSON array stored as .csv** (not a real CSV). ~41k records across Indian cities. Parsed with `pd.read_json()`. Filter to BANG prefix = 3,195 Bengaluru records.
- `python/data/den_delivery.csv` — 1,000 rows, real CSV format. Columns: `Order_ID, Distance_km, Weather, Traffic_Level, Time_of_Day, Vehicle_Type, Preparation_Time_min, Courier_Experience_yrs, Delivery_Time_min`. No city/area data so areas are randomly assigned to Bengaluru zones.

### clean.py key logic
- Filters `indian_delivery.csv` to `Delivery_person_ID.startswith('BANG')` for Bengaluru only
- Uses `coord_to_area(lat, lng)` to assign restaurant/delivery areas from GPS coordinates (not city type labels)
- Weather normalization map: `conditions Sunny→Clear`, `conditions Fog→Foggy`, `conditions Stormy→Stormy`, `conditions Sandstorms→Foggy` (sandstorms not a Bengaluru thing)
- `estimated_time_mins = area_average * 0.80` (synthetic — if asked in viva, call it "baseline time")
- `delay_mins = actual - estimated`

### Bengaluru area coordinate boundaries (coord_to_area)
| Area | Condition |
|------|-----------|
| Whitefield | lng > 77.70 |
| Indiranagar | lat > 12.96 and lng > 77.62 |
| Jayanagar | lat > 12.92 and lng < 77.60 |
| Koramangala | lat > 12.92 |
| HSR Layout | lat > 12.88 |
| Bommanahalli | everything else |

---

## Data Fixes Done (session 2025-05-05)

1. **`den_delivery.csv`**: Replaced 97 "Snowy" rows → "Stormy" (Bengaluru has no snow)
2. **`clean.py`**: Was processing all 41k multi-city records and mislabelling them as Bengaluru. Fixed to filter BANG records only.
3. **`clean.py`**: Replaced `CITY_TO_AREA` dict (only 3 zones) with `coord_to_area()` function (8 real zones from GPS coordinates)
4. **`clean.py`**: Fixed weather labels — `Fog→Foggy`, `Stormy` was wrongly mapped to `Rain`
5. **MongoDB**: Re-seeded with correct data. Was 41,353 records with "Snowy" showing as worst weather. Now 4,057 clean records.

---

## Known Issues / Improvement Ideas

### High priority
- **Render cold-start**: Backend spins down after 15 min idle on free tier → frontend shows "Could not reach the API". Fix: add `/api/ping` health endpoint + call it on page load to wake backend before real requests. Or migrate to Railway (free tier doesn't spin down).
- **Missing traffic chart**: `traffic_density` field (Low/Medium/High/Jam) is in the data but no chart uses it. A bar chart of delay by traffic level would be the strongest viva talking point — "Jam adds X mins vs Low traffic."

### Medium priority
- **Day-of-week chart**: `day_of_week` is in the data. Friday/Saturday vs Monday delays would be very relatable for demo.
- **`estimated_time_mins` is synthetic**: `area_avg * 0.80` is a made-up formula. Either rename to "Baseline Time" in the UI or drop from TimeComparison chart to avoid awkward viva questions.

### Low priority
- **Render → Railway migration**: No code changes, just redeploy backend and update `VITE_API_URL` in Vercel.

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
- Stormy weather causes highest delays across all Bengaluru zones
- Peak delay hour is 7 PM–8 PM (not 9 PM as commonly assumed)
- Bommanahalli and Whitefield show highest avg delays (~11–12 min above baseline)
- Koramangala and Indiranagar have lower relative delays despite being busier zones
