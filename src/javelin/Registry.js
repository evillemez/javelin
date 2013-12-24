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

    obj.prefab = name;
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

Javelin.Registry.prototype.environment = function(name, handler, defaults) {
    if (!Javelin.isString(name)) {
        throw new Error("Environments must specify a string name.");
    }

    if (!Javelin.isFunction(handler)) {
        throw new Error("Environments must specify a function handler.");
    }

    if (defaults && !Javelin.isObject(defaults)) {
        throw new Error("Default environment configuration must be an object literal.");
    }

    var def = {
        name: name,
        handler: handler,
        defaults: defaults || {}
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
            this.loaders[e] = {};
        }

        for (var i in formats) {
            this.loaders[e][formats[i]] = handler;
        }
    }
};

Javelin.Registry.prototype.getPrefab = function(name) {
    if (!this.prefabs[name]) {
        throw new Error("Unknown prefab ["+name+"] requested.");
    }

    return this.prefabs[name];
};


Javelin.Registry.prototype.getScene = function(name) {
    if (!this.scenes[name]) {
        throw new Error("Unkown scene ["+name+"] requested.");
    }

    return this.scenes[name];
};

Javelin.Registry.prototype.getComponent = function(name) {
    if (!this.components[name]) {
        throw new Error("Unknown component ["+name+"] requested.");
    }

    return this.components[name];
};

Javelin.Registry.prototype.getPlugin = function(name) {
    if (!this.plugins[name]) {
        throw new Error("Unknown plugin ["+name+"] requested.");
    }

    return this.plugins[name];
};

Javelin.Registry.prototype.getEnvironment = function(name) {
    if (!this.environments[name]) {
        throw new Error("Unknown environment ["+name+"] requested.");
    }

    return this.environments[name];
};

Javelin.Registry.prototype.getLoader = function(format, environment) {
    if (!this.loaders[environment][format]) {
        throw new Error("Unknown asset loader ["+format+"] requested for environment ["+environment+"].");
    }

    return this.loaders[environment][format];
};

Javelin.Registry.prototype.getLoaders = function(environment) {
    if (environment) {
        if (!this.environments[environment] && !this.loaders[environment]) {
            throw new Error("Asset loaders requested for unknown environment ["+environment+"].");
        }
        
        return this.loaders[environment] || {};
    }

    return this.loaders;
};

Javelin.Registry.prototype.createLoader = function(environment) {
    return new Javelin.AssetLoader(environment, this.getLoaders(environment));
};

Javelin.Registry.prototype.createEnvironment = function(environment, configuration) {
    var def = this.getEnvironment(environment);
    var env = new Javelin.Environment(environment, this.createLoader(environment));
    var config = configuration || def.defaults;

    def.handler.call(env, config);

    return env;
};

Javelin.Registry.prototype.createGame = function(environment, config) {
    config = config || {};
    var envConfig = (config.environments && config.environments[environment]) ? config.environments[environment] : null;

    return new Javelin.Engine(this, this.createEnvironment(environment, envConfig), config);
};

Javelin.Registry.prototype.computeComponentRequirements = function() {
    var self = this;

    //internal function recursively computes requirements
    var computeRequirements = function(name, requirements) {
        var reqs = requirements || [];

        var def = self.getComponent(name);

        if (def.requirements.length) {
            for (var i = 0; i < def.requirements.length; i++) {
                if (-1 === reqs.indexOf(def.requirements[i])) {
                    computeRequirements(def.requirements[i], reqs);
                    reqs.push(def.requirements[i]);
                }
            }
        }

        return reqs;
    };
    
    //assign computed requirements for every registered component
    for (var name in this.components) {
        var def = this.components[name];
        def.computedRequirements = computeRequirements(name);
    }

};

//converts string references inside prefab definitions to
//in-memory objects, so no extra logic is required during
//actual instantiation
//TODO: consider unpacking into a separate object
Javelin.Registry.prototype.unpackPrefabs = function() {
    var self = this;

    var unpackPrefab = function(prefab) {
        if (prefab.children) {
            var unpackedChildren = [];
            for (var i in prefab.children) {
                var child = prefab.children[i];

                if (Javelin.isString(child)) {
                    unpackPrefab(self.getPrefab(child));
                    unpackedChildren.push(self.getPrefab(child));
                } else {
                    unpackPrefab(child);
                    unpackedChildren.push(child);
                }
            }

            prefab.children = unpackedChildren;
        }
    };
    
    for (var name in this.prefabs) {
        unpackPrefab(this.getPrefab(name));
    }
};

//unpacks prefabs, and resolves component requirements
Javelin.Registry.prototype.optimize = function() {
    this.computeComponentRequirements();
    this.unpackPrefabs();

    //TODO: consider unpacking scenes entities the same way as unpacking prefabs
};
