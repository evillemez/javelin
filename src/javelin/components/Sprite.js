'use strict';

Javelin.Component.Sprite = function(gameObject, component) {
    
    //set by plugin (probably)    
    component.visible = false;

    //can be Image or Javelin.Asset.AtlasImage
    component.image = null;

    //plugin could theoretically have multiple canvases, we could treat those as 'layers'
    component.layer = 'default';
    
    component.scale = {
        x: 1.0,
        y: 1.0
    };
    
    //TODO: figure out what else can be done with a simple image and canvas
};
Javelin.Component.Sprite.alias = "sprite";
Javelin.Component.Sprite.requires = ['transform2d'];
