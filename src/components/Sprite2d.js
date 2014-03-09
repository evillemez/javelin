/**
 * The `sprite` component will let you associate an image asset with a entity.  The `image` property can be
 * either an `Image` instance, or an instance of `Javelin.Asset.AtlasImage`.  Images can also specify a scale.
 *
 * @class Javelin.Sprite2d
 * @javelinComponent sprite2d
 * @author Evan Villemez
 */
Javelin.Components.Sprite2d = function(entity, game) {
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
        //TODO: change to "getAsset", fall back to asyncronous load
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
    this.$on('renderer2d.draw', function(layer, camera) {
        if (self.image) {
            var pos = {
                x: transform.getAbsoluteX(),
                y: transform.getAbsoluteY()
            };
            
            //cull if not visible
            if (!camera.canSeePoint(pos.x, pos.y)) {
                return;
            }

            var rot = transform.getAbsoluteRotation();

            if (self.image instanceof Javelin.AtlasImage) {
                layer.drawAtlasImage(
                    self.image,
                    self.imagePath,
                    pos.x,
                    pos.y,
                    rot,
                    self.scale.x,
                    self.scale.y
                );
            } else {
                layer.drawImage(
                    self.image,
                    pos.x,
                    pos.y,
                    rot,
                    self.scale.x,
                    self.scale.y
                );
            }

            /*
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
            */
        }
    });
    
};
