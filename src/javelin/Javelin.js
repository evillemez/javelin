'use strict';

var Javelin = Javelin || {};

//setup sub namespaces for categories of objects
//included with Javelin
Javelin.Plugin = {};
Javelin.Component = {};
Javelin.Prefab = {};
Javelin.Scene = {};
Javelin.Env = {};
Javelin.Asset = {};

//during initialize, whether to automatically register all objects included
//with this build of Javelin (probably should leave as true unless you really
//have a good reason not to)
Javelin.AUTO_REGISTER_SELF = true;

//registry for stuff used in the engine, don't manipulate these
Javelin.__componentHandlers = {};
Javelin.__componentChain = {};
Javelin.__componentRequirements = {};
Javelin.__pluginHandlers = {};
Javelin.__prefabs = {};
Javelin.__scenes = {};

//mostly for testing and internal use; generally, don't call this from your own code
Javelin.reset = function() {
    Javelin.__componentHandlers = {};
    Javelin.__componentChain = {};
    Javelin.__componentRequirements = {};
    Javelin.__pluginHandlers = {};
    Javelin.__prefabs = {};
    Javelin.__scenes = {};
};

/* utility methods */

Javelin.isString = function(value) {
    return typeof value === 'string';
};

Javelin.isEmpty = function(item) {
    for (var key in item) {
        return false;
    }
    
    return true;
};

//register a GameObject Component handler function
Javelin.registerComponent = function(handler) {
    if (!handler.alias) {
        throw new Error("Components must specify their alias.");
    }
    
    if (handler.requires && !handler.requires instanceof Array) {
        throw new Error("Component.requires must be an array in " + handler.alias + ".");
    }
    
    if (handler.inherits && typeof handler.inherits !== 'string') {
        throw new Error("Component.inherits should be a reference to another component alias string in (" + handler.alias + ").");
    }
    
    Javelin.__componentHandlers[handler.alias] = handler;
};

Javelin.registerPrefab = function(obj) {
    if (!obj.name) {
        throw new Error("Prefabs must have a name!");
    }

    //TODO: serious validation
    
    Javelin.__prefabs[obj.name] = obj;
};

Javelin.getPrefab = function(name) {
    return Javelin.__prefabs[name] || false;
};

Javelin.registerScene = function(obj) {
    if (!obj.name) {
        throw new Error("Scenes must have a name!");
    }
    
    //TODO: serious validation
    
    Javelin.__scenes[obj.name] = obj;
};

Javelin.getScene = function(name) {
    return Javelin.__scenes[name] || false;
};

Javelin.registerPlugin = function(handler) {
    //TODO: validation
    this.__pluginHandlers[handler.alias] = handler;
};

Javelin.getComponentHandler = function(alias) {
    return Javelin.__componentHandlers[alias] || false;
};

Javelin.getPluginHandler = function(alias) {
    return Javelin.__pluginHandlers[alias] || false;
};

Javelin.getComponentChain = function(alias) {
    return Javelin.__componentChain[alias] || [];
};

Javelin.getComponentRequirements = function(alias) {
    return Javelin.__componentRequirements[alias] || [];
};

Javelin.buildComponentChain = function(handler) {
    var chain = [];

    var getParent = function(alias) {
        var func = Javelin.getComponentHandler(alias);
        if (!func) {
            throw new Error("Missing component for requirement ["+alias+"]!");
        }

        if (func.inherits) {
            getParent(func.inherits);
        }

        chain.push(func);
    };
    
    getParent(handler.alias);
    
    this.__componentChain[handler.alias] = chain;
};

Javelin.buildComponentRequirements = function(handler) {
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
Javelin.initialize = function() {
    if (Javelin.AUTO_REGISTER_SELF) {
        var key;
        for (key in Javelin.Component) {
            Javelin.registerComponent(Javelin.Component[key]);
        }
        for (key in Javelin.Plugin) {
            Javelin.registerPlugin(Javelin.Plugin[key]);
        }
        for (key in Javelin.Prefab) {
            Javelin.registerPrefab(Javelin.Prefab[key]);
        }
        for (key in Javelin.Scene) {
            Javelin.registerScene(Javelin.Scene[key]);
        }
    }
    
    //resolve component hierarchies/dependencies
    for (var alias in Javelin.__componentHandlers) {
        
        //build inheritance chain
        Javelin.buildComponentChain(Javelin.__componentHandlers[alias]);
        
        //build requirements
        Javelin.buildComponentRequirements(Javelin.__componentHandlers[alias]);
    }
    
    //expand all prefab definitions for quick instantiation
    Javelin.unpackPrefabDefinitions();
};
