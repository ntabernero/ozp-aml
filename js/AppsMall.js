window.AppsMall = {
	Models: {},
	Collections: {},
	Views: {}
};

$(document).ready(function(){
	$(".rslides").responsiveSlides({
		nav: true,
		auto: true,
		pager: false,
		navContainer: "rslides_container",
		namespace: "centered-btns"
	});
	
	var groupingCollection = new AppsMall.Collections.Grouping();
	groupingCollection.fetch({
		complete: function () {
			var groupingView = new AppsMall.Views.Grouping({
				collection: groupingCollection
			});
			$('#groupings').append(groupingView.render().el);
		}
	});
	
	var categoryCollection = new AppsMall.Collections.Category();
	categoryCollection.fetch({
		complete: function () {
			var categoryView = new AppsMall.Views.Category({
				collection: categoryCollection
			});
			$('#categories').append(categoryView.render().el);
		}
	});

	//$(".fullheight").height($(document).height() - 2);
	$(window).resize(function(){
        //$(".fullheight").height($(document).height() - 2);
    });
}); 