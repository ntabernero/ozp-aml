// Function Bind prototype method.
require('./Bind')
var QueryParameterProcessor = require('./QueryParameterProcessor');
var MetricsCollector = require('./MetricsCollector');

// Include Express library.
var express = require('express');
var mongo = require('mongodb');

// API URL and version.
var versioning = require('../conf/version.json');

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
var routeConfig = require('../conf/routes.json'),
	idUrl = versioning.rest.url + 'v' + versioning.software.version + '/',
	routeHandlers = {};

// Open the database.
db.open(function (error) {
	for (var i = 0; i < routeConfig.routes.length; i++) {
		var routeConfigObject = routeConfig.routes[i];
		// Assign the route handler object.
		routeHandlers[routeConfigObject.name] = new RestControllerFactory({
			routeName: routeConfigObject.name,
			database: db,
			url: idUrl,
			debugging: true,
			injection: routeConfigObject.data
		},{
			metricsCollector: new MetricsCollector(db),
			queryProcessor: new QueryParameterProcessor(true)
		});
		
		var scope = routeHandlers[routeConfigObject.name];
		// Assign HTTP methods to route object methods.
		app.get(idUrl		+ routeConfigObject.name + '/',		routeHandlers[routeConfigObject.name].findAll.bind(scope));
		app.get(idUrl		+ routeConfigObject.name + '/:id',	routeHandlers[routeConfigObject.name].findById.bind(scope));
		app.post(idUrl		+ routeConfigObject.name + '/',		routeHandlers[routeConfigObject.name].add.bind(scope));
		app.put(idUrl		+ routeConfigObject.name + '/:id',	routeHandlers[routeConfigObject.name].update.bind(scope));
		app.delete(idUrl	+ routeConfigObject.name + '/:id',	routeHandlers[routeConfigObject.name].remove.bind(scope));
	}
});

// Kick start REST controller process.
app.listen(3000);
console.log('AML Node.js API on port 3000.');