# TODO #

The general TODO list for various subsystems and what not.  Testing doesn't get a bullet point - it's assumed as everything under `src/javelin/engine/` needs to be tested as thoroughly as it can be.

**The short list:**

* simplify component adding
    * QUESTION: can an object contain two components which have both inherited from the same component?
    * Currently, they cannot - something will get overriden
    * Alternatively, remove the concept of inheritence completely - only rely on the requires mechanism
* Tiled map loading
* player input component
* box2d component

## Near-term ##

Things that I'll be working on in the near-term, organized by category.

### General ###

* implement a default *loading* scene, easily overwritten by game config
    * actually treat it like any other scene

### Engine ###

* implement pre/post update plugin loops - a plugin should specify where it belongs
* implement engine-level event dispatching
* load requiredAssets before calling scene load callback

### Environments ###

* finalize the api, figure out the relationship between the environments, and asset loading

### Game Object ###

* implement tag system
* implement layers

### Plugins ###

* implement an `onPrefabInstantiate` & `onPrefabDestroy` - this way plugins can optimize at a nested object level, or an
individual GO level, whichever is more efficient for that particular plugin
* Player input plugin
* Box2d plugin

### Canvas2d Plugin ###

* implement layers for multiple canvases

### Assets ###

* TiledMap asset

### Components ###

* TiledMapEnvironment ?

## Long-term features ##

* more plugins to support different types of games:
    * network plugin for syncing clients for multiplayer
    * three.js for 3d rendering
    * cannon.js for 3d physics sim
