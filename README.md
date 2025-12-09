# Satellite Mission Prediction, AI Chat, and 3D Orbit Visualization
### *Angular 18 • Flask • scikit-learn • MongoDB • Three.js • Google Gemini AI*

This repository contains a full-stack application integrating:

- Angular 18 front-end
- Flask backend
- Google Gemini AI text generation
- Machine Learning mission prediction using scikit-learn
- MongoDB storage
- Three.js 3D Earth + satellite orbit visualization
- AG-Grid interactive satellite table
- A Jupyter Notebook for data preparation and model training

---

# Angular 18 Application

## Development Server

Use Conda or venv for environment creation.

```bash
ng serve
```

Navigate to:

```
http://localhost:4200/
```

The application automatically reloads when source files change.

## Build

```bash
ng build
```

## Unit Tests

```bash
ng test
```

## Key Angular Features

The front-end includes:

- Google Gemini AI chat component
- AG-Grid satellite table with row selection
- Three.js 3D Earth + orbit visualization
- Automatic ML prediction on satellite table row selection
- Responsive layout with Angular Material

Selecting a satellite row triggers:

1. A POST request to `/predict`
2. A machine learning inference
3. Live 3D orbit rendering with animated satellite motion

---

# Flask Backend

The Flask server handles:

- MongoDB interaction
- ML inference
- Google Gemini text generation
- REST API endpoints
- Model loading and preprocessing

## Flask Endpoints

| Endpoint | Method | Description |
|---------|--------|-------------|
| `/generate` | POST | Google Gemini text generation |
| `/save-response` | POST | Saves chat history to MongoDB |
| `/responses` | GET | Retrieves stored AI responses |
| `/predict` | POST | Runs ML mission prediction + returns cleaned satellite data |

## Backend Setup

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Run Flask:

```bash
python app.py
```

Flask runs on:

```
http://127.0.0.1:5000/
```

You may need to disable AirPlay on macOS if port 5000 is occupied.

---

# MongoDB Configuration

Supported options:

- MongoDB Community Server
- MongoDB Atlas Cloud
- MongoDB Compass for GUI

Start Mongo shell:

```bash
mongosh
```

The application uses:

```
Database: google_ai_api
Collections:
  - aiResponses
  - usc_satellite
```

Satellite data includes:

- name_of_satellite
- perigee_km
- apogee_km
- inclination_deg
- eccentricity
- longitude_geo_deg
- period_min
- class_of_orbit

---

# Machine Learning Model (scikit-learn)

The ML pipeline (in `app/ml/train_model.py`) includes:

- CSV ingestion (publicly hosted raw-link dataset)
- Data cleaning and feature engineering
- Label encoding for mission type
- Training three models:
    - RandomForestClassifier
    - LogisticRegression
    - GradientBoostingClassifier
- Best-model selection
- Saving a model bundle with:
    - model
    - scaler
    - feature names
    - class labels
    - timestamp

## Train the Model

```bash
python -m app.ml.train_model
```

## Prediction Example

Request:

```json
{
  "perigee_km": 476,
  "apogee_km": 500,
  "inclination_deg": 97.4,
  "eccentricity": 0.00175,
  "longitude_geo_deg": 0,
  "period_min": 95,
  "class_of_orbit": "LEO"
}
```

Response:

```json
{
  "input": {...},
  "predicted_mission_type": "Earth Observation",
  "probabilities": {
    "Communications": 0.14,
    "Earth Observation": 0.58,
    "Navigation": 0.01,
    "Other": 0.00,
    "Science/Tech": 0.25
  },
  "trained_feature_count": 107,
  "name_of_satellite": "WorldView-2"
}
```

---

# Three.js 3D Visualization

The app renders:

### Realistic Earth
- 2K NASA texture (`2k_earth_daymap.jpg`)
- Phong shading
- Ambient + directional lights
- Slow Earth rotation animation

###  Satellite Geometry
Each satellite includes:

- Main body (box geometry)
- Solar panels (box geometry)
- Antenna (cone/cylinder)

###  Orbital Rendering
- Orbit computed from perigee/apogee
- Plane tilted by inclination
- RAAN/longitude applied
- Orbit ring drawn with LineLoop

### ⏱Animated Satellite Motion
- Orbital period converted to angular velocity
- Time-scaled for visibility
- Satellite moves smoothly along orbit

Multiple satellites can be animated simultaneously.

---

# AG-Grid Integration

AG-Grid displays satellites with:

- Satellite name
- Orbital parameters
- Orbit class
- ID

Row selection triggers:

- Model prediction
- Orbit rendering
- Satellite animation update

---

# Jupyter Notebook (Machine Learning Workflow)

Notebook tasks:

- Load CSV from GitHub raw or Google Drive direct-download
- Clean data, normalize fields
- Handle missing values
- Encode class labels
- Plot histograms, correlations, distributions
- Train ML models
- Compare accuracy
- Save final CSV + model bundle

---

# Project Structure

```
/app
  app.py
  /ml
    train_model.py
    models/
  /routes
/src
  /app
    /components
    /services
  /assets/textures
public-assets/
notebooks/
requirements.txt
README.md
```

---

# License

MIT License.

---

# Acknowledgments

Application created by **Chris Thillet (Blizero)** — *December 2025*.
