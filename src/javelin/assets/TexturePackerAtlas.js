'use strict';

Javelin.Asset.TexturePackerAtlas = function(json, image) {
    this.image = image;
    this.imageMeta = json.meta;
    this.images = {};
    
    var c = 0;
    for (var name in json.frames) {
        var img = new Javelin.Asset.AtlasImage(json.frames[name], this.imageMeta);
        img.image = this.image;
        this.images[name] = img;
        c++;
    }
    
    this.count = c;
};
