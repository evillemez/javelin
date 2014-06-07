/**
 * Pixi sprite wrapper component.
 *
 * @apidoc packages.pixi.component.sprite.html
 * @type component
 */
javelin.component('pixi.sprite', ['renderable'], function(entity, engine) {

  //publicly configurable properties
  this.imagePath = null;
  this.atlasPath = null;

  var self = this;
  var renderable = entity.get('pixi.renderable');

  entity.on('entity.create', function() {
    renderable.addAsset(self.imagePath);
    renderable.addAsset(self.atlasPath);

    //create sprite
  });

});
