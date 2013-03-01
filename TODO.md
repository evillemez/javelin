# TODO #

* move component creation out of `GameObject` and into `Engine`
    * reorganize tests accordingly
* GO Component IDs should be incrementing integers
* (TEST) implement autoregistration of components/prefabs/scenes if given a starting point
    * change `Javelin.register` to `registerComponent`
* `GameObject.addComponent` should be implemented by calling the engine: `engine.addComponent(go, 'transform2d', true)`
* test go hierarchy stuff
* implement proper plugin initialization upon scene load