# Javelin.js #

An open source game engine for the web.  Built with [cannon.js](), [three.js](), and potentially others.

Why?  Cause I thought it would be a fun project.

## Overview ##

Javelin is a component-based game engine that can be deployed in the browser, and on the server with [node.js]().

As it is component-based, other libraries can be substituted for the ones provide with the default implementation.  For
example, if you wanted to make a 2D game using [Box2d](), an engine plugin could be written for that, and you could
then use the Box2D api in your game object scripts.

### Architecture ###

Javelin is a game engine that manages your game loop, the game objects in a scene, and the plugins that process the game
objects.  It does this by letting engine plugins process components on game objects.  It provides structure for the objects
in a scene, which helps you organize the code you write to script those objects.

### Example manual setup ###

    TODO: write up an example
    
## Writing a game ##

The easiest way to get started with a new game is to check out demo projects in the `demos/` directory.

Real examples will be added here.