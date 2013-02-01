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
    Javelin.__componentHandlers[handler.alias] = handler;
};
Javelin.getComponentHandler = function(name) {
    return Javelin.__componentHandlers[name] || false;
};
Javelin.getComponentChain = function(name) {
    return Javelin.__componentChain[name] || [];
};
Javelin.getComponentRequirements = function(name) {
    return Javelin.__componentRequirements || [];
};
Javelin.buildComponentHierarchy = function(name) {
    //TODO
};
Javelin.buildComponentRequirements = function(name) {
    //TODO
};

//figure out all component inheritence and requirements
Javelin.initialize = function() {
    for (var name in Javelin.__componentHandlers) {

        //build inheritance chain
        Javelin.buildComponentChain(Javelin.__componentHandlers[name]);
        
        //build requirements
        Javelin.buildComponentRequirements(Javelin.__componentHandlers[name]);
    }
};
