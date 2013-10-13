Fixtures.Plugin = function(config) {
    this.config = config;
    this.preUpdates = 0;
    this.postUpdates = 0;
    this.gosAdded = 0;
    this.gosDestroyed = 0;
    this.entitiesAdded = 0;
    this.entitiesDestroyed = 0;
    this.flushes = 0;

    this.$onStep = function(deltaTime) {

    };
};
