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
    var currentFrame = 0;
    
    comp.$on('start', function() {
        comp.frames = go.engine.loadAssets(requiredAssets);
    });
    
    comp.$on('update', function(deltaTime) {
        //set the current image
        sprite.image = comp.frames[currentFrame];
        
        //modify the index for the next frame
        currentFrame = (currentFrame + 1) % requiredAssets.length;
    });
};
Grits.RobotComponent.alias = "grits.robot";
Grits.RobotComponent.requires = [
    Javelin.Component.Sprite
];
//Grits.RobotComponent.requiredAssets = [];
Javelin.register(Grits.RobotComponent);
