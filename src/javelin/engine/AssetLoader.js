'use strict';

/**
 * The AssetLoader returns objects based on string filepaths.  The object is loaded
 * by a function mapped to the file extension.
 */
Javelin.AssetLoader = function(basePath) {
    this.assets = {};
    this.baseAssetPath = basePath;
    
    //generic image loader
    var imageLoader = function(relPath, absPath, assets, callback) {
        var img = new Image();
        img.onabort =
        img.onerror =
        img.onload = function() {
            assets[relPath] = img;
            callback(img);
        };
        img.src = absPath;
    };
    
    //image atlas loader
    var imageAtlasLoader = function(relPath, absPath, assets, callback) {
        throw new Error("NOT IMPLEMENTED");
    };
    
    //generic json file loader
    var jsonLoader = function(relPath, absPath, assets, callback) {
        throw new Error("NOT IMPLEMENTED");
    };
    
    //generic file loader
    var soundLoader = function(relPath, absPath, assets, callback) {
        throw new Error("NOT IMPLEMENTED");
    };
    
    //map loader functions to types
    this.loaders = {
        'png': imageLoader,
        'jpg': imageLoader,
        'atlas.json': imageAtlasLoader,
        'json': jsonLoader,
        'ogg': soundLoader,
        'mp3': soundLoader
    };
};

/**
 * Load an individual asset by path.  Your call back will be called with the loaded
 * object once completed.
 * @param {string} path Relative path to asset
 * @param {function} callback Callback function to call with the requested asset object
 */
Javelin.AssetLoader.prototype.loadAsset = function(path, callback) {
    var cached = this.assets[path] || false;
    if (cached) {
        callback(cached);
    }
    
    this.getLoaderForPath(path)(path, this.baseAssetPath + path, this.assets, callback);
};

/**
 * Load an array of assets by path.  The given callback will be called with the array
 * of loaded assets in the same order as the requested paths.
 * @param {array} arr Array of string paths (relative)
 * @param {function} callback Callback function to call with the array of loaded assets
 */
Javelin.AssetLoader.prototype.loadAssets = function(arr, callback) {
    var assets = this.assets;
    var expected = arr.length;
    var loaded = 0;
    
    //register function keeps loaded assets in the order
    //they were requested
    var register = function(relPath, obj) {
        loaded++;
        assets[arr.indexOf(relPath)] = obj;
        
        //if everything has loaded, call the user's callback
        if (loaded === expected && callback) {
            var sorted = [];
            for (var i in arr) {
                sorted.push(assets[arr[i]]);
            }
            
            callback(sorted);
        }
    };
    
    //load individual asset, calling custom register function when done
    for (var i in arr) {

        //warning: yes, I'm creating a function in a loop, and it's probably bad,
        //feel free to refactor :)
        this.loadAsset(arr[i], function(obj) {
            register(arr[i], obj);
        });
    }
};

/**
 * Explicitly register an object to an asset path.  Any requests for an asset at that path
 * will return the registered object.
 * @param {string} path The path to register
 * @param {Object} obj The object to register
 */
Javelin.AssetLoader.prototype.register = function(relPath, obj) {
    this.assets[relPath] = obj;
};

Javelin.AssetLoader.prototype.getLoaderForPath = function(path) {
    //TODO: this doesn't really work the way it should, it only
    //counts the last extension: it would be nice to be able to use
    //special loaders for compound extensions like `images.atlas.json`
    for (var key in this.loaders) {
        if (path.substring(path.length - key.length) === key) {
            return this.loaders[key];
        }
    }

    throw new Error("No applicable loader for path [" + path + "] found!");
};

