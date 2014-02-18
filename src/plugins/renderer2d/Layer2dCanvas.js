
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

    c.save();
    c.translate(pos.x, pos.y);
    c.beginPath();
    c.arc(0, 0, radius * this.pixelsPerUnit, 0, 360);
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

Javelin.Layer2dCanvas.prototype.normalizeCanvasPosition = function(x, y) {
    return {
        x: (((x - this.camera.position.x) * this.pixelsPerUnit) + (this.canvas.width * 0.5)) * this.camera.zoomX,
        y: (((y - this.camera.position.y) * this.pixelsPerUnit) + (this.canvas.height * 0.5)) * this.camera.zoomY
    };
};

Javelin.Layer2dCanvas.prototype.setCamera = function(camera) {
    this.camera = camera;
    camera.setLayer(this);
};

Javelin.Layer2dCanvas.prototype.getCamera = function() {
    return this.camera;
};
