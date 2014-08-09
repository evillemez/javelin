function LayerDebugCoordinates(layer) {
    PIXI.Graphics.call(this);
    
    this.layer = layer;
    this.camera = layer.getCamera();
}

LayerDebugCoordinates.prototype = Object.create(PIXI.Graphics.prototype);
LayerDebugCoordinates.prototype.constructor = LayerDebugCoordinates;

LayerDebugCoordinates.prototype.draw = function () {
    this.clear();
    this.drawCoordinates();
    this.drawCamera();
};

LayerDebugCoordinates.prototype.drawCoordinates = function () {
    var interval = 2 * this.layer.pixelsPerUnit * this.camera.zoom;
    var height = this.layer.renderer.view.height;
    var width = this.layer.renderer.view.width;
    
	this.lineStyle(1, 0xAAFFAA, 1);
    
    //TODO: compute x/y offsets and start there

    for (var x = 0; x < width; x += interval) {
        //draw vertical lines
        
        this.moveTo(x, 0);
        this.lineTo(x, height);
        
        for (var y = 0; y < height; y += interval) {
            //draw horizontal lines
            
            this.moveTo(0, y);
            this.lineTo(width, y);
        }
    }
};

LayerDebugCoordinates.prototype.drawCamera = function () {
    var height = this.layer.renderer.view.height;
    var width = this.layer.renderer.view.width;

    this.lineStyle(3, 0xFFAAAA, 1);
    this.moveTo(0, height * 0.5);
    this.lineTo(width, height * 0.5);
    
    this.moveTo(width * 0.5, 0);
    this.lineTo(width * 0.5, height);
};
