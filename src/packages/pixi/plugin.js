/**
 * The pixi plugin creates a pixi stage per configured layer in the scene.  Prefabs that
 * contain any renderable pixi components are automatically added/removed from
 * the scene during the entity lifecycle.
 *
 * @apidoc package.pixi.plugin.html
 * @type plugin
 */
javelin.plugin('pixi', function(engine) {
  var layers = {
    default: {
      layer: null,
      camera: null
    }
  };

  /**
   * Create pixi stages per configured layer on load.
   */
  this.$onLoad = function() {
    //can only be active if in a browser context
    if (!window) {
      this.$enabled = false;
    }

    //TODO: create stages and cameras

  };

  /**
   * Adds prefab renderable hierarchy to stage/layer when a prefab is created.
   */
  this.$onPrefabCreate = function(prefab) {
    var renderable = prefab.get('pixi.renderable').createDisplayObjectContainer();
    //TODO: add to stage

  };

  /**
   * Removes renderable prefab hierarchy from the layer when destroyed.
   */
  this.$onPrefabDestroy = function(prefab) {
    var renderable = prefab.get('pixi.renderable');
  };
});
