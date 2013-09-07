'use strict';

//setup main namespace
var Javelin = Javelin || {};

//used a lot for converting degrees to radians
Javelin.PI_OVER_180 = Math.PI / 180;
Javelin._180_OVER_PI = 180 / Math.PI;

Javelin.Registry = function() {
    this.components = {};
    this.environments = {};
    this.plugins = {};
    this.scenes = {};
    this.prefabs = {};
    this.loaders = {};
};


/* utility methods: note that these are for checking LITERALS only, as they are used internally
quite a bit, and have an expected format, there may be edge cases where these don't give the
expected result */

Javelin.Registry.prototype.isString = function(value) {
    return typeof value === 'string';
};

Javelin.Registry.prototype.isEmpty = function(item) {
    for (var key in item) {
        return false;
    }
    
    return true;
};

Javelin.Registry.prototype.isFunction = function(value) {
    return typeof value === 'function';
};

Javelin.Registry.prototype.isObject = function(value) {
    return value !== null && !Javelin.isArray(value) && typeof value === 'object';
};

Javelin.Registry.prototype.isArray = function(value) {
    return Object.prototype.toString.apply(value) === '[object Array]';
};

/* Registry methods */

//register an entity component
Javelin.Registry.prototype.component = function(name, handler, requirements) {
    if (!this.isString(name)) {
        throw new Error("Components must specify a string name.");
    }

    if (!this.isFunction(handler)) {
        throw new Error("Components must be functions.");
    }
    
    if (requirements && !this.isArray(requirements)) {
        throw new Error("Component requirements must be an array in " + name + ".");
    }
    
    var definition = {
        name: name,
        handler: handler,
        requirements: requirements,
        computedRequirements: []
    };

    this.components[name] = definition;
};

Javelin.Registry.prototype.prefab = function(name, obj) {
    if (!name || !this.isString(name)) {
        throw new Error("Prefabs must specify a string name property!");
    }

    if (!this.isObject(obj)) {
        throw new Error("Prefabs must be object literals.");
    }

    this.prefabs[name] = obj;
};

Javelin.Registry.prototype.scene = function(name, obj) {
    if (!name || !this.isString(name)) {
        throw new Error("Scenes must specify a string name.");
    }

    if (!this.isObject(obj)) {
        throw new Error("Scenes must be object literals.");
    }

    this.scenes[name] = obj;
};

Javelin.Registry.prototype.plugin = function(name, handler, defaults) {
    
    if (!name || !this.isString(name)) {
        throw new Error("Engine plugins must specify a string name.");
    }

    if (!this.isFunction(handler)) {
        throw new Error("Engine plugins must be functions.");
    }
    
    var definition = {
        name: name,
        handler: handler,
        defaults: defaults
    };

    this.plugins[name] = definition;
};

Javelin.Registry.prototype.getPrefab = function(name) {
    return this.prefabs[name] || false;
};


Javelin.Registry.prototype.getScene = function(name) {
    return this.scenes[name] || false;
};

Javelin.Registry.prototype.getComponent = function(name) {
    return this.components[name] || false;
};

Javelin.Registry.prototype.getPlugin = function(name) {
    return this.plugins[name] || false;
};

Javelin.Registry.prototype.game = function(environemtn, config) {
    //TODO: return engine instance for environment
};

//TODO: refactor
Javelin.computeComponentRequirements = function(handler) {
    var reqs = [];
    
    var getRequirements = function(alias) {
        var handler = Javelin.getComponentHandler(alias);
        if (!handler) {
            throw new Error("Missing component for requirement ["+alias+"]!");
        }
        if (handler.requires) {
            for (var i = 0; i < handler.requires.length; i++) {
                var exists = false;
                for (var j = 0; j < reqs.length; j++) {
                    if (reqs[j].alias === handler.requires[i]) {
                        exists = true;
                    }
                }

                if (!exists) {
                    getRequirements(handler.requires[i]);
                    reqs.push(Javelin.getComponentHandler(handler.requires[i]));
                }
            }
        }
    };
    
    getRequirements(handler.alias);
    
    this.__componentRequirements[handler.alias] = reqs;
};

//converts string references inside prefab definitions to
//in-memory objects, so no extra logic is required during
//actual instantiation
Javelin.unpackPrefabDefinitions = function() {
    var unpackPrefab = function(prefab) {
        if (prefab.children) {
            var unpackedChildren = [];
            for (var i in prefab.children) {
                var child = prefab.children[i];

                if (Javelin.isString(child)) {
                    unpackPrefab(Javelin.getPrefab(child));
                    unpackedChildren.push(Javelin.getPrefab(child));
                } else {
                    unpackPrefab(child);
                    unpackedChildren.push(child);
                }

            }

            prefab.children = unpackedChildren;
            Javelin.registerPrefab(prefab);
        }
    };
    
    for (var alias in Javelin.__prefabs) {
        unpackPrefab(Javelin.getPrefab(alias));
    }
};

//figure out all component inheritence and requirements
//TODO: refactor
Javelin.initialize = function() {
    
    //resolve component hierarchies/dependencies
    for (var alias in Javelin.__componentHandlers) {
                
        //build requirements
        Javelin.buildComponentRequirements(Javelin.__componentHandlers[alias]);
    }
    
    //expand all prefab definitions for quick instantiation
    Javelin.unpackPrefabDefinitions();
};
