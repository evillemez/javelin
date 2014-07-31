function LayerDebugGrid(layer, camera) {
    PIXI.Graphics.call(this);

    this.layer = layer;
    this.camera = camera;
}

LayerDebugGrid.prototype.draw = function () {
    console.log('Drawing debug grid...');
    this.clear();
    this.drawGrid();
    this.drawCamera();
};

LayerDebugGrid.prototype.drawGrid = function () {

};

LayerDebugGrid.prototype.drawCamera = function () {
    
};