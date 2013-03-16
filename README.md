# Javelin.js #

An open source game engine for the web.

## Overview ##

Javelin is a component-based game engine that can be deployed in the browser, and on the server with [node.js](http://nodejs.org/).

As it is component-based, other libraries can be substituted for the ones provide with the default implementation.  Currently,
the project only provides engine components and plugins for creating 2d games.  However, it will be expanded over time to provide
plugins for [*Three.js*](http://mrdoob.github.com/three.js/) and [*Cannon.js*](http://schteppe.github.com/cannon.js/) to also allow for the creation of 3d games.

> Note: this is very much a work in progress, though the core is generally stable.   However, until there are more plugins and components, it will be minimally useful.

### Architecture ###

Javelin is a game engine that manages your game loop, the game objects in a scene, and the plugins that process the game
objects.  Generally, here are the pieces you need to know about, and what they do:

* **Javelin** - The global *Javelin* object acts as a registry for components, plugins, scenes and prefabs.  The Engine uses this internally for loading requested resources efficiently
* **Engine** - The engine manages plugins, game objects, and an environment.  The engine doesn't really know anything
at all about the contents of the game objects - it just keeps track of them so they can be processed by the engine plugins.
The Engine defines the main game loop, and tells the plugins to process the game objects once every game step.
* **Engine Plugins** - These do the real work.  The Plugins process the actual game objects in the game.  They do this by
looking at the components of the game object.  On every game step, if a particular game object has a component the Plugin
cares about, it may do something.  For example, if a game object has a *renderer* component, the *ThreeJs* plugin will visually
update that component on every frame - otherwise the *ThreeJs* plugin will ignore that object completely.  Example plugins include:
    * *Canvas2d* - For rendering 2d scenes on html5 canvas with images
    * *Input (planned)* - For capturing user device input
    * *Box2d (planned)* - A physics engine for 2d scenes
    * *Network (planned)* - For connecting to a server with web sockets, enabling multiplayer
    * *ThreeJs (planned)* - For visually rendering a 3d scene with webgl
    * *CannonJs (planned)* - For providing 3d physics simulation
* **Game Objects** - Game objects are mostly containers for components.  Each object has a unique ID, assigned to it by the engine
when the object is added.  Game objects can have parent-child hierarchies, so you can compose complex objects by nesting them.
* **Game Object Components** - Components are where all the interesting things happen.  The Plugins process the object components
to actually make things happen.  Any time you write a custom script to attach to a game object, you are writing a custom component.
All components have some basic functionality, for example registering callback functions for when certain events occur.  In your
components, you can directly interact with other components by requesting them from the game object.  Some example components
included with the engine are:
    * *transform2d* - Contains 2d spatial data regarding position and rotation
    * *sprite* - A reference to an image to be drawn in a 2d context on a canvas
    * *spriteAnimator* - A component for defining animations for a sprite comprised of multiple images
    * *rigidbody2d (planned)* - Requires *transform2d*, is processed by the *Box2d* plugin for simulating 2d physics
    * *transform3d (planned)* - Contains 3d spatial data regarding position and rotation
    * *renderer3d (planned)* - Contains objects required by the *ThreeJs* plugin to render a given object
    * *rigidbody3d (planned)* - Requires the *transform3d* component, is proccessed by the *CannonJs* plugin to simulate 3d physics
* **Engine Environment** - The engine "runs" in the context of an environment.  So far there are only two: *browser* and *server*. 
This allows the engine to reconfigure certain internal aspects, like asset loading and plugin activation, based on the environment in 
which it is executing.  In some environments, the engine may disable certian components - for example by default it would disable
the *ThreeJs* and *Input* components when it is executing on the server, because there is no need for them.
    
### Example setup ###

None for now - once more components are completed, there will be a separate demo project.

## Working TODO ##

See `TODO.md`

## Roadmap ##

See `ROADMAP.md`

## Developing ##

To do any real development on the engine directly, you'll need *node.js* installed. The project Uses [grunt.js](http://gruntjs.com/) to
automate tasks like *linting*, *concatenation*, *minification* and *testing*.  Install by running `npm install` in the project root.  Once it's 
installed you can simply run `grunt watch` and start editing files.  New builds will be published in `builds/` automatically, and
you'll be notified of failing tests and bad syntax.

The tests are run with mocha, using the *chai* assertion library.  They are pretty basic, and probably lacking for now.
