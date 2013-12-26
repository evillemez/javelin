'use strict';

/**
 * This component is used to define sprite animations.  You can define many animations and reference them by
 * by name.  Every frame, the animator will pick the set the appropriate image to be rendered on the sprite
 * this.
 *
 * @author Evan Villemez
 */
Javelin.Components.SpriteAnimator2d = function(entity, game) {
    var self = this;

    this.animations = null;
    this.defaultAnimation = null;
    
    //private
    var sprite = entity.get('sprite2d');
    var animations = {};
    var currentFrame = 0;
    var currentAnimation = null;
    var animating = true;
    var playOnce = true;
    var playOnceCallback = null;
    
    //public api
    this.getCurrentAnimation = function() {
        return currentAnimation;
    };
    
    //TODO: flesh out defining animations a little more, there are other options that
    //should be supported
    this.define = function(name, images) {
        animations[name] = images;
        
        if (!this.defaultAnimation) {
            this.defaultAnimation = name;
        }

        //also, allow a time in ms to be set per animation
        //then update can figure out when to switch frames
    };
    
    this.getCurrentAnimation = function() {
        return currentAnimation;
    };

    //start, if not already playing
    this.play = function(name) {
        animating = true;
        playOnce = false;
        currentFrame = 0;
        currentAnimation = name;
    };
    
    this.playOnce = function(name, callback) {
        animating = true;
        playOnce = true;
        currentAnimation = name;
        playOnceCallback = callback;
    };
    
    //start from beginning
    this.start = function(name) {
        animating = true;
        
    };
    
    //once
    this.startOnce = function(name) {
        animating = true;
        
    };
    
    //stop playing
    this.stop = function() {
        animating = false;
    };
    
    //set default
    this.setDefaultAnimation = function(name) {
        
    };
    
    //if this.animations is defined, automatically load
    //and define the animations
    this.$on('engine.create', function() {
        if (self.animations) {
            var numLoaded = 0;
            var numTotal = 0;
            sprite.visible = false;
            
            for (var name in self.animations) {
                numTotal++;
                if (self.animations[name].atlasPath) {
                    game.loadAsset(self.animations[name].atlasPath, function(atlas) {
                        var imgs = [];
                        for (var index in self.animations[name].frames) {
                            imgs.push(atlas.images[self.animations[name].frames[index]]);
                        }
                        
                        self.define(name, imgs);
                        numLoaded++;
                       
                        if (numLoaded === numTotal) {
                            entity.enable();
                            sprite.visible = true;
                        }
                    });
                } else {
                    game.loadAssets(self.animations[name].frames, function(images) {
                        self.define(name, images);
                        numLoaded++;
                        if (numLoaded === numTotal) {
                            entity.enable();
                            sprite.visible = true;
                        }
                    });
                }
            }
        }
    });
    
    //each frame, figure out which image to draw
    this.$on('engine.update', function(deltaTime) {
        if (sprite.visible && animating) {
            var current = currentAnimation || self.defaultAnimation;
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
                    currentAnimation = self.defaultAnimation;
                    playOnceCallback();
                }
            }
        }
    });
};
