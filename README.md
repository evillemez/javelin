# Javelin.js #

An open source game engine for the web.  Built with [cannon.js](http://schteppe.github.com/cannon.js/), [three.js](https://github.com/mrdoob/three.js/), and potentially others.

Why?  Cause I thought it would be a fun project.

> Note: As this is just a personal experiment at the moment, don't use it for anything serious, but feel free to contribute if you are so inclined!

## Overview ##

Javelin is a component-based game engine that can be deployed in the browser, and on the server with [node.js](http://nodejs.org/).

As it is component-based, other libraries can be substituted for the ones provide with the default implementation.  For
example, if you wanted to make a 2D game using [Box2d](http://code.google.com/p/box2dweb/), an engine plugin could be written 
for that, and you could then use the Box2D api in your game object scripts.

> Note: while this meant to be deployed in a browser, I am only interested in developing for Chrome and V8.  When other browsers actually implement the necessary APIs, it may change.

### Architecture ###

Javelin is a game engine that manages your game loop, the game objects in a scene, and the plugins that process the game
objects.  It does this by letting engine plugins process components on game objects.  It provides structure for the objects
in a scene, which helps you organize the code you write to script those objects.  So, generally, here are the pieces you need
to know about, and what they do:

* **Engine** - The engine manages plugins, game objects, and an environment.  The engine doesn't really know anything
at all about the contents of the game objects - it just keeps track of them so they can (or the relevant parts of them) can
be processed by the engine plugins.  The Engine defines the main game loop, and tells the plugins to process the game objects
once every game step.
* **Engine Plugins** - These do the real work.  The Plugins process the actual game objects in the game.  They do this by
looking at the components of the game object.  On every game step, if a particular game object has a component the Plugin
cares about, it may do something.  For example, if a game object has a *renderer* component, the *ThreeJs* plugin will visually
update that component on every frame - otherwise the *ThreeJs* plugin will ignore that object completely.  Example plugins include:
    * *ThreeJs* - For visually rendering a scene
    * *CannonJs* - For providing physics simulation
    * *Input* - For capturing user device input
    * *Network* - For connecting to a server with web sockets
* **Engine Environment** - The engine "runs" in the context of an environment.  So far there are only two: *browser* and *server*.  This
allows the engine to reconfigure certain internal aspects, like asset loading, game loop iteration, based on the environment in 
which it is executing.  In some environments, the engine may disable certian components - for example by default it will disable
the *ThreeJs* and *Input* components when it is executing on the server, because there is no need for them.
* **Game Objects** - Game objects are mostly containers for components.  Each object has a unique ID, assigned to it by the engine
when the object is added.  Game objects can have parent-child hierarchies, so you can compose complex objects by nesting them.
* **Game Object Components** - Components are where all the interesting things happen.  The Plugins process the object components
to actually make things happen.  Any time you write a custom script to attach to a game object, you are writing a custom component.
All components have some basic functionality, for example registering callback functions for when certain events occur.  In your
components, you can directly interact with other components by requesting them from the game object.  Some example components
included with the engine are:
    * **transform3d** - Contains 3d spatial data regarding position and rotation
    * **renderer3d** - Requires the *transform* component, and contains objects required by the *ThreeJs* plugin to visually render a given object
    * **rigidbody3d** - Requires the *transform* component, is proccessed by the *CannonJs* plugin to simulate physics
    
    > The `3d` suffix on these components reflects the fact that the *CannonJs* and *ThreeJs* plugins are tightly integrated with one another
    > for performance reasons.  However, one could easily build a 2d game using different plugins, in which case these components would be
    > out of place, and their equivalents should be named differently to avoid confusion.

### Example setup ###

This is going to change all the time - look in the `demos/` section to see the status of current experiments.  I imagine it will be a 
little while before there is actually anything working.

## Developing ##

To do any real development on the engine directly, you'll need *node.js* installed. The project Uses [grunt.js](http://gruntjs.com/) to
automate tasks like *linting*, *concatenation*, *minification* and *testing*.  Install by running `npm install` in the project root.  Once it's 
installed you can simply run `grunt watch` and start editing files.  New builds will be published in `builds/` automatically, and
you'll be notified of failing tests and bad syntax.

The tests are run with mocha, using node's built-in assertion library.  They are pretty basic, and probably lacking for now.

