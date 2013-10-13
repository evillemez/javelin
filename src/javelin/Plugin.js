Javelin.Plugin = function(name, engine) {
    this.$name = name;
    this.$engine = engine;
    this.$active = false;
};

Javelin.Plugin.prototype.$onLoad = function() {};

Javelin.Plugin.prototype.$onUnload = function() {};

//TODO: implement & test this
Javelin.Plugin.prototype.$onSceneLoaded = function() {};

Javelin.Plugin.prototype.$onRun = function() {};

Javelin.Plugin.prototype.$onStop = function() {};

Javelin.Plugin.prototype.$onFlush = function() {};

/* GameObject Lifecycle */
Javelin.Plugin.prototype.$onPreUpdateStep = function(deltaTime) {};

Javelin.Plugin.prototype.$onPostUpdateStep = function(deltaTime) {};

Javelin.Plugin.prototype.$onEntityDestroy = function(entity) {};

Javelin.Plugin.prototype.$onEntityCreate = function(entity) {};

Javelin.Plugin.prototype.$onPrefabCreate = function(entity) {};

Javelin.Plugin.prototype.$onPrefabDestroy = function(entity) {};
