"use strict";

Javelin.EnginePlugin = function() {
    
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
    // body...
};

Javelin.EnginePlugin.prototype.$unserialize = function(data) {
    // body...
};
