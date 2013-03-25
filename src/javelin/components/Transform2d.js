'use strict';

Javelin.Component.Transform2d = function(gameObject, component) {
    //private reference to parent transform
    var parentTransform;
    
    //float for x & y
    component.position =  {
        x: 0.0,
        y: 0.0
    };
    
    //float of 0 - 360 degrees
    component.rotation = 0.0;
    
    //absolute world coordinates
    component.getWorldX = function() {
        return (parentTransform) ? parentTransform.position.x + component.position.x : component.position.x;
    };
    
    component.getWorldY = function() {
        return (parentTransform) ? parentTransform.position.y + component.position.y : component.position.y;
    };
    
    component.getWorldRotation = function() {
        return (parentTransform) ? parentTransform.rotation + component.rotation : component.rotation;
    };

    //movement
    component.translate = function(x, y) {
        x = x || 0.0;
        y = y || 0.0;
        
        component.position.x += x;
        component.position.y += y;
    };    
    
    //todo doc
    component.rotate = function(degrees) {
        degrees = degrees || 0.0;
        
        component.rotation = component.rotation + degrees % 360;
    };
    
    //TODO: return values relative to self
    component.UP = function() {};
    component.DOWN = function() {};
    component.LEFT = function() {};
    component.RIGHT = function() {};

    component.$on('engine.create', function() {
        //if there's a parent, cache it's transform
        parentTransform = (gameObject.parent) ? gameObject.parent.getComponent('transform2d') : false;
    });
};
Javelin.Component.Transform2d.alias = 'transform2d';
