# Javelin.js #

Javelin is a component-based game engine that can be deployed in the browser, and on the server with [node.js](http://nodejs.org/).

When major refactoring is done, there will be more decent documentation here.

## TODO ##

Required assets:

```
prefab.requireAssets = [
	'path/to/asset.extension'
	'path/to/asset.extension'
	'path/to/asset.extension'
];

scene.requirePrefabAssets = [
	'game.prefab1',
	'game.prefab2'
]

engine.loadScene('example', engine.run, function(total, current) {
	//loading callback stuff
});
```

* on `javelin.createGame`, engine should check for gameConfig.requiredAssets, and load...
* on `engine.loadScene`, engine should check for `scene.requiredAssets`, and `scene.requiredPrefabAssets`
  * in the case of `scene.requiredPrefabAssets`, check prefabs for `prefab.requiredAssets`, and load all

Each step should allow setting an asset loader callback for progress tracking.
