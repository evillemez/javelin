function LayerDebugCoordinates(layer) {
    PIXI.Graphics.call(this);
    
    this.layer = layer;
}

LayerDebugCoordinates.prototype = Object.create(PIXI.Graphics.prototype);
LayerDebugCoordinates.prototype.constructor = LayerDebugCoordinates;

LayerDebugCoordinates.prototype.draw = function () {
    this.clear();
    this.drawCoordinates();
    this.drawCamera();
};

LayerDebugCoordinates.prototype.drawCoordinates = function () {
	this.beginFill(0xFF3300);
	this.lineStyle(1, 0xAAFFAA, 1);
    this.moveTo(50,50);
	this.lineTo(250, 50);
    this.endFill();
};

LayerDebugCoordinates.prototype.drawCamera = function () {
    
};
