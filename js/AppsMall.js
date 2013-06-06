// Define window level global.
window.AppsMall = {
	Models: {},
	Collections: {},
	Views: {}
};

// Alias '_id' to 'id' in Backbone.
Backbone.Model.prototype.idAttribute = "_id";

// Kickstart renderer components on 'ready'.
$(document).ready(function(){
	
	// Set up Responsive Slides.
	$(".rslides").responsiveSlides({
		nav: true,
		auto: true,
		pager: false,
		navContainer: "rslides_container",
		namespace: "centered-btns"
	});
	
	// Create a new grouping collection and render templates.
	var groupingCollection = new AppsMall.Collections.Grouping();
	groupingCollection.fetch({
		complete: function () {
			var groupingView = new AppsMall.Views.Grouping({
				collection: groupingCollection
			});
			$('#groupings').append(groupingView.render().el);
		}
	});
	
	// Create a new category collection and render templates.	
	var categoryCollection = new AppsMall.Collections.Category();
	categoryCollection.fetch({
		complete: function () {
			var categoryView = new AppsMall.Views.Category({
				collection: categoryCollection
			});
			$('#categories').append(categoryView.render().el);
		}
	});

	// Assign panel heights [temp code, find CSS solution]
	//$(".fullheight").height($(document).height() - 2);
	$(window).resize(function(){
        //$(".fullheight").height($(document).height() - 2);
    });
});