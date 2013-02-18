'use strict';

Javelin.Component.Sprite = function(go, comp) {
    
    comp.visible = false;     //set by plugin (probably)

    //can be Image or Javelin.Asset.AtlasImage
    comp.image = null;

    //plugin could theoretically have multiple canvases, we could treat those as 'layers'
    comp.layer = 'default';
    
    comp.scale = {
        x: 1.0,
        y: 1.0
    };
    
    //TODO: figure out what else can be done with a simple image and canvas
};
Javelin.Component.Sprite.alias = "sprite";
Javelin.Component.Sprite.requires = ['transform2d'];
Javelin.register(Javelin.Component.Sprite);
