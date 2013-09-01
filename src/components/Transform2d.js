'use strict';

/**
 * The `transform2d` component contains 2d position and rotation information.  It also contains helper methods
 * for adjusting those values.  For example, during an update frame, to easily move an object forward, relative
 * to its rotation, you could get this component and call `transformForward`: 
 * 
 *  gameOjbect.getComponent('transform2d').transformForward(50 * deltaTime);
 * 
 * @class Javelin.Component.Transform2d
 * @javelinComponent transform2d
 * @author Evan Villemez
 */
Javelin.Component.Transform2d = function(gameObject, component) {
    //private reference to parent transform
    var parentTransform;
    
    /**
     * An object containing the position x and y values.  It can be set directly:
     * 
     *  gameObject.getComponent('transform2d').position = {x: 50, y: 50};
     * 
     * @property {Object} X and Y coordinate position values
     */    
    component.position =  {
        x: 0.0,
        y: 0.0
    };
    
    /**
     * @property {Number} Rotation value in degrees.
     */    
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

    /**
     * Move the gameObject by adjusting the X and Y position values.
     *
     * @param {Number} X The amount to increment or decrement the position.x value
     * @param {Number} Y The amount to increment or decrement the position.y value
     */    
    component.translate = function(x, y) {
        x = x || 0.0;
        y = y || 0.0;
        
        component.position.x += x;
        component.position.y += y;
    };
    
    /**
     * Rotate the gameObject a certain number of degrees.
     *
     * @param {Number} degrees The number of degrees to rotate the object
     */    
    component.rotate = function(degrees) {
        degrees = degrees || 0.0;
        
        component.rotation = component.rotation + degrees % 360;
    };

    /**
     * Translate the gameObject forward according to its rotation.
     * 
     * @param {Number} amount The amount to move the gameObject
     */    
    component.translateForward = function(amount) {
        var radians = component.rotation * Javelin.PI_OVER_180;
        var x = Math.cos(radians) * amount;
        var y = Math.sin(radians) * amount;
        component.translate(x, y);
    };
    
    /**
     * Translate the gameObject backward according to its rotation.
     * 
     * @param {Number} amount The amount to move the gameObject
     */    
    component.translateBackward = function(amount) {
        var radians = component.rotation * Javelin.PI_OVER_180;
        var x = -Math.cos(radians) * amount;
        var y = -Math.sin(radians) * amount;
        component.translate(x, y);
    };
    
    component.translateRight = function(amount) {
        //TODO
    };
    
    component.translateLeft = function(amount) {
        //TODO
    };
    
    /**
     * Rotate the gameObject a certain number of degrees.
     *
     * @param {Number} degrees The number of degrees to rotate the object
     */    
    component.rotate = function(degrees) {
        degrees = degrees || 0.0;
        
        component.rotation = component.rotation + degrees % 360;
    };
    
    component.$on('engine.create', function() {
        //if there's a parent, cache it's transform
        parentTransform = (gameObject.parent) ? gameObject.parent.getComponent('transform2d') : false;
    });
};
Javelin.Component.Transform2d.alias = 'transform2d';
