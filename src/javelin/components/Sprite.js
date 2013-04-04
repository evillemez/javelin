'use strict';

/**
 * The `sprite` component will let you associate an image asset with a gameObject.  The `image` property can be
 * either an `Image` instance, or an instance of `Javelin.Asset.AtlasImage`.  Images can also specify a scale.
 *
 * @class Javelin.Component.Sprite
 * @javelinComponent sprite
 * @author Evan Villemez
 */
Javelin.Component.Sprite = function(gameObject, component) {
    
    //set by plugin (probably)
    component.visible = false;

    //can be Image or Javelin.Asset.AtlasImage
    component.image = null;

    //how much to scale the image in x and y directions
    component.scale = {
        x: 1.0,
        y: 1.0
    };
    
    //DEBUG: draw sprite center and bounding boxes
    if (gameObject.engine && gameObject.engine.debug) {
        var transform = gameObject.getComponent('transform2d');

        component.$on('canvas2d.draw', function(context) {
            var pos = transform.position;
            var rot = transform.rotation;
            
            //adjust canvas properly
            context.save();
            context.translate(pos.x, pos.y);
            context.rotate(rot * Javelin.PI_OVER_180);
            context.strokeStyle = '#F00';

            //draw center of transform
            context.beginPath();
            context.arc(0, 0, 3, 0, 2 * Math.PI, true);
            context.closePath();
            context.stroke();
        
            //draw sprite image bounding box
            if (component.image) {
                var img = component.image;
                var atlased = (img instanceof Javelin.Asset.AtlasImage);
                var topLeftX = 0 - (img.width * 0.5);
                var topLeftY = 0 - (img.height * 0.5);
                var height = img.height;
                var width = img.width;
                
                context.strokeRect(topLeftX, topLeftY, width, height);
            }
            
            context.restore();
        });
    }
    
};
Javelin.Component.Sprite.alias = "sprite";
Javelin.Component.Sprite.requires = ['transform2d'];
