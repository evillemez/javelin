/*global Javelin:true */

'use strict';

Javelin.Engine = function(environment, config) {
    //this should persist
    this.config = config;
    this.debug = config.debug || false;
    this.targetFps = config.stepsPerSecond || 1000/30;
    this.environment = environment;
    this.environment.engine = this;
    this.initialized = false;
    
    //everything else can be reset
    this.reset();
};

//constant flags
Javelin.Engine.PRE_UPDATE = 0;
Javelin.Engine.POST_UPDATE = 1;

Javelin.Engine.prototype.reset = function() {
    //general state
    this.running = false;
    this.updating = false;
    this.isRunningSlowly = false;
    this.currentFps = 0.0;
    this.lastUpdateTimeTaken = 0.0;

    //game object
    this.gos = [];
    this.lastGoId = 0;
    this.createdGos = [];
    this.destroyedGos = [];

    //timing
    this.stepId = 0;
    this.time = new Date().getTime();
    this.prevTime = 0.0;
    this.deltaTime = 0.0;

    //scene
    this.sceneDefinition = {};
    this.plugins = {};
    this.currentScene = false;
    
    //other
    this.dispatcher = new Javelin.Dispatcher();
        
    //configure the loader
    //TODO: think of better way to do this, possibly require it
    //via the environment
    if (this.config.loader) {
        this.loader = new Javelin.AssetLoader(this.config.loader.assetUrl || '');
    }
};

/* Managing Game Objects */

Javelin.Engine.prototype.getGameObjectById = function(id) {
    var l = this.gos.length;
    for (var i = 0; i < l; i++) {
        if (this.gos[i].id === id) {
            return this.gos[i];
        }
    }

    return false;
};

Javelin.Engine.prototype.instantiate = function(mixed) {
    if (Javelin.isString(mixed)) {
        return this.instantiatePrefab(mixed);
    }
    
    return this.instantiateObject(mixed);
};

//takes a string
Javelin.Engine.prototype.instantiatePrefab = function(name) {
    if (!Javelin.__prefabs[name]) {
        throw new Error("Tried instantiating unknown prefab: " + name);
    }
    
    return this.instantiateObject(Javelin.__prefabs[name]);
};

Javelin.Engine.prototype.instantiateObject = function(def, isNestedCall) {
    var go;
    
    //instantiate game object
    if (def.fromPrefab) {
        //it's not really nested, but we say it is to avoid this call
        //adding dupliate copies of the object
        go = this.instantiateObject(Javelin.__prefabs[def.fromPrefab], true);
    } else {
        go = new Javelin.GameObject();
        go.layer = def.layer || 'default';
        go.name = def.name || 'Anonymous';
        go.tags = def.tags || [];
    }

    go.setId(++this.lastGoId);
    go.engine = this;
    
    //add required components w/ values
    if (def.components) {
        for (var key in def.components) {
            var c = this.addComponentToGameObject(go, key);
            c.$unserialize(def.components[key]);
        }
    }
    
    //instantiate children
    if (def.children) {
        for (var i in def.children) {
            go.addChild(this.instantiateObject(def.children[i], true));
        }
    }
    
    if (!isNestedCall) {
        this.__addGameObject(go);
    }
    
    return go;
};

Javelin.Engine.prototype.addComponentToGameObject = function(go, alias) {
    if (go.hasComponent(alias)) {
        return go.getComponent(alias);
    }
        
    //add any required components first
    var reqs = Javelin.getComponentRequirements(alias);
    var l = reqs.length;
    for (var i = 0; i < l; i++) {
        this.addComponentToGameObject(go, reqs[i].alias);
    }
    
    var handler = Javelin.getComponentHandler(alias);
    if (!handler) {
        throw new Error("Unknown component [" + alias + "] requested");
    }

    var comp = new Javelin.GameObjectComponent();
    comp.$id = go.id;
    comp.$go = go;
    comp.$alias = handler.alias;

    handler(go, comp);

    go.setComponent(alias, comp);
    
    return comp;
};

Javelin.Engine.prototype.__addGameObject = function(go) {
    if (this.updating && go.isRoot()) {
        this.createdGos.push(go);
    } else {
        this.gos.push(go);

        this.pluginsOnGameObjectCreate(go);
        
        if (go.children.length) {
            for (var i in go.children) {
                this.__addGameObject(go.children[i]);
            }
        }

        if (go.isRoot()) {
            go.enable();
            
            this.pluginsOnPrefabCreate(go);

            var cbs = go.getCallbacks('engine.create', true) || [];
            for (var j = 0; j < cbs.length; j++) {
                cbs[j]();
            }
        }
    }
};

//destroy an object (if the engine is updating, it will be destroyed after the update is done)
Javelin.Engine.prototype.destroy = function(go, destroyingNested) {
    if (this.updating) {
        this.destroyedGos.push(go);
    } else {
        var i;
        
        if (!destroyingNested) {
            //notify destroy callbacks
            var cbs = go.getCallbacks('engine.destroy', true);
            for (i = 0; i < cbs.length; i++) {
                cbs[i]();
            }
            
            this.pluginsOnPrefabDestroy(go);
        }
        
        //destroy children first
        if(go.children) {
            //copy into separate array so we can abandon now
            var children = [];
            for (i in go.children) {
                children.push(go.children[i]);
            }
            go.abandonChildren();

            //destroy children
            for (i in children) {
                this.destroy(children[i], true);
            }
        }

        //notify plugins
        this.pluginsOnGameObjectDestroy(go);
        
        //make sure this object is detached from any parents, 
        //because we abandoned and deleted children already,
        //this should only be the case if this go is a child of
        //another object that is NOT being deleted
        if (go.parent) {
            go.parent.removeChild(go);
        }

        //remove references
        go.setId(-1);
        go.engine = null;
        
        //remove from engine
        var index = this.gos.indexOf(go);
        this.gos.splice(index, 1);
    }
};

/* Game Loop & State */

//This must be called before loading and running scenes
Javelin.Engine.prototype.initialize = function() {
    var func;
    var obj;
    
    if (this.config.autoregisterPlugins) {
        for (func in this.config.autoregisterPlugins) {
            Javelin.registerPlugin(this.config.autoregisterPlugins[func]);
        }
    }
    
    if (this.config.autoregisterComponents) {
        for (func in this.config.autoregisterComponents) {
            Javelin.registerComponent(this.config.autoregisterComponents[func]);
        }
    }
    
    if (this.config.autoregisterPrefabs) {
        for (obj in this.config.autoregisterPrefabs) {
            Javelin.registerPrefab(this.config.autoregisterPrefabs[obj]);
        }
    }
    
    if (this.config.autoregisterScenes) {
        for (obj in this.config.autoregisterScenes) {
            Javelin.registerScene(this.config.autoregisterScenes[obj]);
        }
    }

    //build up maps of component dependencies and whatever else
    Javelin.initialize();
    
    //TODO: load required assets
    
    this.initialized = true;
};

Javelin.Engine.prototype.run = function() {
    this.running = true;
    this.environment.run(this.targetFps);
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
    this.deltaTime = (this.time - this.prevStepTime) * 0.001;
    
    //some plugins process in the beginning
    this.updatePlugins(Javelin.Engine.PRE_UPDATE, this.deltaTime);
    
    this.updateGameObjects(this.deltaTime);
    
    //some process after
    this.updatePlugins(Javelin.Engine.POST_UPDATE, this.deltaTime);
    this.updating = false;

    //clean now, so next step contains the modifications
    //from this step
    this.cleanupStep();

    this.lastUpdateTimeTaken = new Date().getTime() - this.time;
    
    if(this.lastUpdateTimeTaken > this.targetFps) {
        this.isRunningSlowly = true;
    } else {
        this.isRunningSlowly = false;
    }
    
};

Javelin.Engine.prototype.stats = function() {
    console.log("Updated  " + this.gos.length + ' gos in ' + this.lastUpdateTimeTaken + 'ms, targeting ' + Math.floor(this.targetFps) + ' fps; DT: ' + this.deltaTime + ' seconds.');
};

Javelin.Engine.prototype.updateGameObjects = function(deltaTime) {
    var l = this.gos.length;
    for (var i = 0; i < l; i++) {

        //TODO: only process root level objects,
        //the callbacks can be retrieved recursively
        //for nested hierarchies, which will allow
        //for efficient caching
        if (this.gos[i].enabled) {
            var cbs = this.gos[i].getCallbacks('engine.update', false);
            for (var j = 0; j < cbs.length; j++) {
                cbs[j](deltaTime);
            }
        }
    }
};

Javelin.Engine.prototype.updatePlugins = function(which, deltaTime) {
    for (var i in this.plugins) {
        if (this.plugins[i].$active) {
            if (Javelin.Engine.PRE_UPDATE === which) {
                this.plugins[i].$onPreUpdateStep(deltaTime);
            }
            
            if (Javelin.Engine.POST_UPDATE === which) {
                this.plugins[i].$onPostUpdateStep(deltaTime);
            }
        }
    }
};

Javelin.Engine.prototype.cleanupStep = function() {
    var lc = this.createdGos.length;
    var ld = this.destroyedGos.length;
    var i;
    if (lc) {
        for (i = 0; i < lc; i++) {
            this.__addGameObject(this.createdGos[i]);
        }
    }
    
    if (ld) {
        for (i = 0; i < ld; i++) {
            this.destroy(this.destroyedGos[i]);
        }
    }
    
    this.createdGos = [];
    this.destroyedGos = [];
};

Javelin.Engine.prototype.pluginsOnGameObjectCreate = function(go) {
    for (var i in this.plugins) {
        this.plugins[i].$onGameObjectCreate(go);
    }
};

Javelin.Engine.prototype.pluginsOnGameObjectDestroy = function(go) {
    for (var i in this.plugins) {
        this.plugins[i].$onGameObjectDestroy(go);
    }
};

Javelin.Engine.prototype.pluginsOnPrefabCreate = function(go) {
    for (var i in this.plugins) {
        this.plugins[i].$onPrefabCreate(go);
    }
};

Javelin.Engine.prototype.pluginsOnPrefabDestroy = function(go) {
    for (var i in this.plugins) {
        this.plugins[i].$onPrefabDestroy(go);
    }
};

/* Scene management */

Javelin.Engine.prototype.getCurrentScene = function() {
    return this.currentScene;
};

Javelin.Engine.prototype.loadScene = function(name, callback) {
    this.reset();
    
    if(!this.initialized) {
        this.initialize();
    }
    
    var scene = Javelin.getScene(name);
    
    if(!scene) {
        throw new Error("Tried loading unregistered scene: " + name);
    }

    this.sceneDefinition = scene;
    this.currentScene = name;
    
    //load plugins defined in scene - otherwise, check main config
    var alias;
    if (scene.plugins) {
        for (alias in scene.plugins) {
            var config = !Javelin.isEmpty(scene.plugins[alias]) ? scene.plugins[alias] : {};
            this.loadPlugin(alias, config);
        }
    } else {
        for (alias in this.config.plugins) {
            this.loadPlugin(alias, {});
        }
    }

    for (var i = 0; i < scene.objects.length; i++) {
        this.instantiate(scene.objects[i]);
    }
    
    if (callback) {
        callback();
    }
};

Javelin.Engine.prototype.unloadScene = function() {
    this.unloadPlugins();
    this.reset();
};

/* Asset management */

Javelin.Engine.prototype.loadAsset = function(path, callback) {
    return this.loader.loadAsset(path, callback);
};

Javelin.Engine.prototype.loadAssets = function(arr, callback) {
    return this.loader.loadAssets(arr, callback);
};

/* Plugin Management */
Javelin.Engine.prototype.loadPlugin = function(alias, config) {
    if (this.plugins[alias]) {
        return;
    }
    
    var handler = Javelin.getPluginHandler(alias);
    if (!handler) {
        throw new Error("Required plugin [" + alias + "] not registered.");
    }
    
    if (Javelin.isEmpty(config)) {
        if (this.config && this.config.plugins && this.config.plugins[alias]) {
            config = this.config.plugins[alias];
        } else {
            config = handler.defaults || {};
        }
    }
    
    var plugin = new Javelin.EnginePlugin();
    plugin.$alias = handler.alias;
    plugin.$engine = this;
    
    handler(plugin, config);
    plugin.$onLoad();
    plugin.$active = true;
    this.plugins[plugin.$alias] = plugin;
};

Javelin.Engine.prototype.unloadPlugin = function(name) {
    var p = this.getPlugin(name);
    if(p) {
        p.$active = false;
        p.$onUnload();
        this.plugins[name] = null;
    }
};

Javelin.Engine.prototype.unloadPlugins = function() {
    for (var alias in this.plugins) {
        this.unloadPlugin(alias);
    }
};

Javelin.Engine.prototype.getPlugin = function(alias) {
    return this.plugins[alias] || false;
};

Javelin.Engine.prototype.on = function(event, callback) {
    this.dispatcher.on(event, callback);
};

Javelin.Engine.prototype.emit = function(event, data) {
    //just dispatch own events
    return this.dispatcher.dispatch(event, data);
};

Javelin.Engine.prototype.broadcast = function(event, data) {
    //dispatch own events first
    if(!this.dispatcher.dispatch(event, data)) {
        return false;
    }

    //then broadcast to root game objects
    for (var i in this.gos) {
        if (this.gos[i].isRoot()) {
            if (!this.gos[i].broadcast(event, data)) {
                return false;
            }
        }
    }
    
    return true;
};
