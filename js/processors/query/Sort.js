var Sort = function() {}

Sort.prototype = {
	debugging: false
};

Sort.prototype.run = function (queryParameters) {
	var i, j, k, obj, key, sortDir, sortFields = {}, sortObj = {};
	for (i = 0; i < queryParameters.length; i++) {
		obj = queryParameters[i];
		for (key in obj) {
			if (key === 'sort_dir') {
				sortDir = (obj[key].toLowerCase() === 'asc') ? 1 : -1;
			}
			else {
				if (typeof obj[key] === 'string') {
					sortFields[obj[key]] = true;
				}
				else {
					for (j = 0; j < obj[key].length; j++) {
						//Tokenized string.
						if (obj[key][j].indexOf(',') > -1) {
							var fieldList = obj[key][j];
							var fieldEntries = fieldList.split(',');
							for (k = 0; k < fieldEntries.length; k++) {
								sortFields[fieldEntries[k]] = true;
							}
						}
						// Single field value.
						else {
							sortFields[obj[key][j]] = true;
						}
					}
				}
			}
		}
	}

	// Default to descending.
	sortDir = sortDir || 1;
	
	// Recompose to MongoDB object
	for (key in sortFields) {
		sortObj[key] = sortDir;
	}
	
	return {
		operation: 'sort',
		parameters: sortObj
	};
};

Sort.prototype.getQueryFields = function () {
	return ['sort_by', 'sort_dir'];
};

Sort.prototype.queryFieldParameters = function () {
	return [{
		type: 'String',
		field: 'sort_by',
		example: 'sort_by=name,address,_id',
		description: 'Sorts a result set by a single or comma-delimted string of fields'
	},{
		type: 'String',
		field: 'sort_dir',
		example: 'sort_dir=asc',
		description: 'Sorts a record set by field in ascending (asc) or descending (desc) order'
	}];
};

//Node.js module export
module.exports = Sort;