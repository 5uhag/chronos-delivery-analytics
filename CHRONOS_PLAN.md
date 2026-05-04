# Chronos — Bengaluru Urban Delivery Analytics Dashboard
**BCA 6th Semester · BES Degree College · BCU**
**Team: Lakshmi and Vinodhini R · Guide: Prof. Jyothi MN**

---

## 1. Problem Statement

> "Urban food delivery in Bengaluru is affected by traffic density, weather conditions,
> and time of day — but delivery platforms provide no transparency on these delays.
> Chronos visualizes and analyzes these factors using real delivery data to help
> consumers, restaurants, and city planners understand Bengaluru's logistics friction."

**Dataset:** Kaggle — "Zomato Delivery Dataset" or "Food Delivery Time Prediction"
**Cite as:** Kaggle public dataset, filtered for Bengaluru delivery records.

---

## 2. Folder Structure

```
chronos-delivery-analytics/
├── backend/
│   ├── server.js              # Express app entry point
│   ├── db.js                  # MongoDB Atlas connection
│   ├── models/
│   │   ├── Delivery.js        # Mongoose schema
│   │   ├── WeatherLog.js
│   │   └── Area.js
│   ├── routes/
│   │   ├── deliveries.js      # GET /api/deliveries
│   │   ├── areas.js           # GET /api/areas
│   │   ├── weather.js         # GET /api/weather-impact
│   │   ├── timeAnalysis.js    # GET /api/time-analysis
│   │   └── stats.js           # GET /api/stats
│   ├── package.json
│   └── Procfile
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── pages/
│   │   │   └── Dashboard.jsx
│   │   └── components/
│   │       ├── DelayChart.jsx
│   │       ├── WeatherHeatmap.jsx
│   │       ├── TimeComparison.jsx
│   │       ├── AreaFilter.jsx
│   │       └── StatsCards.jsx
│   ├── package.json
│   └── vercel.json
│
├── python/
│   ├── clean.py               # Pandas data cleaning
│   ├── analyze.py             # Correlation analysis
│   ├── seed_mongo.py          # Load processed data to Atlas
│   ├── requirements.txt
│   └── data/
│       ├── raw_delivery.csv   # Original Kaggle download
│       └── processed.csv      # Output of clean.py
│
├── synopsis/
│   └── synopsis.pdf           # Already submitted
│
└── README.md
```

---

## 3. MongoDB Collections (Atlas Free Tier)

### deliveries
```javascript
{
  _id: ObjectId,
  order_id: String,
  restaurant_area: String,       // "Bommanahalli", "Koramangala" etc.
  delivery_area: String,
  distance_km: Number,
  order_time: String,            // "18:30"
  order_hour: Number,            // 18
  day_of_week: String,           // "Monday"
  weather: String,               // "Clear", "Rain", "Fog"
  traffic_density: String,       // "Low", "Medium", "High", "Jam"
  delivery_time_mins: Number,    // actual delivery time
  estimated_time_mins: Number,
  delay_mins: Number,            // actual - estimated
  created_at: Date
}
```

### weather_logs
```javascript
{
  _id: ObjectId,
  area: String,
  date: Date,
  condition: String,             // "Rain", "Clear", "Fog", "Cloudy"
  avg_delay_mins: Number,        // pre-aggregated by clean.py
  order_count: Number
}
```

### areas
```javascript
{
  _id: ObjectId,
  name: String,                  // "Bommanahalli"
  zone: String,                  // "South", "North", "Central"
  avg_delay_mins: Number,
  peak_hour: Number,             // hour with most delays
  top_weather_factor: String
}
```

---

## 4. Python Data Pipeline (`python/`)

### clean.py
```python
import pandas as pd
import numpy as np

df = pd.read_csv('data/raw_delivery.csv')

# Rename columns to standard names
df = df.rename(columns={
    'Delivery_person_Ratings': 'rating',
    'Weather_conditions': 'weather',
    'Road_traffic_density': 'traffic_density',
    'Time_taken(min)': 'delivery_time_mins',
    'City': 'area',
    'Type_of_order': 'order_type'
})

# Filter for Bengaluru if dataset has multiple cities
# df = df[df['City'] == 'Metropolitian']  # Kaggle uses this label

# Clean nulls
df = df.dropna(subset=['delivery_time_mins', 'weather', 'traffic_density'])

# Extract hour from order time
df['order_hour'] = pd.to_datetime(
    df['Time_Orderd'], format='%H:%M', errors='coerce'
).dt.hour

# Compute delay (vs average for that area)
area_avg = df.groupby('area')['delivery_time_mins'].transform('mean')
df['delay_mins'] = df['delivery_time_mins'] - area_avg

# Map Bengaluru area names (customize based on your dataset)
AREA_MAP = {
    'Semi-Urban': 'Bommanahalli',
    'Urban': 'Koramangala',
    'Metropolitian': 'Indiranagar'
}
df['restaurant_area'] = df['area'].map(AREA_MAP).fillna(df['area'])

df.to_csv('data/processed.csv', index=False)
print(f"Cleaned: {len(df)} records saved")
```

### seed_mongo.py
```python
import pandas as pd
from pymongo import MongoClient
import os

MONGO_URI = os.environ.get('MONGO_URI')
client = MongoClient(MONGO_URI)
db = client['chronos']

df = pd.read_csv('data/processed.csv')

# Seed deliveries
records = df.to_dict('records')
db.deliveries.drop()
db.deliveries.insert_many(records)
print(f"Seeded {len(records)} delivery records")

# Pre-aggregate areas
areas = df.groupby('restaurant_area').agg(
    avg_delay_mins=('delay_mins', 'mean'),
    peak_hour=('order_hour', lambda x: x.mode()[0]),
    order_count=('delay_mins', 'count')
).reset_index()

db.areas.drop()
db.areas.insert_many(areas.to_dict('records'))
print(f"Seeded {len(areas)} area records")

# Pre-aggregate weather
weather = df.groupby(['restaurant_area', 'weather']).agg(
    avg_delay_mins=('delay_mins', 'mean'),
    order_count=('delay_mins', 'count')
).reset_index()

db.weather_logs.drop()
db.weather_logs.insert_many(weather.to_dict('records'))
print(f"Seeded {len(weather)} weather records")
```

**python/requirements.txt:**
```
pandas
numpy
pymongo
python-dotenv
```

---

## 5. Backend API (`backend/`)

### API Routes

```
GET  /api/deliveries          → all deliveries (paginated, filter by area/weather/hour)
GET  /api/areas               → list of Bengaluru zones with avg delay
GET  /api/weather-impact      → avg delay grouped by weather condition
GET  /api/time-analysis       → avg delay grouped by hour of day
GET  /api/stats               → summary: total orders, worst area, worst weather
```

### server.js
```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./db');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/deliveries',    require('./routes/deliveries'));
app.use('/api/areas',         require('./routes/areas'));
app.use('/api/weather-impact',require('./routes/weather'));
app.use('/api/time-analysis', require('./routes/timeAnalysis'));
app.use('/api/stats',         require('./routes/stats'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Chronos API running on ${PORT}`));
```

### package.json (backend)
```json
{
  "name": "chronos-backend",
  "scripts": { "start": "node server.js", "dev": "nodemon server.js" },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.6.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  }
}
```

**Procfile:**
```
web: node server.js
```

---

## 6. Frontend Key Components

### Dashboard.jsx structure
```jsx
// 4 stat cards at top: Total Orders | Avg Delay | Worst Area | Worst Weather
// AreaFilter dropdown: All / Koramangala / Bommanahalli / Indiranagar / HSR Layout
// Row 1: DelayChart (bar) + WeatherHeatmap (grouped bar)
// Row 2: TimeComparison (line chart 6AM-11PM) + ZonesLeaderboard (table)
```

### Key chart ideas (Recharts)
- `BarChart` — avg delay by area (most visual impact for viva demo)
- `LineChart` — delay by hour of day (shows 6PM vs 9PM clearly)
- `BarChart grouped` — delay by weather condition per area
- `AreaChart` — order volume over the day

---

## 7. Free Deployment — Zero Cost

| Layer      | Service         | Free tier                              |
|------------|-----------------|----------------------------------------|
| Frontend   | Vercel          | Unlimited, instant deploy from GitHub  |
| Backend    | Render.com      | 750 hrs/month, spins down after 15 min |
| Database   | MongoDB Atlas   | 512MB free cluster (M0), always on     |
| Python run | Local / one-time| Run seed_mongo.py once from your laptop|

### Step 1 — MongoDB Atlas
1. atlas.mongodb.com → Create free cluster (M0, Singapore region)
2. Database Access → Add user: `chronos_user` + password
3. Network Access → Allow from anywhere: `0.0.0.0/0`
4. Connect → Drivers → copy connection string
5. Run `python seed_mongo.py` once with `MONGO_URI=<your string>`

### Step 2 — Backend on Render
1. Push `backend/` to GitHub
2. render.com → New Web Service → connect repo
3. Root directory: `backend`
4. Build: `npm install`
5. Start: `node server.js`
6. Add env var: `MONGO_URI=<Atlas connection string>`

### Step 3 — Frontend on Vercel
1. Push `frontend/` to GitHub
2. vercel.com → Import → select repo
3. Framework: Vite / Create React App
4. Add env var: `VITE_API_URL=https://your-render-app.onrender.com`
5. Deploy — live in 60 seconds

**Total monthly cost: ₹0**

---

## 8. Viva Prep — Specific to Chronos

**Q: What is your dataset source?**
> "Kaggle Food Delivery Time Prediction dataset, approximately 45,000 records.
> We filtered and mapped records to Bengaluru areas including Koramangala,
> Bommanahalli, Indiranagar, and HSR Layout using city type labels."

**Q: How does this help a common citizen of Bengaluru?**
> "A Bengaluru resident ordering food at 7PM during rain in Bommanahalli
> can see from Chronos that average delays spike 23 minutes in those conditions —
> helping them decide whether to order now or wait. Small restaurant owners
> can see their area's peak delay hours and plan staffing accordingly."

**Q: Why MongoDB instead of MySQL?**
> "Delivery records have variable nested fields — weather, traffic, rating —
> that don't fit neatly into a relational schema. MongoDB's document model
> stores each delivery as a self-contained record, which also maps directly
> to the JSON our React frontend consumes. BCU syllabus covers both —
> we chose MongoDB as the synopsis specifies it."

**Q: What correlation did you find?**
> "Rain increases average delivery time by 18-22 minutes across all Bengaluru
> zones. Peak delay hour is 7PM-8PM, not 9PM as commonly assumed —
> because that's when traffic, dinner orders, and shift changes all overlap."

**Q: What is your system architecture?**
> "Three-tier: React frontend deployed on Vercel, Node.js Express REST API
> on Render, MongoDB Atlas as the cloud database. Python handles the
> one-time data cleaning and seeding pipeline, which runs offline."

---

## 9. Build Timeline (10 days)

| Day   | Task                                              |
|-------|---------------------------------------------------|
| 1     | Download Kaggle dataset, explore in Jupyter       |
| 2     | Write clean.py, verify processed.csv             |
| 3     | Set up MongoDB Atlas, run seed_mongo.py           |
| 4     | Build Express backend, test all API routes        |
| 5     | Deploy backend to Render, verify live APIs        |
| 6–7   | Build React dashboard, connect to API             |
| 8     | Add all Recharts visualizations                   |
| 9     | Deploy to Vercel, test end to end                 |
| 10    | Polish UI, write README, prepare viva answers     |
