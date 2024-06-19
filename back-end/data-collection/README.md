# Flask-MongoDB-App
This is a Flask application where we are going to connect MongoDB with Flask Application
# | Chris Thillet - CU Boulder |
| Chris Thillet -June 2024 |

# Flask Application with MongoDB Database Connection

This is a simple Flask web application that demonstrates how to connect to a MongoDB database. It allows you to add and delete ages guessed from name using the Agify API, https://api.agify.io/?name={{name}}
There's a limit of 100 requests per window, if the limit is reached, the error message "Request limit reached" obtained will be displayed and saved to the database.

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

Create a MongoDB database named flask_db and a collection named todos where your data will be stored.

Start the Flask application:
```bash
python app.py
```

The application should now be running on http://127.0.0.1:5000/. You can access it in your web browser.

Usage
To guess a new age, visit the homepage and use the form to submit a name and it will make a request to agify's API, generating a new name

To delete a name, click on the "Delete" button next to the item.

Project Structure
app.py: The main Flask application.
templates/index.html: HTML template for rendering the list of todo items.
License
This project is licensed under the MIT License - see the LICENSE file for details.

Acknowledgments
This project was created as an educational resource for connecting Flask with MongoDB.
Feel free to modify this README to include any additional information specific to your project. Enjoy using your Flask application with MongoDB!
