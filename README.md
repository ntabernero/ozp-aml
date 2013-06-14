ozp-aml
=======

OZONE Platform AppsMall prototype with Backbone.js on the frontend and Node.js, Express, and MongoDB on the backend.

#### Prerequisites
Download and install the following, see the relevant documentation for help:

1. Node.js - www.nodejs.org
2. MongoDB - www.mongodb.org
3. A webserver such as Apache or Nginx to serve the static files

#### Setup & Use
Once you have the prerequisites and have cloned the code:

1. Run `npm install` to grab the dependencies.
2. Navigate to your MongoDB directory and run `./bin/mongod` to start the database.
3. Back in the ozp-aml directory, run `node AppsMallApi` to start the REST API.
4. Navigate to `localhost` using your favorite webserver to view the app.
5. If you would like to hit the REST API directly, it is located at `localhost:3000/aml/api/v1/`.  There you can view the "app", "grouping", "category", and "metrics" collections. (Ex: `localhost:3000/aml/api/v1/app/grouping/`)

#### Utils
You can also `cd util/` and run `node SSLCertGenerator` to generate random test certs.  This file takes command line arguments - see the file for more details.
