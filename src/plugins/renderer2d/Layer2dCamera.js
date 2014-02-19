
/**
 * Cameras affect how renderer2d layers are rendered.
 */
Javelin.Layer2dCamera = function(name) {

    /**
     * Name of the camera instance.  This is the name you use when retrieving the camera
     * from the engine:
     *
     *  ```
     *  var camera = engine.getPlugin('renderer2d').getCamera('myCustomCameraName');
     *  ```
     * 
     * @type {string}
     */
    this.name = name;

    /**
     * The x,y position of the camera in game coordinates.
     * 
     * @type {Object}
     */
    this.position = {
        x: 0,
        y: 0
    };

    /**
     * The rotation of the camera in degrees.
     * 
     * @type {float}
     */
    this.rotation = 0.0;

    /**
     * The camera zoom.  Note that this cannot be a negative number.
     * 
     * @type {float}
     */
    this.zoom = 1.0;

    
    this.layer = null;
};

Javelin.Layer2dCamera.prototype.setLayer = function(layer) {
    this.layer = layer;
};

Javelin.Layer2dCamera.prototype.canSeePoint = function(x, y) {
    return true;
};

Javelin.Layer2dCamera.prototype.canSeeArea = function(ax, ay, bx, by) {
    return true;
};

Javelin.Layer2dCamera.prototype.getBoundries = function() {
    return {
        x: 1,
        y: 1
    };
};
