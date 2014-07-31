/**
 * This component handles the controls for the robot.
 */
javelin.component('demo.controls', ['transform2d'], function(entity, game) {
    //public component variables (can be configured from a prefab)
    this.speed = 5;

    //private component variables
    var self = this;
    var transform, animator, input, camera;

    //when created, get references to things this
    //component will control
    entity.on('entity.create', function() {
        transform = entity.get('transform2d');
        input = game.getPlugin('input');
        camera = game.getPlugin('pixi').getCamera('main');
        //animator = entity.get('spriteAnimator2d');
    });

    //on every update, check for controls pressed
    //and move the circle and/or camera accordingly
    entity.on('engine.update', function(deltaTime) {
        var moveAmount = self.speed * deltaTime;

        //ball movement
        var moving = false;
        if (input.getButton('up'))       { transform.translateForward(moveAmount);  moving = true; }
        if (input.getButton('down'))     { transform.translateBackward(moveAmount); moving = true; }
        if (input.getButton('right'))    { transform.rotate(3);  moving = true; }
        if (input.getButton('left'))     { transform.rotate(-3); moving = true; }

//        if (moving) { animator.start(); }
//        else { animator.stop(); }

        //camera movement
        if (input.getButton('camUp'))    { camera.position.y += moveAmount; }
        if (input.getButton('camDown'))  { camera.position.y -= moveAmount; }
        if (input.getButton('camRight')) { camera.position.x += moveAmount; }
        if (input.getButton('camLeft'))  { camera.position.x -= moveAmount; }
        if (input.getButton('zoomIn'))   { camera.zoom += moveAmount * 0.125; }
        if (input.getButton('zoomOut'))  { camera.zoom = Math.abs(camera.zoom - moveAmount * 0.125); }
    });

    entity.on('renderer2d.draw', function(layer, camera) {
//        layer.debug = true;
//        layer.drawDebugCoordinates(2.0);
    });
});
