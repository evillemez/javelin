'use strict';

/**
 * The AssetLoader returns objects based on string filepaths.  The object is loaded
 * by a function mapped to the file extension.
 */
Javelin.AssetLoader = function(basePath, loaders) {
    this.assets = {};
    this.baseAssetPath = basePath || '';
    this.loaders = loaders || {};
    this.sortedLoaderExtensions = [];
    this.sortLoaders();
};

Javelin.AssetLoader.prototype.sortLoaders = function() {
    this.sortedLoaderExtensions = [];
    for (var extension in this.loaders) {
        this.sortedLoaderExtensions.push(extension);
    }
    this.sortedLoaderExtensions.sort(function(a, b) {
        return b.length - a.length;
    });
};

Javelin.AssetLoader.prototype.getLoader = function(extension) {
    return this.loaders[extension] || false;
};

Javelin.AssetLoader.prototype.setLoader = function(extension, loader) {
    this.loaders[extension] = loader;
    this.sortLoaders();
};

/**
 * Load an individual asset by path.  Your call back will be called with the loaded
 * object once completed.
 * 
 * @param {string} path Relative path to asset
 * @param {function} callback Callback function to call with the requested asset object
 */
Javelin.AssetLoader.prototype.loadAsset = function(path, callback) {
    var cached = this.assets[path] || false;
    if (cached) {
        callback(cached);
        return;
    }
    
    this.getLoaderForPath(path)(this, path, this.baseAssetPath + path, callback);
};

/**
 * Load an asset as if it were an explicitly defined type.  This means it won't
 * dynamically choose how to load the asset based on the filename.
 *
 * @param {String} path Relative path to asset
 * @param {String} type Type to use for loader, generally a file extension
 * @param {Function} callback Callback to call once loading is complete
 */
Javelin.AssetLoader.prototype.loadAssetAsType = function(path, type, callback) {
    if(!this.loaders[type]) {
        throw new Error("Unknown asset loader type.");
    }
    
    this.loaders[type](this, path, this.baseAssetPath + path, callback);
};

/**
 * Load an array of assets by path.  The given callback will be called with the array
 * of loaded assets in the same order as the requested paths.
 * 
 * @param {array} arr Array of string paths (relative)
 * @param {function} doneCallback Callback function to call with the array of loaded assets
 * @param {function} progressCallback Callback function to call every time an asset is loaded.  This can be used to track loading progress.
 */
Javelin.AssetLoader.prototype.loadAssets = function(arr, doneCallback, progressCallback) {
    var assets = this.assets;
    var expected = arr.length;
    var loaded = 0;
    progressCallback = progressCallback || Javelin.noop;
    doneCallback = doneCallback || Javelin.noop;
    
    //register function keeps loaded assets in the order
    //they were requested
    var register = function(relPath, obj) {
        loaded++;
        assets[arr.indexOf(relPath)] = obj;
        progressCallback(expected, loaded);
        
        //if everything has loaded, call the user's callback
        if (loaded === expected) {
            var sorted = [];
            for (var i in arr) {
                sorted.push(assets[arr[i]]);
            }
            
            doneCallback(sorted);
            return;
        }
    };
    
    //load individual asset, calling custom register function when done
    for (var i in arr) {

        //warning: yes, I'm creating a function in a loop, and jshint tells
        //me it's bad, feel free to refactor :)
        this.loadAsset(arr[i], function(obj) {
            register(arr[i], obj);
        });
    }
};

/**
 * Explicitly register an object to an asset path.  Any requests for an asset at that path
 * will return the registered object.
 * 
 * @param {string} path The path to register
 * @param {Object} obj The object to register
 */
Javelin.AssetLoader.prototype.register = function(relPath, obj) {
    this.assets[relPath] = obj;
};

/**
 * Unload an asset from memory, any subsequent request will have to reload it.
 * 
 * @param {String} relPath Path of the asset to unload
 */
Javelin.AssetLoader.prototype.unload = function(relPath) {
    this.assets[relPath] = null;
};

/**
 * Will return the function used for loading an asset of the given type, based on file extension.
 * 
 * @param {String} path Path to asset file
 * @returns The function that should be called to load the file of the given type
 * @type Function
 */
Javelin.AssetLoader.prototype.getLoaderForPath = function(path) {
    var exts = this.sortedLoaderExtensions;
    var l = exts.length;
    for (var i=0; i < l; i++) {
        if (path.substring(path.length - exts[i].length) === exts[i]) {
            return this.loaders[exts[i]];
        }
    }

    throw new Error("No applicable loader for path [" + path + "] found!");
};
