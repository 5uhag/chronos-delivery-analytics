# Chronos — Bengaluru Urban Delivery Analytics Dashboard

BCA 6th Semester · BES Degree College · BCU  
**Team:** Lakshmi , Mythili N and Vinodhini R · **Guide:** Prof. Jyothi MN

A full-stack analytics dashboard that visualizes how traffic, weather, and time of day affect food delivery times across Bengaluru zones.

---

## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | React 18 + Vite + Tailwind CSS + Recharts |
| Backend  | Node.js + Express + Mongoose            |
| Database | MongoDB Atlas (M0 free tier)            |
| Pipeline | Python (pandas, pymongo)                |
| Deploy   | Vercel (frontend) + Render (backend)    |

---

## Project Structure

```
chronos-delivery-analytics/
├── backend/          Express REST API
├── frontend/         React + Vite dashboard
├── python/           Data cleaning and seeding scripts
├── synopsis/         Project synopsis (submitted)
├── .env.example      Environment variable template
└── README.md
```

---

## Setup — Local Development

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB Atlas account (free)

---

### Step 1 — Environment

```bash
cp .env.example .env
# Edit .env and set MONGO_URI to your Atlas connection string
```

---

### Step 2 — Python Data Pipeline

```bash
cd python
pip install -r requirements.txt

# Place your Kaggle CSV at:  python/data/raw_delivery.csv
# Download from: https://www.kaggle.com/datasets/gauravmalik26/food-delivery-dataset

python clean.py          # outputs python/data/processed.csv
python seed_mongo.py     # loads data into MongoDB Atlas
```

---

### Step 3 — Backend

```bash
cd backend
npm install
# Make sure .env at project root has MONGO_URI set
node server.js           # or: npm run dev (uses nodemon)
```

API runs at `http://localhost:5000`

| Route                    | Description                                |
|--------------------------|--------------------------------------------|
| GET /api/stats           | Summary totals and worst-case values       |
| GET /api/areas           | All zones with avg delay and peak hour     |
| GET /api/weather-impact  | Delay grouped by weather × area            |
| GET /api/time-analysis   | Delay grouped by hour of day               |
| GET /api/deliveries      | Paginated delivery records (filter support)|

---

### Step 4 — Frontend

```bash
cd frontend
npm install
npm run dev              # opens http://localhost:5173
```

Set `VITE_API_URL` in a `frontend/.env` file for a remote backend:

```
VITE_API_URL=https://your-backend.onrender.com
```

---

## Deployment (Free Tier — ₹0/month)

### MongoDB Atlas
1. Create free M0 cluster at atlas.mongodb.com
2. Add database user and allow all IPs (`0.0.0.0/0`)
3. Copy connection string to `MONGO_URI`
4. Run `python seed_mongo.py` once

### Backend → Render
1. Push repo to GitHub
2. render.com → New Web Service → connect repo
3. Root directory: `backend`, Build: `npm install`, Start: `node server.js`
4. Add env var: `MONGO_URI`

### Frontend → Vercel
1. vercel.com → Import → select repo
2. Framework: Vite
3. Add env var: `VITE_API_URL=https://your-render-app.onrender.com`

---

## Dataset

- **Source:** Kaggle — "Food Delivery Time Prediction"
- **Records:** ~45,000 delivery records
- **Bengaluru mapping:** City type labels mapped to Koramangala, Bommanahalli, Indiranagar, HSR Layout

---

## Key Findings

- Rain increases average delivery time by 18–22 minutes across all zones
- Peak delay hour is **7 PM–8 PM**, not 9 PM
- Indiranagar and Koramangala show highest traffic-related delays
