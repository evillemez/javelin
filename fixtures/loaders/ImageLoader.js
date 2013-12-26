Fixtures.TestImageAsset = function(path) {
    this.path = path;
};

Fixtures.ImageLoader = function(loader, relpath, abspath, callback) {
    setTimeout(function() {
        var asset = new Fixtures.TestImageAsset(relpath);
        loader.register(relpath, asset);
        callback(asset);
    }, 10);
};
