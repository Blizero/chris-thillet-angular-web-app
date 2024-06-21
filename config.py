import os


class Config:
    DEBUG = True
    GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
    # MONGO_URI_GOOGLE_AI = 'mongodb://localhost:27017/google_ai_api' # Enable for local development
    MONGO_URI_GOOGLE_CLOUD = os.getenv('MONGO_URI_GOOGLE_CLOUD')
