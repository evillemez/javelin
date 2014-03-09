/**
 * This component handles the controls for the robot.
 */
javelin.component('demo.controls', ['transform2d'], function(entity, game) {
    //public component variables (can be configured from a prefab)
    this.speed = 5;

    //private component variables
    var self = this
        , transform = entity.get('transform2d')
        , input = game.getPlugin('input')
        , camera = game.getPlugin('renderer2d').getCamera('default')
    ;
    
    //on every update, check for controls pressed
    //and move the circle and/or camera accordingly
    this.$on('engine.update', function(deltaTime) {
        var moveAmount = self.speed * deltaTime;

        //ball movement
        if (input.getButton('up'))       { transform.position.y += moveAmount; }
        if (input.getButton('down'))     { transform.position.y -= moveAmount; }
        if (input.getButton('right'))    { transform.position.x += moveAmount; }
        if (input.getButton('left'))     { transform.position.x -= moveAmount; }

        //camera movement
        if (input.getButton('camUp'))    { camera.position.y += moveAmount; }
        if (input.getButton('camDown'))  { camera.position.y -= moveAmount; }
        if (input.getButton('camRight')) { camera.position.x += moveAmount; }
        if (input.getButton('camLeft'))  { camera.position.x -= moveAmount; }
        if (input.getButton('zoomIn'))   { camera.zoom += moveAmount * 0.125; }
        if (input.getButton('zoomOut'))  { camera.zoom = Math.abs(camera.zoom - moveAmount * 0.125); }
    });

    this.$on('renderer2d.draw', function(layer, camera) {
        layer.drawDebugCoordinates(2.0);
    });
});
