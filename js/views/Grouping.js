AppsMall.Views.Grouping = Backbone.View.extend({
    tagName: 'ul',
    className: 'unstyled',
    render: function () {
    	var source   = $("#grouping-template").html();
    	var template = Handlebars.compile(source);
        this.collection.each(function(grouping) {
        	this.$el.append(template({grouping: grouping.get('grouping'), url: grouping.get('url'), access: grouping.get('access')}));        	
        }, this);

        return this;
    }
});