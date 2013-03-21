"use strict";

Javelin.EnginePlugin = function() {
    this.$alias = '';
    this.$active = false;
    this.$engine = null;
    this.$when = Javelin.EnginePlugin.AFTER;
};

//constants, denote whether a given plugin should execute
//pre or post update
Javelin.EnginePlugin.BEFORE = 0;
Javelin.EnginePlugin.AFTER = 1;

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
