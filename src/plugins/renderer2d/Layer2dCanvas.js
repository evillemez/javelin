
/**
 * This render layer renders to an HTML5 2d Canvas instance.
 */
Javelin.Layer2dCanvas = function(renderTarget, config) {
    this.$PI_OVER_180 = Math.PI / 180;
    this.$180_OVER_PI = 180 / Math.PI;

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
    //set styles
};

Javelin.Layer2dCanvas.prototype.resetStyle = function() {
    this.context.restore();
};

Javelin.Layer2dCanvas.prototype.drawLine = function(ax, ay, bx, by, style) {
    var c = this.context;
    var p1 = this.normalizeCanvasPosition(ax, ay);
    var p2 = this.normalizeCanvasPosition(bx, by);
    if (style) { this.setStyle(style); }

    c.save();
    c.beginPath();
    c.moveTo(p1.x, p1.y);
    c.lineTo(p2.x, p2.y);

    //TODO: handle styles properly
    c.stroke();
    this.resetStyle();
};

Javelin.Layer2dCanvas.prototype.drawCircle = function(x, y, radius, style) {
    var c = this.context;
    var pos = this.normalizeCanvasPosition(x, y);
    if (style) { this.setStyle(style); }

    c.save();
    c.translate(pos.x, pos.y);
    c.beginPath();
    c.arc(0, 0, radius * this.pixelsPerUnit * this.camera.zoom, 0, 360);
    c.closePath();

    //TODO: handle styles properly
    c.stroke();
    
    this.resetStyle();
};

Javelin.Layer2dCanvas.prototype.drawShape = function(points, x, y, rotation, style) {
    //draws a complex shape
    //points is array of points
    //first point must be starting point
    //other points will draw lines/arcs/curves to next point, depending on number of values
    //in the array for that item
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

    //TODO: take into account camera rotation :(

    return {
        x: (((x - this.camera.position.x) * this.pixelsPerUnit * this.camera.zoom) + (this.canvas.width * 0.5)),
        y: (((-y + this.camera.position.y) * this.pixelsPerUnit * this.camera.zoom) + (this.canvas.height * 0.5))
    };
};

/**
 * Get the size of the x and y axis in game coordinates.  Note that this is not
 * relative to the camera - it's a direct translation from canvas space to game space.
 * 
 * @return {object}     An object containing x and y properties.
 */
Javelin.Layer2dCanvas.prototype.getBoundries = function() {
    return {
        x: this.canvas.width / this.pixelsPerUnit,
        y: this.canvas.height / this.pixelsPerUnit
    };
};

Javelin.Layer2dCanvas.prototype.setCamera = function(camera) {
    this.camera = camera;
    camera.setLayer(this);
};

Javelin.Layer2dCanvas.prototype.getCamera = function() {
    return this.camera;
};
