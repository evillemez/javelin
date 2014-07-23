/*global PIXI: true */

/**
 * Pixi sprite wrapper component.
 *
 * @apidoc packages.pixi.component.sprite.html
 * @type component
 */
javelin.component('pixi.sprite', ['pixi.renderable', 'common.loader'], function(entity, engine) {

    //publicly configurable properties
    this.imagePath = null;
    this.atlasPath = null;

    var self = this;
    var renderable = entity.get('pixi.renderable');
    var loader = entity.get('common.loader');

    //define sprite
    var baseTexture = new PIXI.BaseTexture();
    var sprite = new PIXI.Sprite(new PIXI.Texture(baseTexture));

     entity.on('assets.load', function(loader) {
         //register assets to load
         if (self.atlasPath) {
             loader.requireAsset(self.atlasPath);
         } else if (self.imagePath) {
             loader.requireAsset(self.imagePath);
         }
     });

     //set sprite texture and show it once loaded
     entity.on('assets.loaded', function(assets) {
         if (self.atlasPath) {
             //TODO: create texture from atlas
         } else if (self.imagePath) {
             baseTexture.source = assets[self.imagePath];
             baseTexture.hasLoaded = true;
             console.log('setting base texture image', assets[self.imagePath]);
         }

         sprite.visible = true;
     });

    entity.on('entity.create', function() {
        //var sprite = new PIXI.Sprite(new PIXI.Texture.fromImage(self.imagePath));
        //sprite.visible = false;
        console.log('setting sprite display object');
        renderable.setDisplayObject(sprite);
    });
});
