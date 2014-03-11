
/**
 * This render layer renders to an HTML5 2d Canvas instance. It only supports a subset
 * of the canvas functionality at the moment.
 */
Javelin.Layer2dCanvas = function(renderTarget, camera, config) {
    this.$PI_OVER_180 = Math.PI / 180;
    this.$180_OVER_PI = 180 / Math.PI;
    this.$2xPI = 2 * Math.PI;

    this.renderTarget = renderTarget;
    this.camera = camera;
    this.pixelsPerUnit = config.pixelsPerUnit || 20;

    this.context = null;
    this.canvas = null;

    //create canvas instance
    var canvas = document.createElement('canvas');
    canvas.height = renderTarget.offsetHeight;
    canvas.width = renderTarget.offsetWidth;
    renderTarget.appendChild(canvas);
    this.canvas = canvas;
    this.context = canvas.getContext('2d');

    this.debug = false;
    this.debugGridDrawn = false;
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
    c.arc(0, 0, radius * this.pixelsPerUnit * this.camera.zoom, 0, this.$2xPI);
    c.closePath();

    //TODO: handle styles properly
    c.stroke();
    
    this.resetStyle();
};

Javelin.Layer2dCanvas.prototype.drawRectangle = function(x, y, height, width, style) {
    var c = this.context;
    var pos = this.normalizeCanvasPosition(x, y);
};

Javelin.Layer2dCanvas.prototype.drawShape = function(points, x, y, rotation, style) {
    //draws a complex shape
    //points is array of points
    //first point must be starting point
    //other points will draw lines/arcs/curves to next point, depending on number of values
    //in the array for that item
};

Javelin.Layer2dCanvas.prototype.drawImage = function(image, x, y, rotation, scaleX, scaleY) {
    var cam = this.camera;
    var c = this.context;

    scaleX = scaleX * cam.zoom;
    scaleY = scaleY * cam.zoom;
    var pos = this.normalizeCanvasPosition(x, y);
    var cx = image.width * 0.5 * scaleX;
    var cy = image.height * 0.5 * scaleY;
    var width = image.width * scaleX;
    var height = image.height * scaleY;

    c.save();
    c.translate(pos.x, pos.y);
    c.rotate(rotation * this.$PI_OVER_180);
    c.drawImage(
        image,
        -cx,
        -cy,
        width,
        height
    );
    
    if (!this.debug) {
        this.resetStyle();
        return;
    }
    
    //draw image debug
    c.strokeStyle = '#F00';
    c.beginPath();
    c.arc(0, 0, 3 * this.camera.zoom, 0, this.$2xPI);
    c.closePath();
    c.rect(
        -cx * scaleX,
        -cy * scaleY,
        width,
        height
    );
    c.stroke();
    this.resetStyle();
};

Javelin.Layer2dCanvas.prototype.drawAtlasImage = function(atlasImage, x, y, rotation, scaleX, scaleY) {
    var cam = this.camera;
    var c = this.context;

    scaleX = scaleX * cam.zoom;
    scaleY = scaleY * cam.zoom;

    var pos = this.normalizeCanvasPosition(x, y);

    c.save();
    c.translate(pos.x, pos.y);
    c.rotate(rotation * this.$PI_OVER_180);
    c.drawImage(
        atlasImage.image,
        atlasImage.x,
        atlasImage.y,
        atlasImage.width,
        atlasImage.height,
        atlasImage.cx * scaleX,
        atlasImage.cy * scaleY,
        atlasImage.width * scaleX,
        atlasImage.height * scaleY
    );

    if (!this.debug) {
        this.resetStyle();
        return;
    }

    //draw sprite image debug (center and bounding box)
    c.strokeStyle = '#F00';
    c.beginPath();
    c.arc(0, 0, 3 * this.camera.zoom, 0, this.$2xPI);
    c.closePath();
    c.rect(
        atlasImage.cx * scaleX,
        atlasImage.cy * scaleY,
        atlasImage.width * scaleX,
        atlasImage.height * scaleY
    );
    c.stroke();
    this.resetStyle();
};

Javelin.Layer2dCanvas.prototype.clear = function() {
    this.debugGridDrawn = false;
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
        x: ((x - this.camera.position.x) * this.pixelsPerUnit * this.camera.zoom) + (this.canvas.width * 0.5),
        y: ((-y + this.camera.position.y) * this.pixelsPerUnit * this.camera.zoom) + (this.canvas.height * 0.5)
    };
};

/**
 * Get the size of the x and y axis in game coordinates.  Note that this is not
 * relative to the camera - it's a direct translation from canvas space to game space.
 *
 * To determine the game coordinate boundaries visible by the camera, call `camera.getBoundries()`.
 * 
 * @return {object}     An object containing x and y properties.
 */
Javelin.Layer2dCanvas.prototype.getBoundries = function() {
    return {
        x: this.canvas.width / this.pixelsPerUnit,
        y: this.canvas.height / this.pixelsPerUnit
    };
};

/**
 * Show the canvas coordinate grid for debug purposes.
 *
 * @param  {float} interval     At what interval coordinates should be shown, default 1.0
 * @param  {string} color       Color for the debug grid lines.
 */
Javelin.Layer2dCanvas.prototype.drawDebugCoordinates = function(interval, color) {
    if (this.debugGridDrawn) {
        return;
    }

    interval = interval || 1.0;
    color = color || '#888';

    var bounds = this.getBoundries();
    var pos = this.camera.position;
    var zoom = this.camera.zoom;

    //figure out camera's visibility boundries in game coordinates
    var left = pos.x - (bounds.x * 0.5) / zoom;
    var right = pos.x + (bounds.x * 0.5) / zoom;
    var top = pos.y + (bounds.y * 0.5) / zoom;
    var bottom = pos.y - (bounds.y * 0.5) / zoom;
    //account for grid line offset
    var offsetX = left % interval;
    var offsetY = bottom % interval;

    //draw grid
    var c = this.context
        , p1 = null
        , p2 = null
    ;

    c.save();
    c.beginPath();

    for (var i = left - interval; i < right + interval; i += interval) {
        //draw vertical lines
        p1 = this.normalizeCanvasPosition(i - offsetX, bottom);
        p2 = this.normalizeCanvasPosition(i - offsetX, top);
        c.moveTo(p1.x, p1.y);
        c.lineTo(p2.x, p2.y);

        for (var j = bottom - interval; j < top + interval; j += interval) {
            //draw horizontal lines
            p1 = this.normalizeCanvasPosition(left, j - offsetY);
            p2 = this.normalizeCanvasPosition(right, j - offsetY);
            c.moveTo(p1.x, p1.y);
            c.lineTo(p2.x, p2.y);
        }
    }

    c.setStrokeColor(color);
    c.stroke();
    this.resetStyle();

    //draw centered crosshairs
    var midX = this.canvas.width * 0.5;
    var midY = this.canvas.height * 0.5;

    c.save();
    c.beginPath();
    c.moveTo(midX, 0);
    c.lineTo(midX, this.canvas.height);
    c.moveTo(0, midY);
    c.lineTo(this.canvas.width, midY);
    c.setStrokeColor('#0F0');
    c.stroke();
    this.resetStyle();

    //write camera center coordinates
    c.save();
    c.setStrokeColor('#00F');
    //center
    c.strokeText(
        '('+pos.x.toFixed(2)+', '+pos.y.toFixed(2)+')',
        midX + 3,
        midY + 10
    );
    //left
    c.strokeText(
        '('+(pos.x + left).toFixed(2)+', '+pos.y.toFixed(2)+')',
        0 + 3,
        midY + 10
    );
    //right
    c.strokeText(
        '('+(pos.x + right).toFixed(2)+', '+pos.y.toFixed(2)+')',
        this.canvas.width - 73,
        midY + 10
    );
    //top
    c.strokeText(
        '('+pos.x.toFixed(2)+', '+(pos.y + top).toFixed(2)+')',
        midX + 3,
        0 + 10
    );
    //bottom
    c.strokeText(
        '('+pos.x.toFixed(2)+', '+(pos.y + bottom).toFixed(2)+')',
        midX + 3,
        this.canvas.height - 10
    );

    this.resetStyle();
    this.debugGridDrawn = true;
};

Javelin.Layer2dCanvas.prototype.setCamera = function(camera) {
    this.camera = camera;
    camera.setLayer(this);
};

Javelin.Layer2dCanvas.prototype.getCamera = function() {
    return this.camera;
};
