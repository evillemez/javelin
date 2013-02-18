'use strict';

Javelin.Component.SpriteAnimator = function(go, comp) {
    var sprite = go.getComponent('sprite');
    var animations = {};
    
    comp.currentAnimation = null;
    comp.define = function(name, assetArray) {
        animations[name] = go.engine.loadAssets(assetArray);
        //also, allow a time in ms to be set per animation
        //then update can figure out when to switch frames
    };
    
    comp.play = function(name) {
        comp.currentAnimation = name;
    };
    
    comp.interrupt = function() {};
    
    //each frame, figure out which frame to draw
    comp.$on('update', function(deltaTime) {
        if (sprite.visible) {
            //play the current animation by switching
            //to the appropriate sprite
        }
    });
};
Javelin.Component.SpriteAnimator.alias = "spriteAnimator";
Javelin.Component.SpriteAnimator.requires = ['sprite'];
Javelin.register(Javelin.Component.SpriteAnimator);