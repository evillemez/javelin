'use strict';

var chai = require('chai')
    , spies = require('chai-spies')
    , assert = chai.assert
    , expect = chai.expect
    , Javelin = require('../build/javelin.js')
;
chai.use(spies);
chai.Assertion.includeStack = true;

describe("AssetLoader", function() {

    function TestAsset(path) {
        this.path = path;
    }

    function testLoader(loader, relpath, abspath, callback) {
        setTimeout(function() {
            var asset = new TestAsset(relpath);
            loader.register(relpath, asset);
            callback(asset);
        }, 10);
    }

    var createLoader = function() {
        return new Javelin.AssetLoader('/path', {
            '.mp3': testLoader
        });
    };

    function createLoaderSpy(assetLoader) {
        var loader = assetLoader.getLoader('.mp3');
        var spy = chai.spy(loader);
        assetLoader.setLoader('.mp3', spy);
        return spy;
    }

    function asyncAssertions(done, assertions) {
        try {
            assertions();
        } catch (e) {
            done(e);
        }
    }

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
        var spy = createLoaderSpy(l);
        expect(spy).to.not.have.been.called();

        l.loadAsset('foo.mp3', function(asset) {
            asyncAssertions(done, function() {
                expect(spy).to.have.been.called.exactly(1);
                assert.isTrue(asset instanceof TestAsset);
                assert.strictEqual(asset.path, 'foo.mp3');
            });
            done();
        });
    });

    it("should only call a loader on the first request to a specific asset", function(done) {
        var l = createLoader();
        var spy = createLoaderSpy(l);
        expect(spy).to.not.have.been.called();

        l.loadAsset('foo.mp3', function(asset) {
            asyncAssertions(done, function() {
                expect(spy).to.have.been.called.exactly(1);
                assert.isTrue(asset instanceof TestAsset);
                assert.strictEqual(asset.path, 'foo.mp3');
            });

            l.loadAsset('foo.mp3', function(asset) {
                asyncAssertions(done, function() {
                    expect(spy).to.have.been.called.exactly(1);
                    assert.isTrue(asset instanceof TestAsset);
                    assert.strictEqual(asset.path, 'foo.mp3');
                });
                done();
            });
        });
    });

    it.skip("should load multiple assets", function() {
        var l = createLoader();

    });

    it("should call most specific loader first");

    it("should prevent multiple loads of the same asset");

    it("should properly report progress of multiple loads");

});
