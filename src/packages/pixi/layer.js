/*global PIXI: true */

/**
 * A Layer encapsulates a PIXI stage, camera and DOM element used to render to.
 */
function Layer(renderTarget, camera, config) {
    this.setCamera(camera);
    this.renderTarget = renderTarget;
    this.pixelsPerUnit = config.pixelsPerUnit || 20;
    
    var targetHeight = renderTarget.clientHeight;
    var targetWidth = renderTarget.clientWidth;

    //instantiate the pixi renderer - autodetect if not specified directly in config
    if (config.type === 'webgl') {
        this.renderer = new PIXI.WebGLRenderer(targetWidth, targetHeight, null, true, config.antialias || true);
    } else if (config.type === 'canvas') {
        this.renderer = new PIXI.CanvasRenderer(targetWidth, targetHeight, null, true, config.antialias || true);
    } else {
        this.renderer = PIXI.autoDetectRenderer(targetWidth, targetHeight, null, true, config.antialias || true);
    }

    //add renderer view to target element
    this.view = this.renderer.view;
    this.renderTarget.appendChild(this.renderer.view);
    this.stage = new PIXI.Stage(config.backgroundColor || 0xFFFFFF);
    this.debugGraphics = null;
    
    if (config.debug || false) {
        this.debugGraphics = new LayerDebugCoordinates(this, camera);
        this.stage.addChild(this.debugGraphics);
    }
}

Layer.prototype.render = function() {
    if (this.debugGraphics) {
        this.debugGraphics.draw();
    }
    
    this.renderer.render(this.stage);
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
Layer.prototype.computeCanvasPosition = function(x, y) {
    
    //TODO: consider camera rotation :/
    //http://www.willamette.edu/~gorr/classes/GeneralGraphics/Transforms/transforms2d.htm
    
    return {
        x: ((x - this.camera.position.x) * this.pixelsPerUnit * this.camera.zoom) + (this.view.width * 0.5),
        y: ((-y + this.camera.position.y) * this.pixelsPerUnit * this.camera.zoom) + (this.view.height * 0.5)
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
Layer.prototype.getBoundries = function() {
    return {
        x: this.view.width / this.pixelsPerUnit,
        y: this.view.height / this.pixelsPerUnit
    };
};

Layer.prototype.setCamera = function(camera) {
    this.camera = camera;
    camera.setLayer(this);
};

Layer.prototype.getCamera = function() {
    return this.camera;
};
