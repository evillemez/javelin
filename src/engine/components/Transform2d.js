'use strict';

Javelin.Component.Transform2d = function(go, comp) {
    /* Values are generally relative to parent */
    
    comp.position =  {
        x: 0.0,
        y: 0.0
    };

    comp.rotation = {
        x: 0.0,
        y: 0.0
    };
    
    comp.scale = 1.0;
    
    /* Absolute world coordinates */
    
    //if there's a parent, cache it's transform
    var parentTransform = (go.parent) ? go.parent.getComponent('transform2d') : false;
    
    //absolute world coordinates
    comp.getWorldX = function() {
        return (parentTransform) ? parentTransform.position.x + comp.position.x : comp.position.x;
    };
    comp.getWorldY = function() {
        return (parentTransform) ? parentTransform.position.y + comp.position.y : comp.position.y;
    };

    comp.getPositionVector = function() {
        return [comp.position.x, comp.position.y];
    };
    
    comp.getRotationVector = function() {
        return [comp.rotation.x, comp.rotation.y];
    };
    
    //movement
    comp.translate = function(arr) {
        comp.position.x += arr[0];
        comp.position.y += arr[1];
    };
    
};
Javelin.Component.Transform2d.alias = 'transform2d';
//Javelin.register(Javelin.Component.Transform2d);
