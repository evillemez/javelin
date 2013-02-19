'use strict';

Grits.RobotComponent = function(go, comp) {
    var requiredAssets = [
        '/media/js/standalone/libs/gamedev_assets/robowalk/robowalk00.png',
        '/media/js/standalone/libs/gamedev_assets/robowalk/robowalk01.png',
        '/media/js/standalone/libs/gamedev_assets/robowalk/robowalk02.png',
        '/media/js/standalone/libs/gamedev_assets/robowalk/robowalk03.png',
        '/media/js/standalone/libs/gamedev_assets/robowalk/robowalk04.png',
        '/media/js/standalone/libs/gamedev_assets/robowalk/robowalk05.png',
        '/media/js/standalone/libs/gamedev_assets/robowalk/robowalk06.png',
        '/media/js/standalone/libs/gamedev_assets/robowalk/robowalk07.png',
        '/media/js/standalone/libs/gamedev_assets/robowalk/robowalk08.png',
        '/media/js/standalone/libs/gamedev_assets/robowalk/robowalk09.png',
        '/media/js/standalone/libs/gamedev_assets/robowalk/robowalk10.png',
        '/media/js/standalone/libs/gamedev_assets/robowalk/robowalk11.png',
        '/media/js/standalone/libs/gamedev_assets/robowalk/robowalk12.png',
        '/media/js/standalone/libs/gamedev_assets/robowalk/robowalk13.png',
        '/media/js/standalone/libs/gamedev_assets/robowalk/robowalk14.png',
        '/media/js/standalone/libs/gamedev_assets/robowalk/robowalk15.png',
        '/media/js/standalone/libs/gamedev_assets/robowalk/robowalk16.png',
        '/media/js/standalone/libs/gamedev_assets/robowalk/robowalk17.png',
        '/media/js/standalone/libs/gamedev_assets/robowalk/robowalk18.png'
    ];
    
    var sprite = go.getComponent('sprite');
    var transform = go.getComponent('transform2d');
    var currentFrame = 0;
    
    comp.frames = [];
        
    comp.$on('create', function() {
        go.active = false;
        
        //load assets on start
        go.engine.loadAssets(requiredAssets, function(images) {
            comp.frames = images;
            go.active = true;
        });
    });
    
    comp.$on('update', function(deltaTime) {
        //set the current image
        sprite.image = comp.frames[currentFrame];
        
        //just to prove a point, that it can move
        transform.position.x = currentFrame;
        
        //modify the index for the next frame
        currentFrame = (currentFrame + 1) % comp.frames.length;
    });
};
Grits.RobotComponent.alias = "grits.robot";
Grits.RobotComponent.requires = ['sprite'];
Javelin.register(Grits.RobotComponent);
