/*global PIXI: true */

/**
 * Pixi sprite wrapper component.
 *
 * @apidoc packages.pixi.component.sprite.html
 * @type component
 */
javelin.component('pixi.sprite', ['pixi.renderable'], function(entity, engine) {

    //publicly configurable properties
    this.imagePath = null;
    this.atlasPath = null;

    var self = this;
    var renderable = entity.get('pixi.renderable');

    if (this.imagePath) {
        renderable.assetPaths.push(this.imagePath);
    }
    if (this.atlasPath) {
        renderable.assetPaths.push(this.atlasPath);
    }

//    renderable.onLoad(function(assets) {
//      
//    });
  
    entity.on('entity.create', function() {
        var sprite = null;

        //create sprite
        if (self.atlasPath) {
            //TODO: create image from texture packer atlas
        } else if (self.imagePath) {
          if (!renderable.assets[self.imagePath]) {
            
          }
          
          sprite = new PIXI.Sprite(new PIXI.Texture(renderable.assets[self.imagePath]));
        }

        renderable.setDisplayObject(sprite);
    });

}); 
