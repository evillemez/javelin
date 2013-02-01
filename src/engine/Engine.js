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

    //timing
    this.step = 0;
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
    var plugins = config.plugins || [];
    for (var i in plugins) {
        this.addPlugin(plugins[i]);
    }
    
    var opts = config.options || {};
    for (var j in opts) {
        this.getPlugin(j).$unserialize(opts[j]);
    }
};


/* Managing Game Objects */
Javelin.Engine.prototype.addGameObject = function(go) {
    if (!go.id) {
        //register for engine
        go.id = ++this.lastGoId;
        go.engine = this;
        go.active = true;
        this.gos.push(go);
        
        //notify plugins
        this.pluginsAddGameObject(go);
        
        //notify object
        var cbs = go.getCallbacks('create');
        for (var j = 0; j < cbs.length; j++) {
            cbs[j]();
        }
    }
};

Javelin.Engine.prototype.removeGameObject = function(go) {
    if (go.id) {
        //notify object
        var cbs = go.getCallbacks('destroy');
        for (var j = 0; j < cbs.length; j++) {
            cbs[j]();
        }

        //notify plugins
        this.pluginsDestroyGameObject(go);
        
        //clean up self
        go.id = 0;
        var index = this.gos.indexOf(go);
        this.gos.splice(index, 1);
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
            this.instantiate(def.children[i]);
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
    if (this.running) {
        this.updating = true;
        this.step++;
        this.prevStepTime = this.time;
        this.time = new Date().getTime();
        this.deltaTime = this.time - this.prevStepTime;
    
        this.updateGameObjects(this.deltaTime);
        this.updatePlugins(this.deltaTime);
        this.updating = false;
        
        //TODO: commit go changes (creations/deletions)
    }
};

Javelin.Engine.prototype.updateGameObjects = function(deltaTime) {
    for (var i = 0; i < this.gos.length; i++) {
        //TODO: only process root level objects,
        //the callbacks can be retrieved recursively
        //for nested hierarchies, which will allow
        //for efficient caching
        var cbs = this.gos[i].getCallbacks('update');
        for (var j = 0; j < cbs.length; j++) {
            cbs[j](deltaTime);
        }
    }
};

Javelin.Engine.prototype.updatePlugins = function(deltaTime) {
    for (var plugin in this.plugins) {
        if (plugin.$active) {
            plugin.$step(deltaTime);
        }
    }
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

/* Plugin Management */
Javelin.Engine.prototype.addPlugin = function(pluginBuilder) {
    var plugin = new Javelin.EnginePlugin();
    plugin.$alias = pluginBuilder.alias;
    plugin.$defaults = pluginBuilder.defaults || {};
    
    //TODO: validate plugin requirements
    
    pluginBuilder(this, plugin, pluginBuilder.$defaults);
    this.plugins.push(plugin);
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
