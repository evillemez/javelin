'use strict';

Javelin.Component.Sprite = function(gameObject, component) {
    
    //set by plugin (probably)    
    component.visible = false;

    //can be Image or Javelin.Asset.AtlasImage
    component.image = null;

    //plugin could theoretically have multiple canvases, we could treat those as 'layers'
    component.layer = 'default';
    
    //how much to scale the image in x and y directions
    component.scale = {
        x: 1.0,
        y: 1.0
    };
    
    //TODO: figure out what else can be done with a simple image and canvas
    
    //DEBUG: draw a point exactly at the transform location for debugging
    if (gameObject.engine && gameObject.engine.debug) {
        var transform = gameObject.getComponent('transform2d');
        component.$on('canvas2d.draw', function(context) {

            //draw center of transform
            context.beginPath();
            context.arc(transform.position.x, transform.position.y, 5, 0, 2 * Math.PI, true);
            context.fill();
        
            //draw image bounding box
            if (component.image) {
                //TODO
            }
        });
    }
    
};
Javelin.Component.Sprite.alias = "sprite";
Javelin.Component.Sprite.requires = ['transform2d'];
