import joblib
import numpy as np
import pandas as pd
from pathlib import Path

MODEL_PATH = Path(__file__).resolve().parent / "models" / "sat_mission_model.joblib"
_model_bundle = None


def load_model_bundle():
    global _model_bundle
    if _model_bundle is None:
        print("Loading model bundle from:", MODEL_PATH)
        _model_bundle = joblib.load(MODEL_PATH)
    return _model_bundle


def predict_mission(payload: dict) -> dict:
    """
    payload is the JSON body from POST /predict, e.g.:

    {
      "perigee_km": 476,
      "apogee_km": 500,
      "inclination_deg": 97.4,
      "eccentricity": 0.00175,
      "longitude_geo_deg": 0,
      "period_min": 95,
      "class_of_orbit": "LEO"
    }
    """
    print("Predict_mission data:", payload)

    bundle = load_model_bundle()
    model = bundle["model"]
    scaler = bundle.get("scaler", None)
    use_scaled = bundle.get("use_scaled", False)
    feature_names = bundle["feature_names"]          # list of 107 features
    target_classes = bundle.get("target_classes")    # sorted(set(y)) from training

    # 1) Start with zeros for all training features
    row = {feat: 0.0 for feat in feature_names}

    # 2) Override just the features we know from the API payload
    def set_if_present(key: str, default=0.0):
        if key in row:
            row[key] = float(payload.get(key, default))

    set_if_present("perigee_km")
    set_if_present("apogee_km")
    set_if_present("inclination_deg")
    set_if_present("eccentricity")
    set_if_present("period_min")
    set_if_present("longitude_geo_deg")

    # NOTE: we do NOT use class_of_orbit as a numeric feature here,
    # because the model was trained on numeric columns only.
    orbit_class = str(payload.get("class_of_orbit", "UNKNOWN"))

    # 3) Build X with the exact same order of features as training
    X_df = pd.DataFrame([[row[f] for f in feature_names]], columns=feature_names)
    X = X_df.values  # np.array shape (1, n_features)

    # 4) Optionally scale if the training bundle says so (log_reg case)
    if use_scaled and scaler is not None:
        X_input = scaler.transform(X)
    else:
        X_input = X

    # 5) Predict probabilities
    proba = model.predict_proba(X_input)[0]  # shape (n_classes,)
    classes = model.classes_

    pred_idx = int(np.argmax(proba))
    pred_label = classes[pred_idx]

    probabilities = {
      str(label): float(p) for label, p in zip(classes, proba)
    }

    return {
        "input": {
            "perigee_km": row.get("perigee_km", 0.0),
            "apogee_km": row.get("apogee_km", 0.0),
            "inclination_deg": row.get("inclination_deg", 0.0),
            "eccentricity": row.get("eccentricity", 0.0),
            "period_min": row.get("period_min", 0.0),
            "longitude_geo_deg": row.get("longitude_geo_deg", 0.0),
            "class_of_orbit": orbit_class
        },
        "predicted_mission_type": str(pred_label),
        "probabilities": probabilities,
        "target_classes": target_classes,   # just informational
        "trained_feature_count": len(feature_names)
    }