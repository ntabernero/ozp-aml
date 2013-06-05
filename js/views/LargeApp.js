AppsMall.Views.LargeApp = Backbone.View.extend({
    tagName: 'div',

    render: function(){
        this.collection.each(function(person) {
                        // Change here for Person Reference from App Views namespace
            var personView = new App.Views.Person({ model: person });
            this.$el.append(personView.render().el);
        }, this);

        return this;
    }
});