/**
  * This component provides a more accessible api for loading required assets.
 */
javelin.component('common.loader', [], function(entity, engine) {
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
        engine.loadAssets(requiredAssets, function(assets) {
            loading = false;
            
            //build map of loaded assets
            for(var i = 0; i < requiredAssets.length; i++) {
                assetInstances[requiredAssets[i]] = assets[i];
            }
                        
            entity.dispatch('assets.loaded', [assetInstances]);
        });
    });
});
