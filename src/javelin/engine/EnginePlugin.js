"use strict";

Javelin.EnginePlugin = function() {
    this.$alias = '';
    this.$active = false;
    this.$engine = null;
};

Javelin.EnginePlugin.prototype.$onLoad = function() {
    // body...
};

Javelin.EnginePlugin.prototype.$onUnload = function() {
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
