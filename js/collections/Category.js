AppsMall.Collections.Category = Backbone.Collection.extend({  
	model: AppsMall.Models.Category,
	url: 'http://localhost:3000/aml/api/v1/category/',
	parse: function(data) {
		return data.records;
	}
});