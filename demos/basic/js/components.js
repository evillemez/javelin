//simply draws a circle wherever the entity's transform is located
javelin.component('basic.ball', ['transform2d'], function(entity, game) {
    this.color = 'FF0000';
    this.radius = 3;

    var self = this;
    var transform = entity.get('transform2d');

    //draw the ball on the canvas, but only if it's actually
    //visible in the viewport
    this.$on('renderer2d.draw', function(layer, camera, plugin) {
        if (camera.canSeeTransform(transform)) {
            plugin.drawCircle(transform.x, transform.y, self.radius);
        }
    });

});

//listens for control input to move the entity
javelin.component('basic.controls', ['transform2d'], function(entity, game) {
    //public component variables (can be configured from a prefab)
    this.speed = 5;

    //private component variables
    var self = this
        , transform = entity.get('transform2d')
        , input = game.getPlugin('input')
    ;
    
    //on every update, check for controls pressed
    //and move the object accordingly
    this.$on('engine.update', function(deltaTime) {
        var moveAmount = self.speed * deltaTime;

        if (input.getButton('up')) {
            transform.y -= moveAmount;
        }

        if (input.getButton('down')) {
            transform.y += moveAmount;
        }

        if (input.getButton('right')) {
            transform.x += moveAmount;
        }

        if (input.getButton('left')) {
            transform.x -= moveAmount;
        }
    });
});

//draws grid lines to demonstrate the coordinate system for reference
javelin.component('basic.grid', [], function(entity, game) {
    this.$on('renderer2d.draw', function(layer, camera, plugin) {
        //TODO: draw grid lines
    });
});
