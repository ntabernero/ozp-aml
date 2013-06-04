$(document).ready(function(){

	$(".rslides").responsiveSlides({
		nav: true,
		auto: true,
		pager: false,
		navContainer: "rslides_container",
		namespace: "centered-btns"
	});
	
	$(".fullheight").height($(document).height() - 2);
	
	$(window).resize(function(){
        //$(".fullheight").height($(document).height() - 2);
    });
});