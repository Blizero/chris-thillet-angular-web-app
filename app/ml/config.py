

RANDOM_STATE = 42

# Mongo config (adjust these to your actual names)
MONGO_DB_NAME = "USC_Satellite"
MONGO_UCS_COLLECTION = "ucs_satellite"

# Raw UCS column names in Mongo
RAW_COLS = {
    "name": "Name of Satellite, Alternate Names",
    "purpose": "Purpose",
    "perigee": "Perigee (km)",
    "apogee": "Apogee (km)",
    "eccentricity": "Eccentricity",
    "inclination": "Inclination (degrees)",
    "period": "Period (minutes)",
    "date_of_launch": "Date of Launch",
    "operator_country": "Country of Operator/Owner",
}

# Target label column (you already engineered this in the notebook)
TARGET_COL = "Mission_Type"

# Engineered feature names (what will feed the model)
FEATURE_COLS_NUMERIC = [
    "perigee_km",
    "apogee_km",
    "eccentricity_float",
    "inclination_deg",
    "period_min",
    "launch_year",
    "is_circular",
    "is_sun_sync_like",
]

FEATURE_COLS_CATEGORICAL = [
    "orbit_regime",
    "operator_country_clean",
]