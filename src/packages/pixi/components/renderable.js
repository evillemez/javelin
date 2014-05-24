/**
 * A base component for any renderable object.  Provides some basic asset loading
 * shortcuts and the base API required by the plugin to manage renderable objects.
 *
 * Any renderable should assume it is wrapping an instance of a `PIXI.DisplayObjectContainer`
 *
 * @type component
 * @apidoc packages.pixi.components.renderable.html
 */
javelin.component('pixi.renderable', ['transform2d'], function(entity, engine) {
  //publicly configurable
  this.assetPaths = [];
  this.assets = [];

  //private references
  var self = this;
  var renderable = null;

  /**
   * Set a pixi renderable.  This would be any object that gets added to a pixi "stage".
   */
  this.setRenderable = function(obj) {
    renderable = obj;
  };

  /**
   * Get the pixi renderable object.
   */
  this.getRenderable = function() {
    return renderable;
  };

  this.createDisplayObjectContainer = function() {
    //TODO: get stuff in hierarchy and `addChild`, and come up with better name
  };

  /**
   * Load any unloaded assets when the entity is instantiated
   */
  this.$on('engine.create', function() {

    //load assets
    if (this.assets.length) {
      this.disable();

      engine.loadAssets(this.assets, function(loaded) {
        self.assets = loaded;
        this.enable();
      });
    }

  });

});
