/*global Javelin:true */

/*
    TODO - take into account go hierarchy
*/

'use strict';

Javelin.Engine = function(environment, config) {
    //this should persist
    this.config = config;
    this.debug = false;
    this.environment = environment;
    this.environment.engine = this;

    //everything else can be reset
    this.reset();
};

Javelin.Engine.prototype.reset = function() {
    //general state
    this.running = false;
    this.updating = false;
    
    //game object
    this.gos = [];
    this.lastGoId = 0;
    this.newGos = [];
    this.gosToDelete = [];

    //timing
    this.stepId = 0;
    this.time = 0.0;
    this.prevTime = 0.0;
    this.deltaTime = 0.0;

    //scene
    this.sceneDefinition = {};
    this.plugins = [];
        
    //run any setup based on constructor config
    this.processConfig(this.config);
};

Javelin.Engine.prototype.processConfig = function(config) {
    //configure the loader
    if(config.loader) {
        this.loader = new Javelin.AssetLoader(config.loader.assetUrl || '');
    }

    //add plugins
    var plugins = config.plugins || [];
    for (var i in plugins) {
        this.addPlugin(plugins[i]);
    }
    
    //configure the plugins
    var opts = config.options || {};
    for (var j in opts) {
        this.getPlugin(j).$unserialize(opts[j]);
    }
};

/* Managing Game Objects */
Javelin.Engine.prototype.addGameObject = function(go) {
    if (-1 === go.id) {
        //register for engine
        go.id = ++this.lastGoId;
        go.engine = this;
        go.active = true;
        
        //TODO: check for whether or not we're updating
        this.gos.push(go);
        
        //notify plugins
        this.pluginsCreateGameObject(go);
        
        //notify object: todo: do this before or after notifying plugins?
        var cbs = go.getCallbacks('create') || [];
        for (var j = 0; j < cbs.length; j++) {
            cbs[j]();
        }
        
        return go;
    }
    
    return false;
};

Javelin.Engine.prototype.removeGameObject = function(go) {
    if (-1 !== go.id) {
        //notify object
        var cbs = go.getCallbacks('destroy');
        for (var j = 0; j < cbs.length; j++) {
            cbs[j]();
        }

        //notify plugins
        this.pluginsDestroyGameObject(go);
        
        //clean up self
        go.id = -1;
        go.active = false;
        go.engine = null;

        var index = this.gos.indexOf(go);
        this.gos.splice(index, 1);
        
        return go;
    }
};

Javelin.Engine.prototype.getGameObjectById = function(id) {
    return this.gos[this.goIdMap[id]] || false;
};

Javelin.Engine.prototype.instantiate = function(def) {
    var go = new Javelin.GameObject();

    go.name = def.name || "Anonymous";

    if (def.components) {
        for (var key in def.components) {
            var c = go.addComponent(Javelin.getComponentHandler(key));
            c.$unserialize(def.components[key]);
        }
    }
    
    if (def.children) {
        for (var i in def.children) {
            var child = this.instantiate(def.children[i]);
            child.setParent(go);
        }
    }
    
    this.addGameObject(go);
    
    return go;
};

/* Game Loop & State */
Javelin.Engine.prototype.initialize = function() {
    Javelin.initialize();
};

Javelin.Engine.prototype.run = function() {
    this.running = true;
    this.environment.run();
};

Javelin.Engine.prototype.stop = function() {
    this.environment.stop();
    this.running = false;
};

Javelin.Engine.prototype.step = function() {
    this.updating = true;
    this.stepId++;
    this.prevStepTime = this.time;
    this.time = new Date().getTime();
    this.deltaTime = this.time - this.prevStepTime;
    
    this.updateGameObjects(this.deltaTime);

    //clean now, so plugins can update with proper go array
    this.cleanupStep();

    this.updatePlugins(this.deltaTime);
    this.updating = false;
        
};

Javelin.Engine.prototype.updateGameObjects = function(deltaTime) {
    var l = this.gos.length;
    for (var i = 0; i < l; i++) {
        //TODO: only process root level objects,
        //the callbacks can be retrieved recursively
        //for nested hierarchies, which will allow
        //for efficient caching
        if (this.gos[i].active) {
            var cbs = this.gos[i].getCallbacks('update', false);
            for (var j = 0; j < cbs.length; j++) {
                cbs[j](deltaTime);
            }
        }
    }
};

Javelin.Engine.prototype.updatePlugins = function(deltaTime) {
    var plugins = this.plugins;
    var l = plugins.length;
    for (var i = 0; i < l; i++) {
        if (plugins[i].$active) {
            plugins[i].$onStep(deltaTime);
        }
    }
};

Javelin.Engine.prototype.cleanupStep = function() {
    //TODO: commit go changes (creations/deletions)
};


Javelin.Engine.prototype.pluginsCreateGameObject = function(go) {
    for (var p in this.plugins) {
        this.plugins[p].$onGameObjectCreate(go);
    }
};

Javelin.Engine.prototype.pluginsDestroyGameObject = function(go) {
    for (var p in this.plugins) {
        this.plugins[p].$onGameObjectDestroy(go);
    }
};

/* Scene management */

Javelin.Engine.prototype.loadScene = function(definition, callback) {
    this.resetPlugins();
    this.reset();

    for (var name in definition.plugins) {
        this.getPlugin(name).$unserialize(definition.plugins[name]);
    }

    for (var i = 0; i < definition.objects.length; i++) {
        this.instantiate(definition.objects[i]);
    }

    callback();
};

/* Asset management */

Javelin.Engine.prototype.loadAsset = function(path) {
    return this.loader.loadAsset(path);
};

Javelin.Engine.prototype.loadAssets = function(array) {
    var assets = [];
    
    for (var i in array) {
        assets.push(this.loader.loadAsset(array[i]));
    }
    
    return assets;
};

/* Plugin Management */
Javelin.Engine.prototype.addPlugin = function(handler) {
    if (this.plugins[handler.alias]) {
        return;
    }
    
    var plugin = new Javelin.EnginePlugin();
    plugin.$alias = handler.alias;
    plugin.$defaults = handler.defaults || {};
    plugin.$engine = this;
    
    //TODO: validate plugin requirements
    
    handler(plugin, handler.$defaults);
    plugin.$active = true;
    this.plugins.push(plugin);
};

Javelin.Engine.prototype.removePlugin = function(name) {
    var p = this.getPlugin(name);
    if(p) {
        var index = this.plugins.indexOf(p);
        this.plugins.splice(index, 1);
    }
};

Javelin.Engine.prototype.resetPlugins = function() {
    for (var i in this.plugins) {
        this.plugins[i].$reset();
    }
};

Javelin.Engine.prototype.getPlugin = function(name) {
    for (var i = 0; i < this.plugins.length; i++) {
        if (name === this.plugins[i].$alias) {
            return this.plugins[i];
        }
    }
    
    return false;
};
