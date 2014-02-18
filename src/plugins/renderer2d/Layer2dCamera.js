
/**
 * This render layer renders to an HTML5 2d Canvas instance.
 */
Javelin.Layer2dCamera = function(name) {
	this.name = name;
    this.position = {
        x: 0,
        y: 0
    };

    this.zoomX = 1.0;
    this.zoomY = 1.0;
};

Javelin.Layer2dCamera.prototype.canSeePoint = function(x, y) {
    return true;
};
