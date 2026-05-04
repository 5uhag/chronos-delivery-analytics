import pandas as pd
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

MONGO_URI = os.environ.get('MONGO_URI')
if not MONGO_URI:
    raise ValueError("MONGO_URI not set. Export it or add to .env at project root.")

client = MongoClient(MONGO_URI)
db = client['chronos']

df = pd.read_csv('data/processed.csv')

# --- Seed deliveries ---
records = df.to_dict('records')
for r in records:
    r['created_at'] = datetime.utcnow()

db.deliveries.drop()
db.deliveries.insert_many(records)
print(f"Seeded {len(records)} delivery records")

# --- Seed areas ---
areas = df.groupby('restaurant_area').agg(
    avg_delay_mins=('delay_mins', 'mean'),
    peak_hour=('order_hour', lambda x: int(x.mode()[0])),
    order_count=('delay_mins', 'count')
).reset_index()

areas['avg_delay_mins'] = areas['avg_delay_mins'].round(2)

zone_map = {
    'Koramangala':  'South',
    'Bommanahalli': 'South',
    'Indiranagar':  'Central',
    'HSR Layout':   'South',
    'Whitefield':   'East',
    'Jayanagar':    'South',
}
areas['zone'] = areas['restaurant_area'].map(zone_map).fillna('Central')

weather_by_area = df.groupby(['restaurant_area', 'weather'])['delay_mins'].mean()
areas['top_weather_factor'] = areas['restaurant_area'].apply(
    lambda a: weather_by_area[a].idxmax() if a in weather_by_area.index else 'Rain'
)

db.areas.drop()
db.areas.insert_many(areas.rename(columns={'restaurant_area': 'name'}).to_dict('records'))
print(f"Seeded {len(areas)} area records")

# --- Seed weather_logs ---
weather = df.groupby(['restaurant_area', 'weather']).agg(
    avg_delay_mins=('delay_mins', 'mean'),
    order_count=('delay_mins', 'count')
).reset_index()

weather['avg_delay_mins'] = weather['avg_delay_mins'].round(2)
weather['date'] = datetime.utcnow()

weather_docs = weather.rename(columns={'restaurant_area': 'area', 'weather': 'condition'}).to_dict('records')
db.weather_logs.drop()
db.weather_logs.insert_many(weather_docs)
print(f"Seeded {len(weather_docs)} weather_log records")

client.close()
print("Done. MongoDB Atlas seeded successfully.")
