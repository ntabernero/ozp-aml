AppsMall.Views.NavigationMenu = Backbone.View.extend({
    tagName: 'div',

    render: function () {
        this.collection.each(function(person) {
            var personView = new App.Views.Person({ model: person });
            this.$el.append(personView.render().el);
        }, this);

        return this;
    }
});