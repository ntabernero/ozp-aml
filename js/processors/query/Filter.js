var Filter = function() {}

Filter.prototype = {
	debugging: false
};

Filter.prototype.run = function (queryParameters) {
	var filterObj = {}
	return {
		operation: 'find',
		parameters: filterObj
	};
};

Filter.prototype.getQueryFields = function () {
	return ['filter'];
};

Filter.prototype.queryFieldParameters = function () {
	return [{
		type: 'String',
		field: 'filter',
		example: 'filter=name,address,_id',
		description: 'Filters a result set by a single or comma-delimted string of fields'
	}];
};

//Node.js module export
module.exports = Filter;