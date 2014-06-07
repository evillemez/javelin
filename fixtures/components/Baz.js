Fixtures.BazComponent = function(entity, game) {
    var self = this;
    this.baz = 'baz';
    this.created = false;
    this.destroyed = false;
    this.updated = false;

    entity.on('entity.create', function() {
        self.created = true;
    });

    entity.on('entity.destroy', function() {
        self.destroyed = true;
    });

    entity.on('engine.update', function() {
        self.updated = true;
    });
};
