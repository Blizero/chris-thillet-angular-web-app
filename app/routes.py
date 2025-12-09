# app/routes.py
from bson import ObjectId
from flask import request, jsonify, current_app as app, redirect, url_for, render_template
import requests
from flask_cors import CORS, cross_origin
import google.generativeai as genai
from IPython.display import display
from IPython.display import Markdown

from flask import request, jsonify
from flask_cors import cross_origin

from .ml.predict import predict_mission

from app.schemes import SatelliteSchema
from app.utils.google_ai_api import configure_api, generate_text, gen_cq_gemini, to_markdown

allowed_origins = [
    "http://localhost:4200",
    "https://chris-thillet-angular-web-app-ca1b7f946c88.herokuapp.com"
    "https://chris-thillet-angular-web-app-ca1b7f946c88.herokuapp.com/generate"
]


CORS(app, resources={r"/*": {"origins": allowed_origins}})

@app.route('/generate', methods=['GET', 'POST', 'OPTIONS'])
@cross_origin(headers=['Content-Type'])
def generate_content():
    try:
        configure_api()
        jsonPrompt = request.get_json()
        prompt = jsonPrompt.get('prompt')
        response = gen_cq_gemini(prompt)
        markdown_result = to_markdown(response)
        display(markdown_result)
        print('GEMINI Generate Result: ', response)

        if response:
            return jsonify({'content': response})
        else:
            return jsonify({'error': 'Failed to generate content after multiple retries.'}), 500

    except Exception as e:
        print(f"Error in /generate: {e} ")
        return jsonify({'error during AI generation ': str(e)}), 500


@app.route('/responses', methods=['GET', 'OPTIONS'])
@cross_origin(headers=['Content-Type'])
def get_data():
    data = app.usc_satellite.find()
    response_schema = SatelliteSchema(many=True)
    print('response_schema ', response_schema)
    response_data = response_schema.dump(data)
    print('Data obtained from database ', response_data)
    return jsonify(response_data), 200


@app.route("/predict", methods=["POST", "OPTIONS"])
@cross_origin(headers=["Content-Type"])
def predict_route():
    data = request.get_json() or {}
    try:
        print('Predict_mission data: ', data)
        result = predict_mission(data)
    except Exception as e:
        print("Prediction error:", e)
        return jsonify({"error": "Failed to generate prediction"}), 500

    return jsonify(result), 200


@app.route('/save-response', methods=['GET', 'POST', 'OPTIONS'])
@cross_origin(headers=['Content-Type'])
def save_response():
    jsonResponse = request.get_json()

    username = jsonResponse.get('username')
    prompt = jsonResponse.get('prompt')
    response = jsonResponse.get('response')
    time = jsonResponse.get('time')

    app.usc_satellite.insert_one({'username': username, 'prompt': prompt, 'response': response, 'time': time})

    if username and prompt and response and time:
        return jsonify({'username': username, 'prompt': prompt, 'response': response, 'time': time})
    else:
        return jsonify({'error': 'Failed to save the last response in database.'}), 500



