
/**
 * Cameras affect how renderer2d layers are rendered.
 */
Javelin.Layer2dCamera = function(name) {
	this.name = name;
    this.position = {
        x: 0,
        y: 0
    };

    this.zoomX = 1.0;
    this.zoomY = 1.0;
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

Javelin.Layer2dCamera.prototype.getBoundry = function() {
	return {
		x: 1,
		y: 1
	};
};
