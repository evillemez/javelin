Fixtures.TestSoundAsset = function(path) {
    this.path = path;
};

Fixtures.SoundLoader = function(loader, relpath, abspath, callback) {
    setTimeout(function() {
        var asset = new Fixtures.TestSoundAsset(relpath);
        loader.register(relpath, asset);
        callback(asset);
    }, 10);
};
