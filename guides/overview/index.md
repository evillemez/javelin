# Overview #

Javelin is a game engine written in javascript.  The main goal of the project is to provide a stable, and modular, base upon which to build a game.  Many of concepts come from other game engines - so if you are familiar with other game engines, such as Unity3d, Javelin should feel somewhat familiar.

## Concepts ##

This is the brief vocabulary list for how things are described in Javelin.

* `engine` - The main glue between all the concepts below.  The engine loads scenes, instantiates plugins, and manages the creation and destructions of entities in a scene.
* `plugin` - A plugin provides APIs for other subsystems.  Plugins are loaded by the engine when scenes are loaded.
* `entity` - An entity is an instance of an object in a scene.  Entities contain components, which define how the Entity behaves.
* `component` - A component is functionality attached to an entity. Entities can have many components.  Most of the logic for any given game will be in a component.
* `prefab` - A prefab is a definition used to instantiate multiple entities of a type.
* `scene` - A scene defines plugins, and their configuration, as well as entities/prefabs that should be loaded by the engine.
* `environment` - An environment controls starting and stopping the engine.  For example, how the engine is invoked each frame is slightly different if functioning in the browser, versus server-side on Nodejs.
* `loader` - A loader is logic for loading assets, for example images and sounds.

### Examples ###

The concepts above are a bit abstract, so let's describe concrete examples.  Imagine a simple game of *Asteroids*, our reference version would behave like so:

* The game contains two screens:
    * A menu screen to play, exit, or view high scores
    * A gameplay screen with the actual game of destroying asteroids
* The game screen contains certain types of objects:
    * The player-controlled spaceship
    * The asteroids
    * Projectiles shot by the spaceship at the asteroids
* The game screen behaves in the following manner:
    * Once all asteroids are destroyed, or the spaceship is destroyed, the player is notified of winning or losing, and sent back to the menu screen.

This is a simple, but complete, game that we can describe with the concepts above:

The menu and gameplay screens are both *scenes*.  They are separate views of the same game, that do different things.

