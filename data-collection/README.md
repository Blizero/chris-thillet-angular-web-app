# Flask-MongoDB-App
This is a Flask and Angular 18 Application that connects to MongoDB and Google Gemini's AI API in order to create an AI chatbot

# Flask Application with MongoDB Database Connection

This is a simple Flask web application that demonstrates how to connect to a MongoDB database.
It utilizes google gemini's api models to generate text responses.

## Google AI Studio
GOOGLE_API_KEY is required in order to generate AI responses locally
https://aistudio.google.com/app/apikey


## Prerequisites

Before running the application, make sure you have the following installed:

- Python
- Flask
- MongoDB
- pymongo (Python MongoDB driver)

Create the virtual environment and source the activation script:  python3 -m venv venv && source venv/bin/activate

Install Flask: pip install Flask

You can install the required Python packages using pip:

```bash
pip install Flask pymongo
```

Setting up MongoDB
Install MongoDB on your system if you haven't already. You can download it from MongoDB's official website.
MongoDb Community - https://www.mongodb.com/try/download/community-kubernetes-operator
MongoDb Compass - https://www.mongodb.com/try/download/compass
MongoDb Atlas - https://www.mongodb.com/try/download/atlascli

Start the MongoDB server in your command prompt:

```bash
mongosh
```

Create a MongoDB database named google_ai_api and a collection named aiResponses where your data will be stored.

Start the Flask application:
```bash
python app.py
```

The application should now be running on http://127.0.0.1:5000/. You can access it in your web browser.

Usage
YoRha 2B powered by Google Gemini, accessible to everyone without needing an account. 
This chatbot leverages advanced natural language processing to deliver intelligent, accurate, and context-aware responses to user queries.

Project Structure
app.py: The main Flask application.
templates/index.html: HTML template for rendering the list of todo items.
License
This project is licensed under the MIT License - see the LICENSE file for details.

Acknowledgments
This project was created as an educational resource for connecting Flask with MongoDB.
Feel free to modify this README to include any additional information specific to your project. Enjoy using your Flask application with MongoDB!

### Application Created by Chris Thillet (Blizero)- June 2024 
