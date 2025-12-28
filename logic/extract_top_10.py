import pandas as pd
import numpy as np
import os

# Read the dataset
# Using relative paths for portability
file_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'household.csv')
df = pd.read_csv(file_path, sep=';', low_memory=False)

# Replace '?' with NaN and convert to numeric
columns_to_convert = ['Global_active_power', 'Global_reactive_power', 'Voltage', 'Global_intensity', 'Sub_metering_1', 'Sub_metering_2', 'Sub_metering_3']
for col in columns_to_convert:
    df[col] = pd.to_numeric(df[col], errors='coerce')

# Drop rows with NaN in Global_active_power
df = df.dropna(subset=['Global_active_power'])

# Filter for Global_active_power > 0 (to avoid zero usage which might not be interesting for "efficient usage" mapping)
# Actually, the user says "lowest Global Active Power consumption". Usually, there might be very low values.
# Let's just find the top 10 unique records with the lowest power.
df_sorted = df.sort_values(by='Global_active_power', ascending=True).head(10).copy()

# Format dates to 2025
# Current dates are in DD/MM/YYYY
# The user wants ISO dates (YYYY-MM-DD) aligned to 2025.
# Let's map the existing dates to 2025 by just changing the year.
def align_to_2025(date_str):
    parts = date_str.split('/')
    if len(parts) == 3:
        return f"2025-{parts[1]}-{parts[0]}" # YYYY-MM-DD
    return date_str

df_sorted['Date'] = df_sorted['Date'].apply(align_to_2025)

# Save to the requested filename
output_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'Top_10_Most_Efficient_Energy_Usage_2025_FIXED.csv')
df_sorted.to_csv(output_path, index=False)

print(f"File saved to {output_path}")
print(df_sorted[['Date', 'Time', 'Global_active_power']])
