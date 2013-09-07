'use strict';

/**
 * The `sprite` component will let you associate an image asset with a entity.  The `image` property can be
 * either an `Image` instance, or an instance of `Javelin.Asset.AtlasImage`.  Images can also specify a scale.
 *
 * @class Javelin.this.Sprite
 * @javelinComponent sprite
 * @author Evan Villemez
 */
javelin.component('sprite2d', function(entity, game) {
    var self = this;

    this.imagePath = null;
    this.atlasPath = null;
    
    //can be Image or Javelin.Asset.AtlasImage
    this.image = null;
    this.visible = true;

    //how much to scale the image in x and y directions
    this.scale = {
        x: 1.0,
        y: 1.0
    };
    
    var debug = false;
    var transform = null;
    
    this.$on('engine.create', function() {
        if (game && game.debug) {
            debug = true;
        }
        
        transform = entity.get('transform2d');
        
        //load image if specified
        if (self.imagePath) {
            entity.disable();
            if (self.atlasPath) {
                game.loadAsset(self.atlasPath, function(atlas) {
                    self.image = atlas.images[self.imagePath];
                    entity.enable();
                });
            } else {
                game.loadAsset(self.imagePath, function(image) {
                    self.image = image;
                    entity.enable();
                });
            }
        }
    });
    
    //actually draw the designated image on the canvas - the image could either be a regular image, or
    //an instance of Javelin.Asset.AtlasImage
    this.$on('canvas2d.draw', function(context, camera) {
        if (self.image) {
            var pos = transform.position;
            var rot = transform.getWorldRotation();
        
            context.save();

            //TODO: take into account camera position and return if sprite is not visible, set visible to false
            //move canvas to draw the image in proper location
            context.translate(
                pos.x,
                pos.y
            );
            
            //convert degrees to radians and rotate the canvas
            context.rotate(rot * Javelin.PI_OVER_180);

            var scale = self.scale;

            if (self.image instanceof Javelin.Asset.AtlasImage) {
                var spr = self.image;

                //draw the image fo' reals
                context.drawImage(
                    spr.image,
                    spr.x,
                    spr.y,
                    spr.width,
                    spr.height,
                    +spr.cx * scale.x,
                    +spr.cy * scale.y,
                    spr.width * scale.x,
                    spr.height * scale.y
                );
            } else {
                var cx, cy;
                
                //TODO: would be good to do this
                //once when it loads - or when set
                //in the sprite component
                cx = self.image.height * 0.5;
                cy = self.image.width * 0.5;
                
                var h = self.image.height * self.scale.y;
                var w = self.image.width * self.scale.x;
                context.drawImage(
                    self.image,
                    -cx * self.scale.x,
                    -cy * self.scale.y,
                    w,
                    h
                );
            }
            
            //draw debug center and bounding boxes
            if (debug) {
                context.strokeStyle = '#F00';

                //draw center of transform
                context.beginPath();
                context.arc(0, 0, 3, 0, 2 * Math.PI, true);
                context.closePath();
                context.stroke();
    
                //draw sprite image bounding box
                if (self.image) {
                    var img = self.image;
                    var topLeftX = 0 - (img.width * 0.5) * scale.x;
                    var topLeftY = 0 - (img.height * 0.5) * scale.y;
                    var height = img.height * scale.x;
                    var width = img.width * scale.y;
            
                    context.strokeRect(topLeftX, topLeftY, width, height);
                }
            }
            
            context.restore();
        }
    });
    
}, ['transform2d']);
