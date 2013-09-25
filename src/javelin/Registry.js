'use strict';

Javelin.Registry = function() {
    this.components = {};
    this.environments = {};
    this.plugins = {};
    this.scenes = {};
    this.prefabs = {};
    this.loaders = {};
};

//register an entity component
Javelin.Registry.prototype.component = function(name, handler, requirements) {
    if (!Javelin.isString(name)) {
        throw new Error("Components must specify a string name.");
    }

    if (!Javelin.isFunction(handler)) {
        throw new Error("Components must be functions.");
    }
    
    if (requirements && !Javelin.isArray(requirements)) {
        throw new Error("Component requirements must be an array in " + name + ".");
    }
    
    var definition = {
        name: name,
        handler: handler,
        requirements: requirements || [],
        computedRequirements: []
    };

    this.components[name] = definition;
};

Javelin.Registry.prototype.prefab = function(name, obj) {
    if (!name || !Javelin.isString(name)) {
        throw new Error("Prefabs must specify a string name property!");
    }

    if (!Javelin.isObject(obj)) {
        throw new Error("Prefabs must be object literals.");
    }

    this.prefabs[name] = obj;
};

Javelin.Registry.prototype.scene = function(name, obj) {
    if (!name || !Javelin.isString(name)) {
        throw new Error("Scenes must specify a string name.");
    }

    if (!Javelin.isObject(obj)) {
        throw new Error("Scenes must be object literals.");
    }

    this.scenes[name] = obj;
};

Javelin.Registry.prototype.plugin = function(name, handler, defaults) {
    
    if (!name || !Javelin.isString(name)) {
        throw new Error("Engine plugins must specify a string name.");
    }

    if (!Javelin.isFunction(handler)) {
        throw new Error("Engine plugins must be a function.");
    }
    
    var definition = {
        name: name,
        handler: handler,
        defaults: defaults || {}
    };

    this.plugins[name] = definition;
};

Javelin.Registry.prototype.environment = function(name, handler, config) {
    if (!Javelin.isString(name)) {
        throw new Error("Environments must specify a string name.");
    }

    if (!Javelin.isFunction(handler)) {
        throw new Error("Environments must specify a function handler.");
    }

    if (config && !Javelin.isObject(config)) {
        throw new Error("Default environment configuration must be an object.");
    }

    var def = {
        name: name,
        handler: handler,
        defaults: config || {}
    };

    this.environments[name] = def;
};

Javelin.Registry.prototype.loader = function(formats, environments, handler) {
    if (!Javelin.isArray(formats)) {
        throw new Error("Loaders must specify an array of file formats.");
    }

    if (!Javelin.isArray(environments)) {
        throw new Error("Loaders must specify an array of applicable environments.");
    }

    if (!Javelin.isFunction(handler)) {
        throw new Error("Loaders must specify a function handler.");
    }

    for (var env in environments) {
        var e = environments[env];
        if (!Javelin.isObject(this.loaders[e])) {
            //this.loaders[e] = {};
        }

        for (var i in formats) {
            this.loaders[e][formats[i]] = handler;
        }
    }
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

Javelin.Registry.prototype.getEnvironment = function(name) {
    return this.environments[name] || false;
};

Javelin.Registry.prototype.getLoader = function(environment, format) {
    return this.loaders[environment][format] || false;
};

Javelin.Registry.prototype.getLoaders = function(environment) {
    if (environment) {
        return this.loaders[environment] || {};
    }

    return this.loaders;
};

Javelin.Registry.prototype.instantiateLoader = function(environment) {
    // body...
};

Javelin.Registry.prototype.instantiateEnvironment = function(environment) {
    // body...
};

Javelin.Registry.prototype.game = function(environment, config) {
    //TODO: return engine instance for environment
};

//TODO: refactor
Javelin.Registry.prototype.computeComponentRequirements = function(handler) {
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
Javelin.Registry.prototype.unpackPrefabDefinitions = function() {
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

//unpacks prefabs, and resolves component requirements
Javelin.Registry.prototype.optimize = function() {
    
    //resolve component hierarchies/dependencies
    for (var alias in this.components) {
                
        //build requirements
        Javelin.buildComponentRequirements(Javelin.__componentHandlers[alias]);
    }
    
    //expand all prefab definitions for quick instantiation
    Javelin.unpackPrefabDefinitions();
};
