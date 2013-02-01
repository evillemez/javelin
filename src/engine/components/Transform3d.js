'use strict';

Javelin.Component.Transform3d = function(go, comp) {
    /* Values are generally relative to parent */
    
    comp.position =  {
        x: 0.0,
        y: 0.0,
        z: 0.0
    };

    comp.rotation = {
        x: 0.0,
        y: 0.0,
        z: 0.0,
        w: 0.0
    };
    
    comp.scale = 1.0;
    
    /* Absolute world coordinates */
    
    //if there's a parent, cache it's transform
    var parentTransform = (go.parent) ? go.parent.getComponent('transform3d') : false;
    
    //absolute world coordinates
    comp.getWorldX = function() {
        return (parentTransform) ? parentTransform.position.x + comp.position.x : comp.position.x;
    };
    comp.getWorldY = function() {
        return (parentTransform) ? parentTransform.position.y + comp.position.y : comp.position.y;
    };
    comp.getWorldZ = function() {
        return (parentTransform) ? parentTransform.position.z + comp.position.z : comp.position.z;
    };
    
    comp.getPositionVector = function() {
        return [comp.position.x, comp.position.y, comp.position.z];
    };
    
    comp.getRotationVector = function() {
        return [comp.rotation.x, comp.rotation.y, comp.rotation.z, comp.rotation.w];
    };
    
    //movement
    comp.translate = function(arr) {
        comp.position.x += arr[0];
        comp.position.y += arr[1];
        comp.position.z += arr[2];
    };
    
    //rotation
    comp.lookAt = function(arr) {
        
    };
};
Javelin.Component.Transform3d.alias = 'transform3d';
Javelin.register(Javelin.Component.Transform3d);
