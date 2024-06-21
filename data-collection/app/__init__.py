# app/__init__.py
import os

from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from pymongo import MongoClient


def create_app():
    app = Flask(__name__, static_folder='dist/your-angular-app')
    load_dotenv()  # Load environment variables from .env file
    # print("GOOGLE_API_KEY:", os.getenv('GOOGLE_API_KEY'))
    app.config.from_object('config.Config')

    # Set up a cloud MongoDB client
    client = MongoClient(app.config['MONGO_URI_GOOGLE_CLOUD'])

    # Create a local mongodb client
    # client = MongoClient('localhost', 27017)

    app.db = client.google_ai_api

    app.aiResponses = app.db.aiResponses

    # Enable CORS for all routes
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Set up the Google API key (fetch from environment or Colab userdata)
    # app.config['GOOGLE_API_KEY'] = os.getenv('GOOGLE_API_KEY')

    with app.app_context():
        from . import routes

    return app

