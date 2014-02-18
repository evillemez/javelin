/**
 * The `transform2d` component contains 2d position and rotation information.  It also contains helper methods
 * for adjusting those values.  For example, during an update frame, to easily move an object forward, relative
 * to its rotation, you could get this component and call `translateForward`: 
 * 
 *  entity.get('transform2d').translateForward(50 * deltaTime);
 * 
 * @javelin-component transform2d
 * @author Evan Villemez
 */
Javelin.Components.Transform2d = function(entity, game) {
    var self = this;

    //private reference to parent transform
    var parentTransform;
    
    /**
     * An object containing the position x and y values.  It can be set directly:
     * 
     *  entity.get('transform2d').position = {x: 50, y: 50};
     *
     * Note that if the entity also contains a `rigidbody2d` component, you should NOT
     * set position and rotation information directly.
     * 
     * @property {Object} X and Y coordinate position values
     */    
    this.position =  {
        x: 0.0,
        y: 0.0
    };
    
    /**
     * @property {Number} Rotation value in degrees.
     */    
    this.rotation = 0.0;
    
    //absolute world coordinates
    this.getAbsoluteX = function() {
        return (parentTransform) ? parentTransform.getWorldX() + self.position.x : self.position.x;
    };
    
    this.getAbsoluteY = function() {
        return (parentTransform) ? parentTransform.getWorldY() + self.position.y : self.position.y;
    };
    
    this.getAbsoluteRotation = function() {
        return ((parentTransform) ? parentTransform.getWorldRotation() + self.rotation : self.rotation) % 360;
    };

    /**
     * Move the gameObject by adjusting the X and Y position values.
     *
     * @param {Number} X The amount to increment or decrement the position.x value
     * @param {Number} Y The amount to increment or decrement the position.y value
     */    
    this.translate = function(x, y) {
        x = x || 0.0;
        y = y || 0.0;
        
        self.position.x += x;
        self.position.y += y;
    };
    
    /**
     * Rotate the gameObject a certain number of degrees.
     *
     * @param {Number} degrees The number of degrees to rotate the object
     */    
    this.rotate = function(degrees) {
        degrees = degrees || 0.0;
        
        self.rotation = self.rotation + degrees % 360;
    };

    /**
     * Translate the gameObject forward according to its rotation.
     * 
     * @param {Number} amount The amount to move the gameObject
     */    
    this.translateForward = function(amount) {
        var radians = self.rotation * Javelin.$PI_OVER_180;
        var x = Math.cos(radians) * amount;
        var y = Math.sin(radians) * amount;
        self.translate(x, y);
    };
    
    /**
     * Translate the gameObject backward according to its rotation.
     * 
     * @param {Number} amount The amount to move the gameObject
     */    
    this.translateBackward = function(amount) {
        var radians = self.rotation * Javelin.$PI_OVER_180;
        var x = -Math.cos(radians) * amount;
        var y = -Math.sin(radians) * amount;
        self.translate(x, y);
    };
    
    this.translateRight = function(amount) {
        //TODO
    };
    
    this.translateLeft = function(amount) {
        //TODO
    };
    
    /**
     * Rotate the gameObject a certain number of degrees.
     *
     * @param {Number} degrees The number of degrees to rotate the object
     */    
    this.rotate = function(degrees) {
        degrees = degrees || 0.0;
        
        self.rotation = self.rotation + degrees % 360;
    };

    this.$on('entity.modified', function() {
        parentTransform = (entity.parent) ? entity.parent.getComponent('transform2d') : false;
    });
    
    this.$on('engine.create', function() {
        //if there's a parent, cache its transform
        parentTransform = (entity.parent) ? entity.parent.getComponent('transform2d') : false;
    });
};
