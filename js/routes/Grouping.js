var mongo = require('mongodb');
 
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;
 
var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('appsmall', server, {journal: true});
 
db.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'appsmall' database on 'groupings' collection.");
        db.collection('groupings', {strict:true}, function(err, collection) {
            if (err) {
                console.log("The 'groupings' collection doesn't exist. Creating it with sample data...");
                populateDB();
            }
        });
    }
});

var populateDB = function() {
	 
    var groupings = [{
    	"grouping":"My Apps",
    	"url":"/aml/myapps/",
        "access":"NONE"
    },{
    	"grouping":"Popular",
    	"url":"/aml/popular/",
        "access":"NONE"
    },{
    	"grouping":"Related",
    	"url":"/aml/related/",
        "access":"NONE"
    },{
    	"grouping":"Groups",
    	"url":"/aml/groups/",
        "access":"NONE"
    },{
    	"grouping":"Organizations",
    	"url":"/aml/organizations/",
        "access":"NONE"
    }];
 
    db.collection('groupings', function(err, collection) {
        collection.insert(groupings, {safe:true}, function(err, result) {});
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
    db.collection('groupings', function(err, collection) {
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
	
    console.log('Retrieving grouping: ' + id);
    db.collection('groupings', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send({count: 1, records: [item], queryParameters: query});
        });
    });
};

exports.add = function(req, res) {
	var app = req.body;
    console.log('Adding grouping: ' + JSON.stringify(app));
    db.collection('groupings', function(err, collection) {
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
    console.log('Updating grouping: ' + id);
    console.log(JSON.stringify(grouping));
    db.collection('groupings', function(err, collection) {
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
    db.collection('groupings', function(err, collection) {
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