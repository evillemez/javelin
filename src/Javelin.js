'use strict';

var Javelin = Javelin || {};

//setup sub namespaces
Javelin.Plugin = {};
Javelin.Component = {};
Javelin.Environment = {};
Javelin.Editor = {};

//component registry
Javelin.__componentHandlers = {};
Javelin.__componentChain = {};
Javelin.__componentRequirements = {};

Javelin.register = function(handler) {
    if (!handler.alias) {
        throw new Error("Components must specify their alias.");
    }
    
    if (handler.requires && !handler.requires instanceof Array) {
        throw new Error("Component.requires must be an array in " + handler.alias + ".");
    }
    
    if (handler.inherits && typeof handler.inherits !== 'function') {
        throw new Error("Component.inherits should be a reference to another component constructor in (" + handler.alias + ").");
    }
    
    Javelin.__componentHandlers[handler.alias] = handler;
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

    var getParent = function(handler) {
        if (handler.inherits) {
            getParent(handler.inherits);
            chain.push(handler.inherits);
        }
    };
    
    getParent(handler);
    chain.push(handler);
    
    this.__componentChain[handler.alias] = chain;
};

Javelin.buildComponentRequirements = function(handler) {
    var reqs = [];
    
    var getRequirements = function(handler) {
        if (handler.requires) {
            for (var i = 0; i < handler.requires.length; i++) {
                var exists = false;
                for (var j = 0; j < reqs.length; j++) {
                    if (reqs[j].alias === handler.requires[i].alias) {
                        exists = true;
                    }
                }
                if (!exists) {
                    getRequirements(handler.requires[i]);
                    reqs.push(handler.requires[i]);
                }
            }
        }
    };
    
    getRequirements(handler);
    
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
