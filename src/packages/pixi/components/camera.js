
/**
 * A component for controlling a layer camera as if it were any other entity
 * in the scene.
 */
javelin.component('pixi.camera', ['transform2d'], function(entity, game) {
    this.cameraName = 'main';

    var self = this;
    var plugin = game.getPlugin('pixi');
    var transform = entity.get('transform2d');
    var camera = null;

    this.getCamera = function() {
        return camera;
    };

    entity.on('entity.create', function() {
        camera = plugin.getCamera(self.cameraName);
    });

    entity.on('engine.update', function(deltaTime) {
        camera.position = transform.position;
    });
});
