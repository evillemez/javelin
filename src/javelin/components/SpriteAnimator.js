'use strict';

/**
 * This component is used to define sprite animations.  You can define many animations and reference them by
 * by name.  Every frame, the animator will pick the set the appropriate image to be rendered on the sprite
 * component.
 *
 * @author Evan Villemez
 */
Javelin.Component.SpriteAnimator = function(gameObject, component) {
    component.animations = null;
    component.defaultAnimation = null;
    
    //private
    var sprite = gameObject.getComponent('sprite');
    var animations = {};
    var currentFrame = 0;
    var currentAnimation = null;
    var animating = true;
    var playOnce = true;
    var playOnceCallback = null;
    
    //public api
    component.getCurrentAnimation = function() {
        return currentAnimation;
    };
    
    //TODO: flesh out defining animations a little more, there are other options that
    //should be supported
    component.define = function(name, images) {
        animations[name] = images;
        
        if (!component.defaultAnimation) {
            component.defaultAnimation = name;
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
        playOnce = false;
        currentFrame = 0;
        currentAnimation = name;
    };
    
    component.playOnce = function(name, callback) {
        animating = true;
        playOnce = true;
        currentAnimation = name;
        playOnceCallback = callback;
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
    
    //if component.animations is defined, automatically load
    //and define the animations
    component.$on('engine.create', function() {
        if (component.animations) {
            var numLoaded = 0;
            var numTotal = 0;
            sprite.visible = false;
            
            for (var name in component.animations) {
                numTotal++;
                if (component.animations[name].atlasPath) {
                    gameObject.engine.loadAsset(component.animations[name].atlasPath, function(atlas) {
                        var imgs = [];
                        for (var index in component.animations[name].frames) {
                            imgs.push(atlas.images[component.animations[name].frames[index]]);
                        }
                        
                        component.define(name, imgs);
                        numLoaded++;
                       
                       if (numLoaded === numTotal) {
                           gameObject.enable();
                           sprite.visible = true;
                       }
                    });
                } else {
                    gameObject.engine.loadAssets(component.animations[name].frames, function(images) {
                        component.define(name, images);
                        numLoaded++;
                        if (numLoaded === numTotal) {
                            gameObject.enable();
                            sprite.visible = true;
                        }
                    });
                }
            }
        }
    });
    
    //each frame, figure out which image to draw
    component.$on('engine.update', function(deltaTime) {
        if (sprite.visible && animating) {
            var current = currentAnimation || component.defaultAnimation;
            var anim = animations[current];
            
            //TODO: write proper logic
            
            //play the current animation by switching
            //to the appropriate sprite
            sprite.image = anim[currentFrame];
            
            //increment frames
            currentFrame = (currentFrame + 1) % anim.length;
            
            //check if this is a play once, call any given callbacks if so
            if (currentFrame === 0 && playOnce) {
                playOnce = false;
                if (playOnceCallback) {
                    currentAnimation = component.defaultAnimation;
                    playOnceCallback();
                }
            }
        }
    });
};
Javelin.Component.SpriteAnimator.alias = "spriteAnimator";
Javelin.Component.SpriteAnimator.requires = ['sprite'];
