'use strict';

/**
 * The AssetLoader returns objects based on string filepaths.  The object is loaded
 * by a function mapped to the file extension.
 */
Javelin.AssetLoader = function(basePath) {
    this.assets = {};
    this.baseAssetPath = basePath;
    
    //generic image loader
    var imageLoader = function(relPath, absPath, register) {
        var img = new Image();
        img.onload = function() {
            register(relPath, img);
        };
        img.url = absPath;
    };
    
    this.loaders = {
        'png': imageLoader,
        'jpg': imageLoader,
        'ogg': function(relPath, absPath, register) { throw new Error("NOT IMPLEMENTED"); },
        'mp3': function(relPath, absPath, register) { throw new Error("NOT IMPLEMENTED"); },
    };
};

Javelin.AssetLoader.prototype.loadAsset = function(path) {
    var cached = this.assets[path] || false;
    if (cached) {
        return cached;
    }
    
    this.getLoaderForPath(path)(path, this.baseAssetPath + path, this.register);
    
    return this.assets[path];
};

Javelin.AssetLoader.prototype.getLoaderForPath = function(path) {
    var ext = path.split('.').pop();

    return this.loaders[ext] || false;
};

Javelin.AssetLoader.prototype.register = function(path, item) {
    this.assets[path] = item;
};
