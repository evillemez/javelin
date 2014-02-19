//simply draws a circle wherever the entity's transform is located
javelin.component('demo.ball', ['transform2d'], function(entity, game) {
    this.color = 'FF0000';
    this.radius = 3;

    var self = this;
    var transform = entity.get('transform2d');

    //draw the ball on the layer, but only if it's actually
    //visible in the viewport
    this.$on('renderer2d.draw', function(layer, camera) {
        layer.drawCircle(
            transform.getAbsoluteX(),
            transform.getAbsoluteY(),
            self.radius
        );
    });

});

//listens for control input to move the entity
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
    //and move the object accordingly
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
        if (input.getButton('zoomIn'))   { camera.zoom += moveAmount * 0.25; }
        if (input.getButton('zoomOut'))  { camera.zoom = Math.abs(camera.zoom - moveAmount * 0.25); }
    });
});

//draws grid lines to demonstrate the coordinate system for reference
javelin.component('demo.grid', [], function(entity, game) {

    this.$on('renderer2d.draw', function(layer, camera) {
        
        //TODO: draw grid lines for cameras view
        var boundries = camera.getBoundries();
        for (var i = 0; i < 10; i++) {
            //make a real loop...
            //layer.drawLine();
        }
        
    });

});
