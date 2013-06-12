var fs = require('fs');

/**
 * Parses parameters from the HTTP(s) body and maps appropriate functions
 * where appropriate. Uses modular approach to delegated processors by attaching
 * from file system.
 * 
 * @class QueryParameterProcessor
 * @constructor
 */

var QueryParameterProcessor = function(debugging) {
	this.debugging = debugging;
	var processors = {
		query: [],
		metadata: [],
		performance: []
	};
	
	if (this.debugging) console.log('QueryParameterProcessor::Constructor --> Scanning folder for processors: ' + __dirname);
	fs.readdirSync(__dirname + '/processors/').forEach(function(folder) {
		fs.readdirSync(__dirname + '/processors/' + folder).forEach(function(file) {
			if (debugging) console.log('QueryParameterProcessor::Constructor --> Attaching ' + file + ' as a ' + folder + ' processor.');
			var processorName = file.slice(0, -3).toLowerCase(); 
			var processorDef = require(__dirname + '/processors/' + folder + '/' + file);
			
			var obj = {};
			obj[processorName] = new processorDef();
			processors[folder].push(obj);
		});
	});
	
	this.processors = processors;
};

QueryParameterProcessor.prototype = {
	debugging: null,
	processors: {
		query: [],
		metadata: [],
		performance: []
	}
};

QueryParameterProcessor.prototype.parseRestParameters = function (req, res) {
	var i, j, toProcess = {
		query: [],
		metadata: []
	};

	// Execute all query processors.
	for (i = 0; i < this.processors.query.length; i++) {
		var operations = [];
		var processorName = Object.keys(this.processors.query[i])[0] 
		var processorQueryFields = this.processors.query[i][processorName].getQueryFields();
		
		for (var restfulParameter in req.query) {
			for (j = 0; j < processorQueryFields.length; j++) {
				if (restfulParameter === processorQueryFields[j]) {
					var newOperation = {};
					newOperation[restfulParameter] = req.query[restfulParameter];
					operations.push(newOperation);
				}
			}
		}
		if (operations.length > 0) {
			toProcess.query.push(this.processors.query[i][processorName].run(operations));
		}
	}
	
	// Execute all metadata processors.
	for (i = 0; i < this.processors.metadata.length; i++) {
		var operations = [];
		var processorName = Object.keys(this.processors.metadata[i])[0] 
		var processorQueryFields = this.processors.metadata[i][processorName].getQueryFields();
		
		for (var restfulParameter in req.query) {
			for (j = 0; j < processorQueryFields.length; j++) {
				if (restfulParameter === processorQueryFields[j]) {
					if (req.query[restfulParameter] === 'true') {
						var newOperation = {};
						newOperation[restfulParameter] = req.query[restfulParameter];
						operations.push(newOperation);
					}
				}
			}
		}
		
		if (operations.length > 0) {
			toProcess.metadata.push(this.processors.metadata[i][processorName].run(req, res));
		}
	}
	
	return toProcess;
}

//Node.js module export
module.exports = QueryParameterProcessor;