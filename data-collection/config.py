# config.py
# Example configuration file
class Config:
    DEBUG = True
    MONGO_URI = 'mongodb://localhost:27017/flask_database'
    MONGO_URI_GOOGLE_AI = 'mongodb://localhost:27017/google_ai_api'
    MONGO_URI_GOOGLE_CLOUD = ('mongodb+srv://blizero:HcCeqjX3sJs6e91a@google-ai-api-database.07nq4fc.mongodb.net'
                              '/?retryWrites=true&w=majority&appName=google-ai-api-database')
    # Other configuration variables
