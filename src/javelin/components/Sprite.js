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
    
    var debug = false;
    var transform = null;
    
    component.$on('engine.create', function() {
        if (gameObject.engine && gameObject.engine.debug) {
            debug = true;
        }
        
        transform = gameObject.getComponent('transform2d');
    });
    
    component.$on('canvas2d.draw', function(context) {
        //TODO: take into account viewport x/y
        var pos = transform.position;
        var rot = transform.getWorldRotation;
        
        //if VISIBLE (check view rect)
        if (true && component.image) {
            context.save();
            var scale = component.scale;

            if (component.image instanceof Javelin.Asset.AtlasImage) {
                var spr = component.image;
                
                //move canvas to draw the image in proper location
                context.translate(
                    pos.x,
                    pos.y
                );
                
                //convert degrees to radians
                context.rotate(rot * Javelin.PI_OVER_180);
                
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
                cx = component.image.height * 0.5;
                cy = component.image.width * 0.5;
                
                context.translate(pos.x, pos.y);
                
                //convert degrees to radians
                context.rotate(rot * Math.PI/180);

                var h = component.image.height * component.scale.y;
                var w = component.image.width * component.scale.x;
                context.drawImage(
                    component.image,
                    -cx * component.scale.x,
                    -cy * component.scale.y,
                    w,
                    h
                );
            }
            
            context.restore();
        }
        
        //draw bounding boxes around sprite if we're in debug
        if (debug) {
        
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
        }
    });
    
};
Javelin.Component.Sprite.alias = "sprite";
Javelin.Component.Sprite.requires = ['transform2d'];
