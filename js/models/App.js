AppsMall.Models.App = Backbone.Model.extend({  
    initialize: function () {},  
	defaults: {
		users: 0,
		rating: 0,
		numRatings: 0,
		version: 1.0,
		accessible: true
	}  
});