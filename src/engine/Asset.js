'use strict';

//TODO: an asset is anything in separate file, really...
//could be an image, sound file, json structure...

//assets are loaded by environments, which can translate the relative paths
//to something useful

//for example a "required" asset may be downloaded from the server before the game can start
//and stored locally for quick retrieval - where-as "unrequired" assets may just be streamed
//from the server as needed

Javelin.Asset = function(path) {
    this.path = path;
    
    this.loaded = false;
    //this.type = base on file extension
};
