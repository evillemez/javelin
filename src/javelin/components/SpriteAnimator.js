'use strict';

/**
 * This component is used to define sprite animations.  You can define many animations and reference them by
 * by name.  Every frame, the animator will pick the set the appropriate image to be rendered on the sprite
 * component.
 *
 * @author Evan Villemez
 */
Javelin.Component.SpriteAnimator = function(gameObject, component) {
    //private
    var sprite = gameObject.getComponent('sprite');
    var animations = {};
    var defaultAnimation = null;
    var currentFrame = 0;
    var currentAnimation = null;
    var animating = true;
    
    //public api
    component.getCurrentAnimation = function() {
        return currentAnimation;
    };
    
    component.define = function(name, images) {
        animations[name] = images;
        
        if (!defaultAnimation) {
            defaultAnimation = name;
        }

        //also, allow a time in ms to be set per animation
        //then update can figure out when to switch frames
    };
    
    component.getCurrentAnimation = function() {
        return currentAnimation;
    };

    //start, if not already playing
    component.play = function(name) {
        animating = true;
        currentAnimation = name;
    };
    
    component.playOnce = function(name) {
        animating = true;
        
    };
    
    //start from beginning
    component.start = function(name) {
        animating = true;
        
    };
    
    //once
    component.startOnce = function(name) {
        animating = true;
        
    };
    
    //stop playing
    component.stop = function() {
        animating = false;
    };
    
    //set default
    component.setDefaultAnimation = function(name) {
        
    };
    
    //each frame, figure out which image to draw
    component.$on('engine.update', function(deltaTime) {
        if (sprite.visible && animating) {
            var current = component.currentAnimation || defaultAnimation;
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
