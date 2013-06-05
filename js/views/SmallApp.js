AppsMall.Views.SmallApp = Backbone.View.extend({
    tagName: 'ul',

    render: function(){
        this.collection.each(function(person){
                        // Change here for Person Reference from App Views namespace
            var personView = new App.Views.Person({ model: person });
            this.$el.append(personView.render().el);
        }, this);

        return this;
    }
});