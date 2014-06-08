javelin.loader(['.png','.jpg','.jpeg','.gif'], ['browser'], function(loader, relPath, absPath, done) {
    var img = new Image();
    img.onabort =
    img.onerror =
    img.onload = function() {
        loader.register(relPath, new PIXI.BaseTexture(img));
        done(img);
    };
    img.src = absPath;
});
