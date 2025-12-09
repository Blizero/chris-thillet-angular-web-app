import os


class Config:
    DEBUG = True
    GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
    # MONGO_URI_GOOGLE_AI = 'mongodb://localhost:27017/UCS_Satellite'
    MONGO_URI_GOOGLE_AI = os.getenv("MONGO_URI_GOOGLE_CLOUD", "mongodb://localhost:27017")
    # app/ml/train_model.py (or config)

    MONGO_DB_NAME = os.getenv("MONGO_URI_GOOGLE_CLOUD", "USC_Satellite")
    MONGO_UCS_COLLECTION = os.getenv("MONGO_UCS_COLLECTION", "usc_satellite")
    # MONGO_URI_GOOGLE_CLOUD = os.getenv('MONGO_URI_GOOGLE_CLOUD')
