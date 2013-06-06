AppsMall.Collections.App = Backbone.Collection.extend({  
	model: AppsMall.Models.App,
	url: 'http://localhost:3000/aml/api/v1/app/',
	parse: function(data) {
		return data.records;
	}
});