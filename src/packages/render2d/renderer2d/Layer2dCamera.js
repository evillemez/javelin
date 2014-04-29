
/**
 * Rendering on 2d layers is relative to the position, rotation and zoom of the camera
 * assigned to the layer.  You can retrieve a camera by name from the `renderer2d` plugin,
 * or from a layer instance.
 * 
 */
Layer2dCamera = function(name) {

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
     * The rotation of the camera in degrees.  This is not implemented yet, and
     * is a placeholder for the future.
     * 
     * @type {float}
     */
    this.rotation = 0.0;

    /**
     * The camera zoom.  Note that this must be greater than 0.
     * 
     * @type {float}
     */
    this.zoom = 1.0;


    this.layer = null;
};

/**
 * Enforces setting the zoom to a positive number via `Math.abs()`
 *
 * @param {float} zoom      The new camera zoom
 */
Layer2dCamera.prototype.setZoom = function(zoom) {
    this.zoom = Math.abs(zoom);
};

Layer2dCamera.prototype.setLayer = function(layer) {
    this.layer = layer;
};

Layer2dCamera.prototype.canSeePoint = function(x, y) {
    return true;
};

Layer2dCamera.prototype.canSeeArea = function(ax, ay, bx, by) {
    return true;
};
