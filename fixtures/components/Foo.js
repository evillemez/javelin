Fixtures.FooComponent = function(entity, game) {
    var self = this;
    this.foo = 'foo';
    this.created = false;
    this.destroyed = false;
    this.updated = false;

    this.$on('engine.create', function() {
        self.created = true;
    });

    this.$on('engine.destroy', function() {
        self.destroyed = true;
    });

    this.$on('engine.update', function() {
        self.updated = true;
    });
};
