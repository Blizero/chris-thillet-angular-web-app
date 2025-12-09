# app/ml/train_model.py

import os


from datetime import datetime
import joblib
import numpy as np
import pandas as pd
from flask import jsonify
from pymongo import MongoClient
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

import os
from dotenv import load_dotenv
from pymongo import MongoClient

from app import create_app
from flask import current_app

load_dotenv()

from .config import (
    RANDOM_STATE,
    MONGO_DB_NAME,
    MONGO_UCS_COLLECTION,
    RAW_COLS,
    TARGET_COL,
    FEATURE_COLS_NUMERIC,
    FEATURE_COLS_CATEGORICAL,
)


MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "USC_Satellite")
MONGO_UCS_COLLECTION = os.getenv("MONGO_UCS_COLLECTION", "usc_satellite")


def get_mongo_collection():
    """
    Use the same Mongo collection that the Flask app uses for UCS satellites.
    This relies on `create_app()` having initialized `usc_satellite` on the app
    and this function being called inside an application context.
    """
    coll = current_app.usc_satellite
    print("Using Flask collection:", coll.full_name)
    print("Docs in collection:", coll.count_documents({}))
    return coll


def load_data_from_mongo():
    coll = get_mongo_collection()
    docs = list(coll.find({}))
    if not docs:
        raise RuntimeError("No UCS satellite documents found in MongoDB.")
    return docs

# def get_mongo_collection():
#     data = app.usc_satellite.find()
#     response_schema = SatelliteSchema(many=True)
#     print('response_schema ', response_schema)
#     response_data = response_schema.dump(data)
#     print('Data obtained from database ', response_data)
#     return response_data


def safe_float(val):
    """Convert UCS-style strings like '0,0', '1,75E-03' to float or np.nan."""
    if val in (None, "", "NaN"):
        return np.nan
    if isinstance(val, (int, float)):
        return float(val)
    if isinstance(val, str):
        v = val.replace(",", ".")
        try:
            return float(v)
        except ValueError:
            return np.nan
    return np.nan


def simplify_mission(purpose: str) -> str:
    if not purpose:
        return "Other"
    p = purpose.lower()
    if "earth" in p or "remote" in p:
        return "Earth Observation"
    if "comm" in p:
        return "Communications"
    if "nav" in p or "gps" in p:
        return "Navigation"
    if "milit" in p or "defense" in p or "intel" in p or "recon" in p:
        return "Military"
    if "science" in p or "tech" in p or "research" in p:
        return "Science/Tech"
    return "Other"


def classify_orbit_regime(perigee_km: float) -> str:
    if np.isnan(perigee_km):
        return "Unknown"
    if perigee_km < 2000:
        return "LEO"
    elif perigee_km < 35000:
        return "MEO"
    else:
        return "GEO/HEO"


def build_feature_df(df_raw: pd.DataFrame) -> pd.DataFrame:
    # --- basic columns ---
    df = pd.DataFrame()
    df["purpose"] = df_raw[RAW_COLS["purpose"]]
    df["perigee_km"] = df_raw[RAW_COLS["perigee"]].apply(safe_float)
    df["apogee_km"] = df_raw[RAW_COLS["apogee"]].apply(safe_float)
    df["eccentricity_float"] = df_raw[RAW_COLS["eccentricity"]].apply(safe_float)
    df["inclination_deg"] = df_raw[RAW_COLS["inclination"]].apply(safe_float)
    df["period_min"] = df_raw[RAW_COLS["period"]].apply(safe_float)

    # launch year
    launch_str = df_raw[RAW_COLS["date_of_launch"]]
    df["launch_year"] = pd.to_datetime(launch_str, errors="coerce").dt.year

    # operator country clean
    df["operator_country_clean"] = (
        df_raw[RAW_COLS["operator_country"]]
        .fillna("Unknown")
        .astype(str)
        .str.strip()
    )

    # target (Mission_Type) – create if missing
    if TARGET_COL in df_raw.columns:
        df[TARGET_COL] = df_raw[TARGET_COL].fillna(
            df["purpose"].apply(simplify_mission)
        )
    else:
        df[TARGET_COL] = df["purpose"].apply(simplify_mission)

    # engineered features
    df["orbit_regime"] = df["perigee_km"].apply(classify_orbit_regime)
    df["is_circular"] = (df["eccentricity_float"] < 0.01).astype(int)
    df["is_sun_sync_like"] = (
        df["perigee_km"].between(600, 900)
        & df["inclination_deg"].between(96, 102)
    ).astype(int)

    return df


def train_and_save_model():
    coll = get_mongo_collection()
    docs = list(coll.find({}))
    if not docs:
        raise RuntimeError("No UCS satellite documents found in MongoDB.")

    df_raw = pd.DataFrame(docs)
    feature_df = build_feature_df(df_raw)

    # Drop rows with missing target
    feature_df = feature_df[feature_df[TARGET_COL].notna()]

    # numeric features – impute median
    for col in FEATURE_COLS_NUMERIC:
        if col in feature_df.columns:
            feature_df[col] = pd.to_numeric(feature_df[col], errors="coerce")
            median_val = feature_df[col].median()
            feature_df[col] = feature_df[col].fillna(median_val)
        else:
            # if a numeric column is missing entirely, create it as zeros
            feature_df[col] = 0.0

    # categorical features – impute "Unknown"
    for col in FEATURE_COLS_CATEGORICAL:
        if col in feature_df.columns:
            feature_df[col] = feature_df[col].fillna("Unknown").astype(str)
        else:
            feature_df[col] = "Unknown"

    # one-hot encode
    model_df = feature_df[FEATURE_COLS_NUMERIC + FEATURE_COLS_CATEGORICAL + [TARGET_COL]]
    model_df = pd.get_dummies(
        model_df,
        columns=FEATURE_COLS_CATEGORICAL,
        drop_first=True,
    )

    X = model_df.drop(columns=[TARGET_COL]).values
    y = model_df[TARGET_COL].values

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=RANDOM_STATE,
        stratify=y,
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # --- models ---
    models = {
        "log_reg": LogisticRegression(max_iter=1000, random_state=RANDOM_STATE),
        "rf": RandomForestClassifier(
            n_estimators=300,
            max_depth=None,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=RANDOM_STATE,
            n_jobs=-1,
        ),
        "gb": GradientBoostingClassifier(random_state=RANDOM_STATE),
    }

    accuracies = {}

    for name, model in models.items():
        if name == "log_reg":
            model.fit(X_train_scaled, y_train)
            y_pred = model.predict(X_test_scaled)
        else:
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        accuracies[name] = acc
        print(f"{name} accuracy: {acc:.4f}")

    best_name = max(accuracies, key=accuracies.get)
    best_model = models[best_name]
    print(f"Best model: {best_name} ({accuracies[best_name]:.4f})")

    # save bundle
    model_bundle = {
        "model": best_model,
        "scaler": scaler,
        "use_scaled": best_name == "log_reg",
        "feature_names": model_df.drop(columns=[TARGET_COL]).columns.tolist(),
        "target_classes": sorted(set(y)),
        "trained_at": datetime.utcnow().isoformat() + "Z",
    }

    models_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(models_dir, exist_ok=True)
    out_path = os.path.join(models_dir, "sat_mission_model.joblib")

    joblib.dump(model_bundle, out_path)
    print(f"Saved model bundle to {out_path}")


if __name__ == "__main__":
    # Create the Flask app and push an application context so that
    # current_app.usc_satellite is available when training runs.
    flask_app = create_app()
    with flask_app.app_context():
        train_and_save_model()