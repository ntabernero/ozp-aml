AppsMall.Collections.App = Backbone.Collection.extend({  
	model: AppsMall.Models.App,
	url: '/aml/api/apps.json'
});