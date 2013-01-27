/*global Javelin:true */

'use strict';

Javelin.Component.Transform3d = function(go, comp) {
    this.name = "transform3d";
    this.requiredPlugins = [
        "ThreeJs"
    ];
    
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
        quaternion: 0.0
    };
    
    /* Absolute world coordinates */
    
    var parentTransform = (go.parent) ? go.parent.getComponent('transform3d') : false;
    
    comp.position.worldX = function() {
        return (parentTransform) ? parentTransform.position.x + comp.position.x : comp.position.x;
    };
    comp.position.worldY = function() {};
    comp.position.worldZ = function() {};
    
    comp.rotation.worldX = function() {};
    comp.rotation.worldY = function() {};
    comp.rotation.worldZ = function() {};
};
