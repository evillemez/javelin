"use strict";

Javelin.EnginePlugin = function() {
    this.$alias = '';
    this.$defaults = {};
    this.$config = {};
    this.$requirements = [];
    this.$active = false;
    this.$engine = {};
};

Javelin.EnginePlugin.prototype.$reset = function() {
    // body...
};

/* GameObject Lifecycle */
Javelin.EnginePlugin.prototype.$onStep = function(deltaTime) {
    // body...
};

Javelin.EnginePlugin.prototype.$onGameObjectDestroy = function(go) {
    // body...
};

Javelin.EnginePlugin.prototype.$onGameObjectCreate = function(go) {
    // body...
};

/* data import/export for scene configuration */

Javelin.EnginePlugin.prototype.$serialize = function() {
    return this.$config;
};

Javelin.EnginePlugin.prototype.$unserialize = function(data) {
    this.$config = data;
    this.$reset();
};
