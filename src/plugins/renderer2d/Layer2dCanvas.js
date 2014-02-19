
/**
 * This render layer renders to an HTML5 2d Canvas instance.
 */
Javelin.Layer2dCanvas = function(renderTarget, config) {
    this.renderTarget = renderTarget;
    this.camera = null;
    this.context = null;
    this.canvas = null;
    this.pixelsPerUnit = config.pixelsPerUnit || 20;

    //create canvas instance
    var canvas = document.createElement('canvas');
    canvas.height = renderTarget.offsetHeight;
    canvas.width = renderTarget.offsetWidth;
    renderTarget.appendChild(canvas);
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
};

Javelin.Layer2dCanvas.prototype.setStyle = function(config) {
    this.context.save();
    //set styles
};

Javelin.Layer2dCanvas.prototype.resetStyle = function(config) {
    this.context.restore();
};

Javelin.Layer2dCanvas.prototype.drawCircle = function(x, y, radius) {
    var c = this.context;
    var pos = this.normalizeCanvasPosition(x, y);

    //console.log('normalized at', pos);
    //throw new Error('pause');
    //TODO:

    c.save();
    c.translate(pos.x, pos.y);
    c.beginPath();
    c.arc(0, 0, radius * this.pixelsPerUnit * this.camera.zoom, 0, 360);
    c.closePath();
    c.fill();
    c.restore();
};

Javelin.Layer2dCanvas.prototype.drawImage = function() {
    //TODO
};

Javelin.Layer2dCanvas.prototype.drawAtlasImage = function() {
    //TODO
};

Javelin.Layer2dCanvas.prototype.clear = function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

/**
 * This takes an x and y in game coordinate space, and converts it into canvas coordinates,
 * while taking into account the cameras position and zoom.  It also takes care of inverting
 * the y axis.
 * 
 * @param  {float} x    Game x position
 * @param  {float} y    Game y position
 * @return {object}     An object containing normalized x and y properties.
 */
Javelin.Layer2dCanvas.prototype.normalizeCanvasPosition = function(x, y) {
    return {
        x: (((x - this.camera.position.x) * this.pixelsPerUnit * this.camera.zoom) + (this.canvas.width * 0.5)),
        y: (((-y + this.camera.position.y) * this.pixelsPerUnit * this.camera.zoom) + (this.canvas.height * 0.5))
    };
};

Javelin.Layer2dCanvas.prototype.setCamera = function(camera) {
    this.camera = camera;
    camera.setLayer(this);
};

Javelin.Layer2dCanvas.prototype.getCamera = function() {
    return this.camera;
};
