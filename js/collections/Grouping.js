AppsMall.Collections.Grouping = Backbone.Collection.extend({  
	model: AppsMall.Models.Grouping,
	url: 'http://localhost:3000/aml/api/v1/grouping/',
	parse: function(data) {
		return data.records;
	}
});