import os
from flask import Flask, render_template, request, url_for, redirect, jsonify
import requests
from app import create_app
from flask_cors import CORS, cross_origin
from pymongo import MongoClient, collection
from bson.objectid import ObjectId

app = create_app()

# The under if __name__ code block
port = os.environ.get("PORT", 5000)  # Heroku will set the PORT environment variable
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=port)  #running your server on development mode, setting debug to True
