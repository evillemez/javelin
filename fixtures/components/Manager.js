Fixtures.ManagerComponent = function(entity, game) {
    var self = this;
    var max = 4;
    var ents = [];
    var mode = 'create';

    this.$on('engine.update', function(deltaTime) {
        if (ents.length < max && 'create' === mode) {
            ents.push(game.instantiate('foo'));
        }

        if (ents.length > 0 && 'destroy' === mode) {
            ents.pop().destroy();
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

    this.setMode = function(newMode) {
        mode = newMode;
    };
};
