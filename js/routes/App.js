var mongo = require('mongodb');
 
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;
 
var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('appsmall', server, {journal: true});
 
db.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'appsmall' database on 'applications' collection.");
        db.collection('applications', {strict:true}, function(err, collection) {
            if (err) {
                console.log("The 'applications' collection doesn't exist. Creating it with sample data...");
                populateDB();
            }
        });
    }
});

var populateDB = function() {
	 
    var apps = [{
    	"name":"Map View",
    	"version":1.3,
    	"lifecycleState":"prod",
    	"accessible":false,
    	"users":21031,
    	"ratings":3012,
    	"rating":3.5,
    	"description":"This is a geospatial view to allow for seeing map data and using it.",
    	"url":"aml/apps/1",
    	"organization":"Personal",
    	"largePhoto":"/aml/img/mapViewLarge.png",
    	"smallPhoto":"/aml/img/mapViewSmall.png"
    },{
    	"name":"Data Grid",
    	"version":0.7,
    	"lifecycleState":"beta",
    	"accessible":true,
    	"users":102,
    	"ratings":35,
    	"rating":2.0,
    	"description":"Shows data in a grid.",
    	"url":"aml/apps/2",
    	"organization":"Industry",
    	"largePhoto":"/aml/img/dataGridLarge.png",
    	"smallPhoto":"/aml/img/dataGridSmall.png"
    },{
    	"name":"GoAmerica",
    	"version":0.1,
    	"lifecycleState":"alpha",
    	"accessible":true,
    	"users":31,
    	"ratings":2,
    	"rating":1.0,
    	"description":"Shows an eagle flying around.",
    	"url":"aml/apps/3",
    	"organization":"Personal",
    	"largePhoto":"/aml/img/goAmericaLarge.png",
    	"smallPhoto":"/aml/img/goAmericaSmall.png"
    }];
 
    db.collection('applications', function(err, collection) {
        collection.insert(apps, {safe:true}, function(err, result) {});
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
    db.collection('applications', function(err, collection) {
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
	
    console.log('Retrieving app: ' + id);
    db.collection('applications', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send({records: [item], queryParameters: query});
        });
    });
};

exports.add = function(req, res) {
	var app = req.body;
    console.log('Adding app: ' + JSON.stringify(app));
    db.collection('applications', function(err, collection) {
        collection.insert(app, {safe:true}, function(err, result) {
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
    console.log('Updating app: ' + id);
    console.log(JSON.stringify(app));
    db.collection('applications', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, app, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating app: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' record(s) updated');
                res.send(app);
            }
        });
    });	
};

exports.delete = function(req, res) {
    var id = req.params.id;
    console.log('Deleting app: ' + id);
    db.collection('applications', function(err, collection) {
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