AppsMall.Views.App = Backbone.View.extend({
    tagName: 'div',
    render: function () {
        this.collection.each(function(app) {
        	console.log(app);
        }, this);

        return this;
    }
});