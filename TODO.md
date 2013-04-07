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
    * actually treat it like any other scene (internally instantiate an engine and load the loading scene)
    * internally instantiate engine, load assets

### Engine ###

* change GO creation logic to instantiate entire object chain first before adding/notifying plugins of new gameobjects
* load requiredAssets before calling scene load callback
* implement `flush` in engine and `$onFlush` in plugins to force GC and do any cleanup necessary
* implement gameObject pooling and component object pooling
* implement bucket array for main game object storage, possibly for component storage
* implement engine-level config key/val store

### Environments ###

* finalize the api, figure out the relationship between the environments, and asset loading

### Game Object ###

* implement reset for eventual pooling

### Plugins ###

* implement an `onPrefabInstantiate` & `onPrefabDestroy` - this way plugins can optimize at a nested object level, or an
individual GO level, whichever is more efficient for that particular plugin
* Box2d plugin

### Input plugin ###

* implement axes for keyboard
* implement gamepad input handler
* use [*hammer.js*](https://github.com/EightMedia/hammer.js/) for dealing with touch input

### Canvas2d Plugin ###

* implement camera in sprite component

### Audio plugin ###

* in playLoop/Once methods, return handle to audio file
* implement proper spatial audio
* implement easy API for defining filters

### Assets ###

* TiledMap asset

### Components ###

* TiledMapEnvironment ?

## Long-term features ##

* more plugins to support different types of games:
    * network plugin for syncing clients for multiplayer
    * three.js for 3d rendering
    * cannon.js for 3d physics sim
