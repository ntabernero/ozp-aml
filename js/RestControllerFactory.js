// MongoDB and BSON driver support.
var mongo = require('mongodb');
var BSON = mongo.BSONPure;

/**
 * Creates a RESTful controller specific to a MongoDB database and collection
 * that creates entry points for a set of methods to perform CRUD operations.
 * 
 * @class RestControllerFactory
 * @constructor
 */

var RestControllerFactory = function(collectionName, database, recordUrl, logging) {
	// Persist REST/collection options inside new object.
	this.url = recordUrl;
	this.logging = logging;
	this.database = database;
	this.collectionName = collectionName;
	console.log('RestControllerFactory::Constructor -->(\'', this.collectionName, '\',\'', this.database.databaseName, '\')');
	this.openCollection.bind(this)();
};

RestControllerFactory.prototype = {
	collectionName: null,
	database: null,
	collection: null,
	url: null,
	logging: null,
	fns: {
		query: {},
		metadata: {},
		performance: {}
	}
};

/**
 * Opens a MongoDB collection from the supplied database.
 * 
 * @method openCollection
 * @param {Object} error MongoDB driver error object
 */

RestControllerFactory.prototype.openCollection = function () {
	console.log('RestControllerFactory::openCollection--> Opening collection \'' + this.collectionName + '\'');
	this.database.collection(this.collectionName, {
		strict: true
	}, this.scanCollection.bind(this));
};

/**
 * Scans a MongoDB collection to determine if the collection exists and has data.
 * 
 * @method scanCollection
 * @param {Object} error 		MongoDB driver error object
 * @param {Object} collection	MongoDB driver collection object
 */

RestControllerFactory.prototype.scanCollection = function (error, collection) {
	console.log('RestControllerFactory::openCollection--> Scanning collection \'' + this.collectionName + '\'');
	this.collection = collection;
	try {
		if (error) {
			this.populateCollection.bind(this)();
		}
		else {
			console.log('RestControllerFactory::openCollection--> Collection \'' + this.collectionName + '\' exists and contains data');
		}
	}
	catch (exception) {
		console.log('RestControllerFactory::openCollection--> Cannot populate collection with stub data: ' + exception);
	}
	finally {
		this.assignRouteMethods.bind(this)();
	}
};

/**
 * Assigns RESTful router methods to internal factory scope and passes back an object.
 * 
 * @method assignRouteMethods
 * @return {Object} All CRUD RESTful route bindings
 */

RestControllerFactory.prototype.assignRouteMethods = function () {
	console.log('RestControllerFactory::assignRouteMethods--> Returning RESTful method object for \'' + this.collectionName + '\'');
	return {
		add:		this.add.bind(this),
		update:		this.update.bind(this),
		remove:		this.remove.bind(this),
		findAll: 	this.findAll.bind(this),
		findById: 	this.findById.bind(this),
	}
};

/**
 * Injects stub data for a collection if none exists.
 * 
 * @method populateCollection
 */

RestControllerFactory.prototype.populateCollection = function () {
	console.log('RestControllerFactory::populateCollection --> Injecting stub data for  \'' + this.collectionName + '\'');
	try {
		var injectionJson = require('../testData/injectable' + this._capitalizeFirstLetter(this.collectionName) + 'Records.json');
		this.database.collection(this.collectionName, function(err, collection) {
	        collection.insert(injectionJson, {safe:true}, function(err, result) {});
	    });
	}
	catch (exception) {
		throw "Unable to load injection data for collection: " + exception;
	}
};

/**
 * Capitalizes the first letter of a string. Used for test data injection.
 * 
 * @method _capitalizeFirstLetter
 * @private
 * @param {String} string String to be capitalized
 */

RestControllerFactory.prototype._capitalizeFirstLetter = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * Injects record URLs from the API into the data objects.
 * 
 * @method _injectRecordUrls
 * @private
 * @param {Array} records An array of record objects
 * @return {Array} An injected array of record objects
 */

RestControllerFactory.prototype._injectRecordUrls = function (records) {
	var i, injectedRecords = [];
	for (i = 0; i < records.length; i++) {
		var object = records[i];
		object.url = this.url + this.collectionName + '/' + object._id;
		injectedRecords.push(object);
	}
	return injectedRecords;
};

/**
 * Parses query parameters from a HTTP(s) request body.
 * 
 * @method parseQueryParameters
 * @param {Object} queryParameters Express request body object with query parameters
 * @return {Object} Attached functions to handle query parameters
 */

RestControllerFactory.prototype.parseQueryParameters = function (queryParameters) {
	var key, fnType, fns = {};
	for (key in queryParameters) {
		for (fnType in this.fns) {
			if (typeof this.fns[fnType][key] === 'function') {
				fns[fnType] = [];
				fns[fnType].push(this.fns[fnType][key].bind(this));
			}
		}
	}
	return fns;
};

/**
 * 'Find All' MongoDB collection 'read' method, CORS enabled.
 * 
 * @method findAll
 * @param {Object} req Express request object
 * @param {Object} res Express results object
 */

RestControllerFactory.prototype.findAll = function (req, res) {
	var queryFns = this.parseQueryParameters(req.query);
	var _injectRecordUrls = this._injectRecordUrls.bind(this);
    this.database.collection(this.collectionName, function(err, collection) {       
    	collection.find().toArray(function(err, items) {
        	var responseObject = {records: _injectRecordUrls(items)};
        	res.header("Access-Control-Allow-Origin", "*"); // CORS header, blanket white list.
        	res.send(responseObject);
        });
    });
};

/**
 * 'Find by ID' MongoDB collection 'read' method, CORS enabled.
 * 
 * @method findById
 * @param {Object} req Express request object
 * @param {Object} res Express results object
 */

RestControllerFactory.prototype.findById = function(req, res) {
    var id = req.params.id;
	var query = this.parseQueryParameters(req.query);
	var _injectRecordUrls = this._injectRecordUrls.bind(this);
	
    this.database.collection(this.collectionName, function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
        	var responseObject = {records: _injectRecordUrls([item])};
        	res.header("Access-Control-Allow-Origin", "*"); // CORS header, blanket white list.
        	res.send(responseObject);
        });
    });
};

/**
 * 'Add' MongoDB collection 'create' method, CORS enabled.
 * 
 * @method add
 * @param {Object} req Express request object
 * @param {Object} res Express results object
 */

RestControllerFactory.prototype.add = function(req, res) {
	var item = req.body;
    this.database.collection(this.collectionName, function(err, collection) {
        collection.insert(item, {safe:true}, function(err, result) {
            if (err) {
            	res.header("Access-Control-Allow-Origin", "*"); // CORS header, blanket white list.
                res.send({'error':'An error has occurred'});
            }
            else {
                res.send(result[0]);
            }
        });
    });
};

/**
 * 'update' MongoDB collection 'update' method, CORS enabled.
 * 
 * @method update
 * @param {Object} req Express request object
 * @param {Object} res Express results object
 */

RestControllerFactory.prototype.update = function(req, res) {
    var id = req.params.id;
    var item = req.body;
    console.log('Updating ' + this.collectionName + ': ' + id);
    console.log(JSON.stringify(item));
    this.database.collection(this.collectionName, function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, item, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating ' + this.collectionName + ': ' + err);
            	res.header("Access-Control-Allow-Origin", "*"); // CORS header, blanket white list.
                res.send({'error':'An error has occurred'});
            }
            else {
                res.send(result[0]);
            }
        });
    });	
};

/**
 * 'Remove' MongoDB collection 'delete' method, CORS enabled.
 * 
 * @method remove
 * @param {Object} req Express request object
 * @param {Object} res Express results object
 */

RestControllerFactory.prototype.remove = function(req, res) {
    var id = req.params.id;
    this.database.collection(this.collectionName, function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
            if (err) {
            	res.header("Access-Control-Allow-Origin", "*"); // CORS header, blanket white list.
                res.send({'error':'An error has occurred - ' + err});
            }
            else {
                res.send(req.body);
            }
        });
    });
};

// Node.js module export
module.exports = RestControllerFactory;