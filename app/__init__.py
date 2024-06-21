# app/__init__.py
import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from pymongo import MongoClient

allowed_origins = [
    "http://localhost:4200",
    "https://chris-thillet-angular-web-app-ca1b7f946c88.herokuapp.com"
    "https://chris-thillet-angular-web-app-ca1b7f946c88.herokuapp.com/generate"
]


def create_app():
    app = Flask(__name__, static_folder='../dist/browser')
    load_dotenv()  # Load environment variables from .env file
#     print("GOOGLE_API_KEY:", os.getenv('GOOGLE_API_KEY'))
    app.config.from_object('config.Config')

    @app.route('/')
    def index():
        return send_from_directory(app.static_folder, 'index.html')

    @app.route('/<path:path>', methods=['GET'])
    def serve_angular(path=None):
        if path is not None and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        return send_from_directory(app.static_folder, 'index.html')

    @app.route('/<path:path>')
    def static_proxy(path):
        return send_from_directory(app.static_folder, path)

    # Set up a cloud MongoDB client
    client = MongoClient(app.config['MONGO_URI_GOOGLE_CLOUD'])

    # Create a local mongodb client
    # client = MongoClient('localhost', 27017)

    app.db = client.google_ai_api

    app.aiResponses = app.db.aiResponses

    # Enable CORS for all routes
    CORS(app, resources={r"/*": {"origins": allowed_origins}})

    # Set up the Google API key (fetch from environment or Colab userdata)
    # app.config['GOOGLE_API_KEY'] = os.getenv('GOOGLE_API_KEY')

    with app.app_context():
        from . import routes

    return app

