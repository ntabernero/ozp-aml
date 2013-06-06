var mongo = require('mongodb');
 
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;
 
var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('appsmall', server, {journal: true});
 
db.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'appsmall' database on 'categories' collection.");
        db.collection('categories', {strict:true}, function(err, collection) {
            if (err) {
                console.log("The 'categories' collection doesn't exist. Creating it with sample data...");
                populateDB();
            }
        });
    }
});

var populateDB = function() {
	 
    var categories = [{
    	"category":"Analytics",
    	"url":"/aml/myapps/",
    	"access":"NONE"
    },{
    	"category":"Business",
    	"url":"/aml/popular/",
    	"access":"NONE"
    },{
    	"category":"Training",
    	"url":"/aml/related/",
    	"access":"NONE"
    },{
    	"category":"Collaboration",
    	"url":"/aml/groups/",
    	"access":"NONE"
    },{
    	"category":"Games",
    	"url":"/aml/games/",
    	"access":"NONE"
    }];
 
    db.collection('categories', function(err, collection) {
        collection.insert(categories, {safe:true}, function(err, result) {});
    });
 
};

var parseQueryString = function (query) {
	var queryParams = {};
	if (query.hasOwnProperty('count')) {
		if (query.count) {
			queryParams.count = true;
		}
	}
	return queryParams;
};

exports.findAll = function(req, res) {
	var query = parseQueryString(req.query);
	var madeRequest = new Date();
    db.collection('categories', function(err, collection) {
        collection.find().toArray(function(err, items) {
        	var completedRequest = new Date();
        	var requestTime = completedRequest - madeRequest;
        	res.header("Access-Control-Allow-Origin", "*");
        	res.send({count: items.length, records: items, queryParameters: query, performanceMetrics: {requestStarted:madeRequest, requestCompleted:completedRequest, requestTime:requestTime / 1000 + 's'}});
        });
    });
};
 
exports.findById = function(req, res) {
    var id = req.params.id;
	var query = parseQueryString(req.query);
	
    console.log('Retrieving category: ' + id);
    db.collection('categories', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send({count: 1, records: [item], queryParameters: query});
        });
    });
};

exports.add = function(req, res) {
	var app = req.body;
    console.log('Adding category: ' + JSON.stringify(app));
    db.collection('categories', function(err, collection) {
        collection.insert(grouping, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
};

exports.update = function(req, res) {
    var id = req.params.id;
    var app = req.body;
    console.log('Updating category: ' + id);
    console.log(JSON.stringify(category));
    db.collection('categories', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, grouping, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating grouping: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' record(s) updated');
                res.send(grouping);
            }
        });
    });	
};

exports.delete = function(req, res) {
    var id = req.params.id;
    console.log('Deleting grouping: ' + id);
    db.collection('categories', function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' record(s) deleted');
                res.send(req.body);
            }
        });
    });
};