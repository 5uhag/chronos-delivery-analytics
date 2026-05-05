import pandas as pd
import numpy as np

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

BENGALURU_AREAS = [
    'Koramangala', 'Bommanahalli', 'Indiranagar', 'HSR Layout',
    'Whitefield', 'Jayanagar', 'BTM Layout', 'Marathahalli',
]

DELIVERY_ZONES = BENGALURU_AREAS  # reuse for delivery_area cycling

WEATHER_NORM = {
    'conditions Sunny':      'Clear',
    'conditions Cloudy':     'Cloudy',
    'conditions Windy':      'Windy',
    'conditions Fog':        'Foggy',
    'conditions Stormy':     'Stormy',
    'conditions Sandstorms': 'Foggy',   # not a Bengaluru condition, mapped to nearest realistic
    'Sunny':                 'Clear',
    'Stormy':                'Stormy',
    'Sandstorms':            'Foggy',
}

def coord_to_area(lat, lng):
    """Assign a Bengaluru area from restaurant coordinates."""
    lat, lng = float(lat), float(lng)
    if lng > 77.70:
        return 'Whitefield'
    elif lat > 12.96 and lng > 77.62:
        return 'Indiranagar'
    elif lat > 12.92 and lng < 77.60:
        return 'Jayanagar'
    elif lat > 12.92:
        return 'Koramangala'
    elif lat > 12.88:
        return 'HSR Layout'
    else:
        return 'Bommanahalli'


def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0
    lat1, lon1, lat2, lon2 = map(np.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = np.sin(dlat / 2) ** 2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon / 2) ** 2
    return R * 2 * np.arcsin(np.sqrt(a))


def add_derived_cols(df, id_prefix, start_idx=0):
    n = len(df)
    if 'order_id' not in df.columns:
        df['order_id'] = [f"{id_prefix}{str(start_idx + i).zfill(6)}" for i in range(n)]

    df['order_time'] = df['order_hour'].apply(lambda h: f"{int(h):02d}:00")

    if 'delivery_area' not in df.columns:
        df['delivery_area'] = [DELIVERY_ZONES[i % len(DELIVERY_ZONES)] for i in range(n)]

    area_avg = df.groupby('restaurant_area')['delivery_time_mins'].transform('mean')
    df['estimated_time_mins'] = (area_avg * 0.80).round(1)
    df['delay_mins'] = (df['delivery_time_mins'] - df['estimated_time_mins']).round(2)

    return df


KEEP_COLS = [
    'order_id', 'restaurant_area', 'delivery_area', 'distance_km',
    'order_time', 'order_hour', 'day_of_week', 'weather', 'traffic_density',
    'delivery_time_mins', 'estimated_time_mins', 'delay_mins',
]


# ---------------------------------------------------------------------------
# Dataset 1 — indian_delivery.csv
# ---------------------------------------------------------------------------

def clean_indian(path='data/indian_delivery.csv'):
    try:
        df = pd.read_json(path)
    except ValueError:
        df = pd.read_csv(path)
    df.columns = [c.strip() for c in df.columns]

    # Keep only Bengaluru records
    df = df[df['Delivery_person_ID'].astype(str).str.strip().str.startswith('BANG')].copy()
    print(f"  Bengaluru records filtered: {len(df)}")

    # delivery_time_mins: strip "(min) " prefix
    df['delivery_time_mins'] = (
        df['Time_taken(min)']
        .astype(str)
        .str.replace(r'\(min\)\s*', '', regex=True)
        .str.strip()
    )
    df['delivery_time_mins'] = pd.to_numeric(df['delivery_time_mins'], errors='coerce')

    # weather: strip "conditions " prefix, then normalise
    df['weather'] = df['Weatherconditions'].astype(str).str.strip().replace(WEATHER_NORM)
    df = df[~df['weather'].isin(['NaN', 'nan', ''])]

    # traffic_density
    df['traffic_density'] = df['Road_traffic_density'].astype(str).str.strip()
    df = df[~df['traffic_density'].isin(['NaN', 'nan', ''])]

    # order_hour from Time_Orderd
    df['order_hour'] = (
        pd.to_datetime(df['Time_Orderd'], format='mixed', errors='coerce').dt.hour
    )

    # day_of_week from Order_Date
    df['day_of_week'] = (
        pd.to_datetime(df['Order_Date'], dayfirst=True, errors='coerce').dt.day_name()
    )
    df['day_of_week'] = df['day_of_week'].fillna('Unknown')

    # restaurant_area and delivery_area from coordinates
    df['restaurant_area'] = df.apply(
        lambda r: coord_to_area(r['Restaurant_latitude'], r['Restaurant_longitude']), axis=1
    )
    df['delivery_area'] = df.apply(
        lambda r: coord_to_area(r['Delivery_location_latitude'], r['Delivery_location_longitude']), axis=1
    )

    # distance_km via haversine
    df['distance_km'] = haversine(
        df['Restaurant_latitude'].astype(float),
        df['Restaurant_longitude'].astype(float),
        df['Delivery_location_latitude'].astype(float),
        df['Delivery_location_longitude'].astype(float),
    ).round(2)

    df = df.dropna(subset=['delivery_time_mins', 'weather', 'traffic_density', 'order_hour'])
    df['order_hour'] = df['order_hour'].astype(int)

    df = add_derived_cols(df, id_prefix='IND', start_idx=0)
    return df[[c for c in KEEP_COLS if c in df.columns]]


# ---------------------------------------------------------------------------
# Dataset 2 — den_delivery.csv
# ---------------------------------------------------------------------------

def clean_den(path='data/den_delivery.csv', start_idx=0):
    df = pd.read_csv(path)
    df.columns = [c.strip() for c in df.columns]

    df.rename(columns={
        'Order_ID':           'order_id',
        'Distance_km':        'distance_km',
        'Weather':            'weather',
        'Traffic_Level':      'traffic_density',
        'Time_of_Day':        'order_hour',
        'Delivery_Time_min':  'delivery_time_mins',
    }, inplace=True)

    # order_hour: may be an integer already, or a label like "Morning"
    HOUR_LABEL_MAP = {
        'Morning':   8,
        'Afternoon': 13,
        'Evening':   18,
        'Night':     22,
    }
    if df['order_hour'].dtype == object:
        df['order_hour'] = (
            pd.to_numeric(df['order_hour'], errors='coerce')
            .fillna(df['order_hour'].map(HOUR_LABEL_MAP))
        )
    df['order_hour'] = pd.to_numeric(df['order_hour'], errors='coerce').fillna(12).astype(int)

    df['delivery_time_mins'] = pd.to_numeric(df['delivery_time_mins'], errors='coerce')

    df['weather'] = df['weather'].astype(str).str.strip().replace(WEATHER_NORM)

    df['traffic_density'] = df['traffic_density'].astype(str).str.strip()

    # Assign random Bengaluru areas (seeded so output is reproducible)
    rng = np.random.default_rng(seed=42)
    df['restaurant_area'] = rng.choice(BENGALURU_AREAS, size=len(df))

    df['day_of_week'] = 'Unknown'

    df = df.dropna(subset=['delivery_time_mins', 'weather', 'traffic_density'])

    df = add_derived_cols(df, id_prefix='DEN', start_idx=start_idx)
    return df[[c for c in KEEP_COLS if c in df.columns]]


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

df1 = clean_indian('data/indian_delivery.csv')
print(f"Dataset 1 (indian_delivery): {len(df1):,} rows")

df2 = clean_den('data/den_delivery.csv', start_idx=len(df1))
print(f"Dataset 2 (den_delivery):    {len(df2):,} rows")

merged = pd.concat([df1, df2], ignore_index=True)
# Reset order_id to guarantee uniqueness across both datasets
merged['order_id'] = ['ORD' + str(i).zfill(6) for i in range(len(merged))]

merged.to_csv('data/processed.csv', index=False)
print(f"Merged total:                {len(merged):,} rows saved to data/processed.csv")
