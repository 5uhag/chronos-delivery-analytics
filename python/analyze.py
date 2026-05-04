import pandas as pd
import numpy as np

df = pd.read_csv('data/processed.csv')

print("=== Chronos Delivery Analytics — Correlation Report ===\n")

print("Avg delay by weather:")
print(df.groupby('weather')['delay_mins'].mean().round(2).sort_values(ascending=False))
print()

print("Avg delay by traffic density:")
print(df.groupby('traffic_density')['delay_mins'].mean().round(2).sort_values(ascending=False))
print()

print("Avg delay by hour (top 5 worst):")
print(df.groupby('order_hour')['delay_mins'].mean().round(2).sort_values(ascending=False).head(5))
print()

print("Avg delay by area:")
print(df.groupby('restaurant_area')['delay_mins'].mean().round(2).sort_values(ascending=False))
print()

numeric = df[['distance_km', 'order_hour', 'delivery_time_mins', 'delay_mins']].dropna()
print("Correlation with delay_mins:")
print(numeric.corr()['delay_mins'].round(3))
