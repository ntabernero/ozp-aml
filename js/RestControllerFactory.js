// MongoDB and BSON driver support.
var mongo = require('mongodb');
var BSON = mongo.BSONPure;
var TimingCollector = require('./TimingCollector');

/**
 * Creates a RESTful controller specific to a MongoDB database and collection
 * that creates entry points for a set of methods to perform CRUD operations.
 * 
 * @class RestControllerFactory
 * @constructor
 */

var RestControllerFactory = function(config, mixins) {
	// Persist REST/collection options inside new object.
	this.url = config.url;
	this.debugging = config.debugging;
	this.database = config.database;
	this.collectionName = config.routeName;
	this.timing = new TimingCollector();
	this.injection = config.injection;
	
	if (typeof mixins === 'object') {
		for (var mixin in mixins) {
			if (mixins.hasOwnProperty(mixin)) {
				this[mixin] = mixins[mixin];
			}
		}
	}
	
	if (this.debugging) console.log('RestControllerFactory::Constructor --> (\'', this.collectionName, '\',\'', this.database.databaseName, '\')');
	this.openCollection.bind(this)();
};

RestControllerFactory.prototype = {
	collectionName: null,
	database: null,
	collection: null,
	url: null,
	debugging: null,
	timing: null
};

/**
 * Opens a MongoDB collection from the supplied database.
 * 
 * @method openCollection
 * @param {Object} error MongoDB driver error object
 */

RestControllerFactory.prototype.openCollection = function () {
	if (this.debugging) console.log('RestControllerFactory::openCollection--> Opening collection \'' + this.collectionName + '\'');
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
	if (this.debugging) console.log('RestControllerFactory::openCollection--> Scanning collection \'' + this.collectionName + '\'');
	this.collection = collection;
	try {
		if (error) {
			this.populateCollection.bind(this)();
		}
		else {
			if (this.debugging) console.log('RestControllerFactory::openCollection--> Collection \'' + this.collectionName + '\' exists and contains data');
		}
	}
	catch (exception) {
		if (this.debugging) console.log('RestControllerFactory::openCollection--> Cannot populate collection with stub data: ' + exception);
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
	if (this.debugging) console.log('RestControllerFactory::assignRouteMethods--> Returning RESTful method object for \'' + this.collectionName + '\'');
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
	if (this.injection) {
		if (this.debugging) console.log('RestControllerFactory::populateCollection --> Injecting stub data for  \'' + this.collectionName + '\'');
		try {
			var injectionJson = require('../testData/' + this.injection);
			this.database.collection(this.collectionName, function(err, collection) {
		        collection.insert(injectionJson.injectableRecords, {safe:true}, function(err, result) {});
		    });
		}
		catch (exception) {
			if (this.debugging) throw "Unable to load injection data for collection: " + exception;
		}
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
 * Merges two Javascript objects together from arguments.
 *
 * @param {Array} arguments Arguments array to function declaration.
 * @return {Object} Merged Javascript object.
 */

RestControllerFactory.prototype._mergeObjects = function () {
	var o = {};
	for (var i = arguments.length - 1; i >= 0; i --) {
		var s = arguments[i];
		for (var k in s) o[k] = s[k];
	}
	return o;
};

/**
 * 'Find All' MongoDB collection 'read' method, CORS enabled.
 * 
 * @method findAll
 * @param {Object} req Express request object
 * @param {Object} res Express results object
 */

RestControllerFactory.prototype.findAll = function (req, res) {
	var operations = this.queryProcessor.parseRestParameters(req, res);
	var _injectRecordUrls = this._injectRecordUrls.bind(this);
	var _mergeObjects = this._mergeObjects.bind(this);
	var timing = this.timing, timingRecords;
	var metricsCollector = this.metricsCollector;

	// Embedded timing parameter check.
	timing.start();
	var database = this.database;
	var collectionName = this.collectionName;

	// Scan the collection.
    this.database.collection(this.collectionName, function(err, collection) {
    	// Hijack the chained MongoDB operator method.
    	var mongoOp = collection, initialFind = false;
    	
    	// Include every query operator as a chained method.
    	for (var i = 0; i < operations.query.length; i++) {
    		if (operations.query[i].operation === 'find') {
    			var chainedOperator = operations.query[i];
        		mongoOp = mongoOp[chainedOperator.operation](chainedOperator.parameters);
    			operations.query.splice(i, 1);
    			initialFind = true;
    		}
    	}
    	
    	// Spawn an initial 'find()' if one was not specified in the processors.
    	if (!initialFind) mongoOp = mongoOp.find();
    	
    	// Include every query operator as a chained method.
    	for (var i = 0; i < operations.query.length; i++) {
    		var chainedOperator = operations.query[i];
    		mongoOp = mongoOp[chainedOperator.operation](chainedOperator.parameters);
    	}
    	
    	// Once chained methods are complete, return as an array of items.
    	mongoOp.toArray(function(err, items) {
    		// Embedded timing parameter check.
  			timingRecords = timing.stop(req);
			metricsCollector.put(req, timingRecords);

			database.collection(collectionName, function(e, coll) {
				coll.find().count(function (e, total) {
					// Inject the record URLs for linking.
		        	var responseObject = {count: items.length, total: total, records: _injectRecordUrls(items)};
		        	if (operations.metadata.length > 0) {
		        		for (var i = 0; i < operations.metadata.length; i++) {
		        			responseObject = _mergeObjects(responseObject, operations.metadata[i]);
		        		}
		        	}
		        	if (req.query.hasOwnProperty('request_timing')) {
		    			if (req.query.request_timing.toLowerCase() === 'true') {
		    				responseObject = _mergeObjects(responseObject, {requestTiming: timingRecords});
		    			}
		    		}
		        	res.header("Access-Control-Allow-Origin", "*"); // CORS header, blanket white list.
		        	res.send(responseObject);	
				});
			});
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
    var id = req.params.id, item = req.body, debugging = this.debugging;
    if (this.debugging) console.log('Updating ' + this.collectionName + ': ' + id);
    console.log(JSON.stringify(item));
    this.database.collection(this.collectionName, function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, item, {safe:true}, function(err, result) {
            if (err) {
            	if (debugging) console.log('Error updating ' + this.collectionName + ': ' + err);
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