/**
  * This component provides a more accessible api for loading required assets.
 */
javelin.component('common.loader', [], function(entity, game) {
    var requiredAssets = [];
    var assetInstances = {};
    var self = this;

    var loading = false;

    this.isLoading = function() {
      return loading;
    };

    this.requireAsset = function(path) {
        requiredAssets.push(path);
    };

    this.requireAssets = function(paths) {
        for (var i = 0; i < paths.length; i++) {
            requiredAssets.push(paths[i]);
        }
    };

    entity.on('entity.create', function() {
        entity.dispatch('assets.load', [self]);

        if (!requiredAssets.length) {
            return;
        }

        loading = true;
        game.loadAssets(requiredAssets, function(assets) {
            loading = false;
            assetInstances = assets;
            entity.dispatch('assets.loaded');
        });
    });
});
