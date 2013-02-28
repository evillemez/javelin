# TODO #

* move component creation out of `GameObject` and into `Engine`
    * reorganize tests accordingly
* (TEST) implement autoregistration of components/prefabs/scenes if given a starting point
    * change `Javelin.register` to `registerComponent`
* implement cascading enable/disable, boolean `enabled`, change `active`
* implement go.setId(), id should cascade to all components
* `GameObject.addComponent` should be implemented by calling the engine: `engine.addComponent(go, 'transform2d', true)`
    * also, `engine.removeComponent(go, 'transform2d')`
* test go hierarchy stuff
* implement Plugins and plugin registry the same way as gameobject components
    * add `Javelin.registerPlugin`
