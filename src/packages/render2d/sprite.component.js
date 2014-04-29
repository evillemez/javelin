/**
 * The `sprite2d` component will let you associate an image asset with a entity.  This
 * allows easy drawing of images to 2d layers.  Other components use the `sprite2d`
 * component to do more interesting things, like add animations.
 *
 * @package renderer2d
 * @type component
 */
javelin.component('sprite2d', ['transform2d'], function(entity, game) {
    var self = this;

    /**
     * Asset path to image.  When created, if the asset has not already
     * loaded, it will be lazily loaded.
     * 
     * @type {string} Relative asset path.
     */
    this.imagePath = null;

    /**
     * Asset path to sprite atlas.  When created, if the asset has not
     * already loaded, it will be lazily loaded.
     * 
     * @type {string} Relative asset path.
     */
    this.atlasPath = null;
    
    /**
     * The actual image instance that will be drawn.  This can
     * be either an instance of [Image](), or an instance of
     * `Javelin.AtlasImage`.
     * 
     * @type {object}
     */
    this.image = null;

    /**
     * How much to scale the images drawn by this component.
     * 
     * @type {Object} Object containing separate x/y scale values.
     */
    this.scale = {
        x: 1.0,
        y: 1.0
    };

    /**
     * Change the orientation of images drawn by this sprite component.  For
     * example, if an image was exported facing the "wrong" way, you can use
     * this value to correct the rotation.
     * 
     * @type {float} Degrees to rotate the sprite.
     */
    this.orientation = 0.0;
    
    var transform = null;
    
    /**
     * On create, if assets are specified, but not loaded, they will
     * be loaded, and the entity will be enabled after the assets have
     * loaded.
     */
    this.$on('engine.create', function() {
        transform = entity.get('transform2d');
        var atlas = false;
        
        //get references to images, and load if not
        //yet loaded
        if (self.atlasPath) {
            atlas = game.getAsset(self.atlasPath);
            if (!atlas) {
                entity.disable();
                game.loadAsset(self.atlasPath, function(atlas) {
                    self.image = atlas.images[self.imagePath];
                    entity.enable();
                });
            }
        } else if (self.imagePath) {
            self.image = game.getAsset(self.imagePath);
            if (!self.image) {
                entity.disable();
                game.loadAsset(self.imagePath, function(image) {
                    self.image = image;
                    entity.enable();
                });
            }
        }
    });
    
    /**
     * When the renderer is ready to draw, if this sprite has a reference
     * to an image, it draws the image on the layer.
     * 
     * @param  {Javelin.Layer2dCanvas} layer  The layer to draw on.
     * @param  {Javelin.Layer2dCamera} camera The camera assigned to the layer.
     */
    this.$on('renderer2d.draw', function(layer, camera) {
        if (self.image) {
            var pos = {
                x: transform.getAbsoluteX(),
                y: transform.getAbsoluteY()
            };
            
            //cull if not visible - temporary implementation,
            //should at least check image bounds, not point
            if (!camera.canSeePoint(pos.x, pos.y)) {
                return;
            }

            var rot = transform.getAbsoluteRotation();

            if (self.image instanceof Javelin.AtlasImage) {
                layer.drawAtlasImage(
                    self.image,
                    pos.x,
                    pos.y,
                    rot + self.orientation,
                    self.scale.x,
                    self.scale.y
                );
            } else {
                layer.drawImage(
                    self.image,
                    pos.x,
                    pos.y,
                    rot + self.orientation,
                    self.scale.x,
                    self.scale.y
                );
            }
        }
    });    
});
