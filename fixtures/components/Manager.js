Fixtures.ManagerComponent = function(entity, game) {
    var self = this;
    var max = 4;
    var ents = [];

    this.$on('engine.update', function(deltaTime) {
        if (ents.length < max) {
            ents.push(game.instantiate('foo'));
        }
    });

    this.$on('engine.destroy', function() {
        for (var i in ents) {
            ents[i].destroy();
        }
    });

    this.getManagedEntities = function() {
        return ents;
    };
};