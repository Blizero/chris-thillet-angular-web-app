# importing from flask module the Flask class, the render_template function, the request function, url_for
# and redirect function to redirect to index home page after updating the app database
from flask import Flask, render_template, request, url_for, redirect, jsonify
# Mongoclient is used to create a mongodb client, so we can connect on the localhost
# with the default port
import requests
from pymongo import MongoClient, collection
# ObjectId function is used to convert the id string to an objectid that MongoDB can understand
from bson.objectid import ObjectId

# Instantiate the Flask class by creating a flask application
app = Flask(__name__)
# Create the mongodb client
client = MongoClient('localhost', 27017)

API_URL = "https://api.agify.io/"


@app.route("/", methods=('GET', 'POST'))
def index():
    name = request.form.get('name')
    # Make a GET request to the API
    response = requests.get(f"{API_URL}?name={name}")
    print('Respond obtained from Agify ', response.json())

    if response.status_code == 200:
        # Response example {"count": 180578, "name": "chris thillet", "age": 59}
        responseBody = response.json()

        if request.method == "POST":  # if the request method is post, then insert the todo document in todos collection
            name = request.form['name']
            age = responseBody['age']
            namesGuessed.insert_one({'name': name, 'age': age})
            return redirect(url_for('index'))  # redirect the user to home page
        all_namesguessed = namesGuessed.find()  # display all todo documents
        print(jsonify({"message": "Data fetched and saved to MongoDB"}), response.status_code)
        return render_template('index.html', namesGuessed=all_namesguessed)
    else:
        responseBody = response.json()

        if request.method == "POST":  # if the request method is post, then insert the todo document in todos collection
            name = request.form['name']
            age = responseBody['error']
            namesGuessed.insert_one({'name': name, 'age': age})
            return redirect(url_for('index'))  # redirect the user to home page
        all_namesguessed = namesGuessed.find()  # display all todo documents
        print(jsonify({"message": "Failed to fetch data"}), response.status_code)
        return render_template('index.html', namesGuessed=all_namesguessed)


# Delete Route
@app.post("/<id>/delete/")
def delete(id):  #delete function by targeting a todo document by its own id
    namesGuessed.delete_one({"_id": ObjectId(id)})  #deleting the selected todo document by its converted id
    return redirect(url_for('index'))  # again, redirecting you to the home page


db = client.flask_database  # creating your flask database using your mongo client
namesGuessed = db.namesGuessed  # creating a collection called "namesGuessed"
# The dunder if __name__ code block
if __name__ == "__main__":
    app.run(debug=True)  #running your server on development mode, setting debug to True
