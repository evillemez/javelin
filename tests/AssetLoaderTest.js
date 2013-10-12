'use strict';

var chai = require('chai')
    , spies = require('chai-spies')
    , assert = chai.assert
    , expect = chai.expect
    , Javelin = require('../build/javelin.js')
;
chai.use(spies);
chai.Assertion.includeStack = true;

function TestSoundAsset(path) {
    this.path = path;
}

function TestImageAsset(path) {
    this.path = path;
}

function testSoundLoader(loader, relpath, abspath, callback) {
    setTimeout(function() {
        var asset = new TestSoundAsset(relpath);
        loader.register(relpath, asset);
        callback(asset);
    }, 10);
}

function testImageLoader(loader, relpath, abspath, callback) {
    setTimeout(function() {
        var asset = new TestImageAsset(relpath);
        loader.register(relpath, asset);
        callback(asset);
    }, 10);
}

var createLoader = function() {
    return new Javelin.AssetLoader('/path', {
        '.mp3': testSoundLoader,
        '.png': testImageLoader
    });
};

function createLoaderSpy(format, assetLoader) {
    var loader = assetLoader.getLoader(format);
    var spy = chai.spy(loader);
    assetLoader.setLoader(format, spy);
    return spy;
}

function tryAssertions(done, assertions) {
    try {
        assertions();
    } catch (e) {
        done(e);
    }
}

describe("AssetLoader", function() {

    it("should instantiate properly", function() {
        var l = new Javelin.AssetLoader('/path', {});
        assert.isTrue(l instanceof Javelin.AssetLoader);
    });

    it("should allow setting/retrieving loaders", function() {
        var l = createLoader();

        assert.isFunction(l.getLoader('.mp3'));
        assert.isFalse(l.getLoader('.mp4'));

        l.setLoader('.mp4', function() { return 'bar'; });
        assert.isFunction(l.getLoader('.mp4'));
    });

    it("should fail loading unknown file types", function() {
        var l = createLoader();
        assert.throws(function() {
            l.loadAsset('foo.mp4', function() {});
        }, /loader for path/);
    });

    it("should load an asset", function(done) {
        var l = createLoader();
        var spy = createLoaderSpy('.mp3', l);
        expect(spy).to.not.have.been.called();

        l.loadAsset('foo.mp3', function(asset) {
            tryAssertions(done, function() {
                expect(spy).to.have.been.called.exactly(1);
                assert.isTrue(asset instanceof TestSoundAsset);
                assert.strictEqual(asset.path, 'foo.mp3');
            });
            done();
        });
    });

    it("should only call a loader on the first request to a specific asset", function(done) {
        var l = createLoader();
        var spy = createLoaderSpy('.mp3', l);
        expect(spy).to.not.have.been.called();

        var called = 0;

        //load once
        l.loadAsset('foo.mp3', function(asset) {
            tryAssertions(done, function() {
                called++;
                expect(spy).to.have.been.called.exactly(1);
                assert.isTrue(asset instanceof TestSoundAsset);
                assert.strictEqual(asset.path, 'foo.mp3');

                if (called >= 2) {
                    done();
                }
            });
        });

        //immediately load same path again
        l.loadAsset('foo.mp3', function(asset) {
            tryAssertions(done, function() {
                called++;
                expect(spy).to.have.been.called.exactly(1);
                assert.isTrue(asset instanceof TestSoundAsset);
                assert.strictEqual(asset.path, 'foo.mp3');

                if (called >= 2) {
                    done();
                }
            });
        });
    });

    it("should load multiple assets", function(done) {
        var l = createLoader();
        var soundSpy = createLoaderSpy('.mp3', l);
        var imageSpy = createLoaderSpy('.png', l);
        expect(soundSpy).to.not.have.been.called();
        expect(imageSpy).to.not.have.been.called();

        l.loadAssets(['foo.mp3', 'foo.png'], function(assets) {
            var a = assets;
            tryAssertions(done, function() {
                assert.isArray(a);
                assert.isTrue(assets[0] instanceof TestSoundAsset);
                assert.isTrue(assets[1] instanceof TestImageAsset);
                expect(soundSpy).to.have.been.called.exactly(1);
                expect(imageSpy).to.have.been.called.exactly(1);
                done();
            });
        });
    });

    it("should call most specific loader first", function(done) {
        var l = createLoader();
        l.setLoader('.atlas.mp3', testImageLoader);
        l.setLoader('.tx', testImageLoader);
        var soundSpy = createLoaderSpy('.mp3', l);
        var atlasSpy = createLoaderSpy('.atlas.mp3', l);
        expect(soundSpy).to.not.have.been.called();
        expect(atlasSpy).to.not.have.been.called();

        l.loadAsset('foo.atlas.mp3', function(asset) {
            tryAssertions(done, function() {
                expect(soundSpy).to.not.have.been.called();
                expect(atlasSpy).to.have.been.called.exactly(1);
                assert.isTrue(asset instanceof TestImageAsset);
                done();
            });
        });
    });

    it("should throw exception in getAsset() if not loaded", function() {
        var l = createLoader();
        assert.throws(function() {
            var asset = l.getAsset('foo.mp3');
        }, /has not been loaded/);
    });

    it("should return an asset from getAsset()", function(done) {
        var l = createLoader();
        l.loadAsset('foo.mp3', function(asset) {
            tryAssertions(done, function() {
                assert.isTrue(asset instanceof TestSoundAsset);
                var a = l.getAsset('foo.mp3');
                assert.deepEqual(a, asset);
                done();
            });
        });
    });

    it("should properly report progress of multiple loads", function(done) {
        var l = createLoader();
        var spyCalls = [];
        var progressSpy = chai.spy(function(total, current) {
            spyCalls.push([total, current]);
        });
        var expectedProgressCalls = [
            [3,1],
            [3,2],
            [3,3]
        ];
        var assetsToLoad = [
            'foo.mp3',
            'bar.mp3',
            'foo.png'
        ];

        l.loadAssets(assetsToLoad, function(assets) {
            tryAssertions(done, function() {
                assert.strictEqual(assets.length, 3);
                assert.isTrue(assets[0] instanceof TestSoundAsset);
                assert.isTrue(assets[1] instanceof TestSoundAsset);
                assert.isTrue(assets[2] instanceof TestImageAsset);
                expect(progressSpy).to.have.been.called.exactly(3);
                assert.deepEqual(spyCalls, expectedProgressCalls);
                done();
            });
        }, progressSpy);
    });
});
