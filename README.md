# Javelin.js #

Javelin is a component-based game engine that can be deployed in the browser, and on the server with [node.js](http://nodejs.org/).

As it is component-based, other libraries can be substituted for the ones provide with the default implementation.  Currently,
the project provides engine components and plugins for creating single player 2d games.  However, it will be expanded over time to provide plugins for writing multiplayer games, and 3D games using [*Three.js*](http://mrdoob.github.com/three.js/) and [*Cannon.js*](http://schteppe.github.com/cannon.js/).

> Note: this is very much a work in progress, though the core is generally stable.   The internal documentation is currently lacking, that will be fixed.  There will be a demo project to demonstrate most functionality, also a work-in-progress.

## Examples ##

> This section is not particularly detailed, as you can see an example project (also a work-in-progress) here: [https://github.com/evillemez/plan10](https://github.com/evillemez/plan10).

    TODO: explain concept of writing the game

This is how you would load a game with *Javelin* in the browser:

```js
//define configuration for your game
var gameConfig = {};

//instantiate your game with configuration
var game = new Javelin.Engine(new Javelin.Env.Browser(), gameConfig);

//load a scene from your game
game.loadScene('myGame.scene1');
```

That's it, but it doesn't explain much.  Here's what's happening internally:

1. Your game configuration (`gameConfig`) specifies scenes and components to register (or even custom plugins for the engine), as well as which engine plugins to load, and how they should be configured.
2. You instantiate an instance of `Javelin.Engine`, by giving it your game configuration, as well as an "environment", which in this case is your browser.  If it were a multiplayer game, you may be instantiating an instance of your game for the "server" environment.
3. You tell your game to load a scene you've registered.  You can optionally specify a callback here to be called once complete, but if not specified your game will start running automatically.

## Defining a scene ##

    TODO

## Defining a prefab ##

    TODO

## Writing an object component ##

    TODO

## Architecture ##

Javelin is a game engine that manages your game loop, the game objects in a scene, and the plugins that process the game
objects.  Generally, here are the pieces you need to know about, and what they do:

* **Javelin** - The global *Javelin* object acts as a registry for components, plugins, scenes and prefabs.  The Engine uses this internally for loading requested resources efficiently
* **Engine** - The engine manages plugins, game objects, and an environment.  The engine doesn't really know anything
at all about the contents of the game objects - it just keeps track of them so they can be processed by the engine plugins.
The Engine defines the main game loop, and tells the plugins to process the game objects once every game step.
* **Engine Plugins** - These do the real work.  The plugins process the actual game objects in the game.  They do this by
looking at the components of the game object.  On every game step, if a particular game object has a component the plugin
cares about, it may do something.  For example, if a game object has a *renderer* component, the *ThreeJs* plugin would visually
update that component on every frame - otherwise the *ThreeJs* plugin will ignore that object completely.  Example plugins include:
    * *canvas2d* - For rendering 2d scenes on html5 canvas with images
    * *input* - For capturing user device input
    * *box2d* - A physics engine for 2d scenes
    * *audio* - A plugin for
    * *network (planned)* - For connecting to a server with web sockets, enabling multiplayer
    * *threeJs (planned)* - For visually rendering a 3d scene with webgl
    * *cannonJs (planned)* - For providing 3d physics simulation
* **Game Objects** - Game objects are mostly containers for components.  Each object has a unique ID, assigned to it by the engine
when the object is added.  Game objects can have parent-child hierarchies, so you can compose complex objects by nesting them.
* **Game Object Components** - Components are where all the interesting things happen.  The plugins process the object components
to actually make things happen.  Any time you write a custom script to attach to a game object, you are writing a custom component.
All components have some basic functionality, for example registering callback functions for when certain events occur.  In your
components, you can directly interact with other components by requesting them from the game object.  Some example components
included with the engine are:
    * *transform2d* - Contains 2d spatial data regarding position and rotation
    * *sprite* - A reference to an image to be drawn in a 2d context on a canvas
    * *spriteAnimator* - A component for defining animations for a sprite comprised of multiple images
    * *audioListener* - TODO
    * *audioEmitter* - TODO
    * *rigidbody2d* - Requires *transform2d*, is processed by the *Box2d* plugin for simulating 2d physics
    * *transform3d (planned)* - Contains 3d spatial data regarding position and rotation
    * *renderer3d (planned)* - Contains objects required by the *ThreeJs* plugin to render a given object
    * *rigidbody3d (planned)* - Requires the *transform3d* component, is proccessed by the *CannonJs* plugin to simulate 3d physics
* **Engine Environment** - The engine "runs" in the context of an environment.  So far there are only two: *browser* and *server*. 
This allows the engine to reconfigure certain internal aspects, like asset loading and plugin activation, based on the environment in 
which it is executing.  In some environments, the engine may disable certian components - for example by default it would disable
the *ThreeJs* and *Input* components when it is executing on the server, because there is no need for them.

## Developing ##

To do any real development on the engine directly, you'll need *node.js* installed. The project uses [grunt.js](http://gruntjs.com/) to
automate tasks like *linting*, *concatenation*, *minification* and *testing*.  Here's how to get started:

* install *git*
* clone this repository on your system
* install *node.js* on your system
* install *grunt* on your system
* go into the project root and run `npm install`
* run the command `grunt`

When you run `grunt`, you'll see that all files are checked for syntax, they are compressed into one file and written into
`build/javelin.js`.  Then `build/javelin.js` is minified and creates `build/javelin.min.js`.  Then all the tests are run.  If you
see anything red, that's bad.

The tests are run with [*mocha*](http://visionmedia.github.com/mocha/) using the [*chai*](http://chaijs.com/) assertion library. If the
tests run by `grunt` don't give good enough output, you can run mocha directly with *mocha tests/* from the project root to get more
detailed output.

If you run `grunt watch`, then any time you edit a test or code file, all of the build tasks mentioned here will be run automatically.

There is also an IRC channel on freenode at `#javelinjs`.

## Working TODO ##

See `TODO.md`

## Roadmap ##

See `ROADMAP.md`
