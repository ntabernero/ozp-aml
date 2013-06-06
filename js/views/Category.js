AppsMall.Views.Category = Backbone.View.extend({
    tagName: 'ul',
    className: 'unstyled',
    render: function () {
    	var source   = $("#category-template").html();
    	var template = Handlebars.compile(source);
    	this.collection.each(function(category) {
        	this.$el.append(template({category: category.get('category'), url: category.get('url'), access: category.get('access')}));        	
        }, this);

        return this;
    }
});