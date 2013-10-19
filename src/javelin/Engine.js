Javelin.Engine = function(registry, environment, config) {
    //this should persist
    this.registry = registry;
    this.environment = environment;
    this.loader = environment.getLoader();
    this.config = config;
    this.debug = config.debug || false;
    this.targetFps = config.stepsPerSecond || 1000/30;
    this.dispatcher = new Javelin.Dispatcher();
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

Javelin.Engine.prototype.instantiate = function(prefab) {
    return this.instantiateEntity(this.registry.getPrefab(prefab));
};

Javelin.Engine.prototype.instantiateEntity = function(def, isNestedCall) {
    var ent;
    
    //instantiate game object
    if (def.fromPrefab) {
        //it's not really nested, but we say it is to avoid this call
        //adding dupliate copies of the object
        ent = this.instantiateEntity(this.registry.getPrefab(def.fromPrefab), true);
    } else {
        ent = new Javelin.Entity();
        ent.layer = def.layer || 'default';
        ent.name = def.name || 'Anonymous';
        ent.tags = def.tags || [];
    }

    if (ent.id === -1) {
        ent.setId(++this.lastGoId);
    }
    
    //add required components w/ values
    if (def.components) {
        for (var key in def.components) {
            var c = this.addComponentToEntity(ent, key);
            c.$unserialize(def.components[key]);
        }
    }
    
    //instantiate children
    if (def.children) {
        var l = def.children.length;
        for (var i = 0; i < l; i++) {
            ent.addChild(this.instantiateEntity(def.children[i], true));
        }
    }
    
    if (!isNestedCall) {
        this.__addGameObject(ent);
    }
    
    return ent;
};

Javelin.Engine.prototype.addComponentToEntity = function(ent, name) {
    if (ent.hasComponent(name)) {
        return ent.get(name);
    }
        
    //add any required components first
    var def = this.registry.getComponent(name);
    var reqs = def.computedRequirements;
    var l = reqs.length;

    for (var i = 0; i < l; i++) {
        this.addComponentToEntity(ent, reqs[i]);
    }
    
    var handler = Javelin.getComponentHandler(name);
    if (!handler) {
        throw new Error("Unknown component [" + name + "] requested");
    }

    var comp = new Javelin.Component(handler.name, go);
    comp.$id = go.id;

    handler(go, comp);

    go.setComponent(name, comp);
    
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

Javelin.Engine.prototype.stop = function(callback) {
    this.environment.stop(callback);
    this.running = false;
};

Javelin.Engine.prototype.step = function() {
    this.updating = true;
    this.stepId++;
    this.prevStepTime = this.time;
    this.time = new Date().getTime();
    this.deltaTime = (this.time - this.prevStepTime) * 0.001;
    
    //some plugins process before GO udpates
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
        if (this.plugins[i].$enabled) {
            if (Javelin.Engine.PRE_UPDATE === which) {
                this.plugins[i].$onPreUpdate(deltaTime);
            }
            
            if (Javelin.Engine.POST_UPDATE === which) {
                this.plugins[i].$onPostUpdate(deltaTime);
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
    //don't load a scene if it's still running - shutdown first
    if (this.running) {
        var engine = this;
        this.stop(function() {
            engine.unloadScene();
            engine.loadScene(name, callback);
        });
        
        return;
    }
    
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
    } else {
        this.run();
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
Javelin.Engine.prototype.loadPlugin = function(name, config) {
    if (this.plugins[name]) {
        return;
    }
    
    var def = this.registry.getPlugin(name);
    if (!def) {
        throw new Error("An unknown plugin [" + name + "] was requested.");
    }
    
    if (Javelin.isEmpty(config)) {
        if (this.config && this.config.plugins && this.config.plugins[name]) {
            config = this.config.plugins[name];
        } else {
            config = def.defaults || {};
        }
    }
    
    var plugin = new Javelin.Plugin(name, this);
    
    def.handler.call(plugin, config);
    this.plugins[plugin.$name] = plugin;
    plugin.$onLoad();
};

Javelin.Engine.prototype.unloadPlugin = function(name) {
    var p = this.getPlugin(name);
    if(p) {
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
