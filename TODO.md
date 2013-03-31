# TODO #

The general TODO list for various subsystems and what not.  Testing doesn't get a bullet point - it's assumed as everything under `src/javelin/engine/` needs to be tested as thoroughly as it can be.

**The short list:**

* audio component
* simplify component adding
    * QUESTION: can an object contain two components which have both inherited from the same component?
    * Currently, they cannot - something will get overriden
    * Alternatively, remove the concept of inheritence completely - only rely on the requires mechanism
        * probably will go for this option, dramatically simplifies a lot, and prevents shooting yourself in the foot
* Tiled map loading
* box2d component

## Near-term ##

Things that I'll be working on in the near-term, organized by category.

### General ###

* implement a default *loading* scene, easily overwritten by game config
    * actually treat it like any other scene

### Engine ###

* change pre/post plugin stuff to plugin.$preUpdateStep and plugin.$postUpdateStep
* implement gameObject pooling and component object pooling
* implement bucket array for main game object storage, possibly for component storage
* implement engine-level event dispatching
* implement engine-level config key/val store
* load requiredAssets before calling scene load callback

### Environments ###

* finalize the api, figure out the relationship between the environments, and asset loading

### Game Object ###

* implement layers

### Plugins ###

* implement an `onPrefabInstantiate` & `onPrefabDestroy` - this way plugins can optimize at a nested object level, or an
individual GO level, whichever is more efficient for that particular plugin
* audio plugin
* Box2d plugin

### Input plugin ###

* implement axes for keyboard
* use [*hammer.js*](https://github.com/EightMedia/hammer.js/) for dealing with touch input

### Canvas2d Plugin ###

* implement viewport
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
