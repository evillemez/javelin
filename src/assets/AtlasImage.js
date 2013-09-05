'use strict';

/**
 * This class represents a specific image in a sprite sheet exported from TexturePacker.  This is used internally
 * in the TexturePackerAtlas class.  The values here assume that the data was exported by TexturePacker in
 * the "json(hash)" format
 */

javelin.loader('.atlas.json', ['browser', 'server'], function(loader, relPath, absPath, callback) {
    var json, img, imgPath;
    var rp = relPath;
    imgPath = rp.substring(0, rp.lastIndexOf("/"));

    var createAtlas = function() {
        var atlas = new Javelin.Asset.TexturePackerAtlas(json, img);
        loader.register(relPath, atlas);
        callback(atlas);
    };

    var loadJsonCallback = function(item) {
        json = item;            
        var imagePath = imgPath + "/" + json.meta.image;
        loader.loadAsset(imagePath, loadImageCallback);
    };
            
    var loadImageCallback = function(item) {
        img = item;
        createAtlas();
    };

    //start by loading the json, will trigger series of callbacks
    loader.loadAssetAsType(relPath, 'json', loadJsonCallback);
});


Javelin.Asset.AtlasImage = function(data, image) {
    this.image = image;
    this.x = data.frame.x;
    this.y = data.frame.y;
    this.height = data.frame.h;
    this.width = data.frame.w;

    if (data.trimmed) {
        this.cx = data.spriteSourceSize.x - data.sourceSize.w * 0.5;
        this.cy = data.spriteSourceSize.y - data.sourceSize.h * 0.5;
    } else {
        this.cx = -this.width * 0.5;
        this.cy = -this.height * 0.5;
    }
};

Javelin.Asset.TexturePackerAtlas = function(json, image) {
    this.image = image;
    this.imageMeta = json.meta;
    this.images = {};
    
    var c = 0;
    for (var name in json.frames) {
        var img = new Javelin.Asset.AtlasImage(json.frames[name], this.image);
        this.images[name] = img;
        c++;
    }
    
    this.count = c;
};
