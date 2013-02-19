'use strict';

var Javelin = Javelin || {};

//setup sub namespaces
Javelin.Plugin = {};
Javelin.Component = {};
Javelin.Environment = {};
Javelin.Asset = {};
Javelin.Editor = {};

//component registry
Javelin.__componentHandlers = {};
Javelin.__componentChain = {};
Javelin.__componentRequirements = {};
Javelin.__pluginHandlers = {};

Javelin.register = function(handler) {
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

Javelin.registerPlugin = function(handler) {
    this.__pluginHandlers[handler.alias] = handler;
};

Javelin.reset = function() {
    Javelin.__componentHandlers = {};
    Javelin.__componentChain = {};
    Javelin.__componentRequirements = {};
    Javelin.__pluginHandlers = {};
};


Javelin.getComponentHandler = function(alias) {
    return Javelin.__componentHandlers[alias] || false;
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

//figure out all component inheritence and requirements
Javelin.initialize = function() {    
    for (var alias in Javelin.__componentHandlers) {

        //build inheritance chain
        Javelin.buildComponentChain(Javelin.__componentHandlers[alias]);
        
        //build requirements
        Javelin.buildComponentRequirements(Javelin.__componentHandlers[alias]);
    }
};
