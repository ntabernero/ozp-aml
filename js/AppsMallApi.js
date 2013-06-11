// Function Bind prototype method.
require('./Bind')

// Include Express library.
var express = require('express');
var mongo = require('mongodb');

// API URL and version.
var url = '/aml/api/', version = 1;

// Create and connect to MongoDB database.
var Server = mongo.Server, Db = mongo.Db;
var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('appsmall', server, {journal: true});

// Kick start RESTful controller factory for collection-based routes.
var RestControllerFactory = require('./RestControllerFactory');

// Define route modules.
var app = express();

//Extensive logging.
app.configure(function () {
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
});

// Assign routes and a route handler object.
var routes = ['app', 'category', 'grouping'], routeHandlers = {}, idUrl = url + 'v' + version + '/';

// Open the database.
db.open(function (error) {
	for (var i = 0; i < routes.length; i++) {
		// Assign the route handler object.
		routeHandlers[routes[i]] = new RestControllerFactory(routes[i], db, idUrl, true);
		
		var scope = routeHandlers[routes[i]];
		
		// Assign HTTP methods to route object methods.
		app.get(idUrl		+ routes[i] + '/',		routeHandlers[routes[i]].findAll.bind(scope));
		app.get(idUrl		+ routes[i] + '/:id',	routeHandlers[routes[i]].findById.bind(scope));
		app.post(idUrl		+ routes[i] + '/',		routeHandlers[routes[i]].add.bind(scope));
		app.put(idUrl		+ routes[i] + '/:id',	routeHandlers[routes[i]].update.bind(scope));
		app.delete(idUrl	+ routes[i] + '/:id',	routeHandlers[routes[i]].remove.bind(scope));
	}
});

// Kick start REST controller process.
app.listen(3000);
console.log('AML Node.js API on port 3000.');