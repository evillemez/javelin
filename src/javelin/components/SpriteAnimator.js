'use strict';

/**
 * This component is used to define sprite animations.  You can define many animations and reference them by
 * by name.  Every frame, the animator will pick the set the appropriate image to be rendered on the sprite
 * component.
 *
 * @author Evan Villemez
 */
Javelin.Component.SpriteAnimator = function(go, comp) {
    //private
    var sprite = go.getComponent('sprite');
    var animations = {};
    var defaultAnimation = null;
    var currentFrame = 0;
    var currentAnimation = null;
    
    //public api
    
    comp.define = function(name, images) {
        animations[name] = images;
        
        if (!defaultAnimation) {
            defaultAnimation = name;
        }

        //also, allow a time in ms to be set per animation
        //then update can figure out when to switch frames
    };
    
    comp.getCurrentAnimation = function() {
        return currentAnimation;
    };

    //start, if not already playing
    comp.play = function(name) {
        currentAnimation = name;
    };
    
    comp.playOnce = function(name) {
        
    };
    
    //start from beginning
    comp.start = function(name) {
        
    };
    
    //once
    comp.startOnce = function(name) {
        
    };
    
    //stop playing
    comp.interrupt = function() {};
    
    //set default
    comp.setDefaultAnimation = function(name) {
        
    };
    
    //each frame, figure out which frame to draw
    comp.$on('update', function(deltaTime) {
        if (sprite.visible) {
            var current = comp.currentAnimation || defaultAnimation;
            var anim = animations[current];
            
            //TODO: write proper logic
            
            //set the current image to draw
            sprite.image = anim[currentFrame];
            
            currentFrame = (currentFrame + 1) % anim.length;
            
            //play the current animation by switching
            //to the appropriate sprite
        }
    });
};
Javelin.Component.SpriteAnimator.alias = "spriteAnimator";
Javelin.Component.SpriteAnimator.requires = ['sprite'];
Javelin.register(Javelin.Component.SpriteAnimator);