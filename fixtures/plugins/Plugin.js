Fixtures.DefaultPluginConfig = {foo: 'foo', bar: 'bar'};

Fixtures.Plugin = function(config) {
    var self = this;

    this.config = config;
    this.preUpdates = 0;
    this.postUpdates = 0;
    this.prefabsCreated = 0;
    this.prefabsDestroyed = 0;
    this.entitiesCreated = 0;
    this.entitiesDestroyed = 0;
    this.runs = 0;
    this.stops = 0;
    this.flushes = 0;
    this.loaded = false;
    this.unloaded = false;
    this.sceneLoaded = false;

    this.$onLoad = function() { self.loaded = true; };
    this.$onUnload = function() { self.unloaded = true; };
    this.$onSceneLoaded = function() { self.sceneLoaded = true; };

    this.$onRun = function() { self.runs++; };
    this.$onStop = function() { self.stops++; };
    this.$onFlush = function() { self.flushes++; };

    this.$onPreUpdate = function(deltaTime) { self.preUpdates++; };
    this.$onPostUpdate = function(deltaTime) { self.postUpdates++; };

    this.$onPrefabCreate = function() { self.prefabsCreated++; };
    this.$onPrefabDestroy = function() { self.prefabsDestroyed++; };

    this.$onEntityCreate = function() { self.entitiesCreated++; };
    this.$onEntityDestroy = function() { self.entitiesDestroyed++; };

};
