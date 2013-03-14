# Javelin Roadmap #

There are some near-term items enumerated here that will happen for sure.  There is also
a fairly ambitious long-term roadmap.  How much gets done and by what time will depend upon `insert long list here`.

This document outlines general directions for the project. It is not about planned features, of which there are many.

For info on planned features and implementation details - see `TODO.md`.

## Will do ##

These items will get done, hopefully sooner rather than later.

* register with travis-ci
* implement semver version tagging, once generally stable
* register with bower and npm
* document the core
* implement automated docs build system
* publish info site w/ docs to github-pages
    * also include example games/demos
* create yeoman generator for new projects

## Want to do ##

* self-contained javelin package system, to allow easy sharing of resources
* custom `grunt` plugins for:
    * project dev server w/ node.js (would be required for multiplayer anyway)
    * exporting a 'build' version, letting the user configure what actually gets included in the Javelin build
    * exporting 'built' versions of a user's game
    * package management
* create visual IDE w/ Angular.js, integrating the various grunt tools

## Ponies & unicorns ##

* build-scripts to package game in a custom Chromium build, to run as a stand-alone on desktops
* build-scripts to export game as a Chrome app for the web store
* build-scripts to export game for iOS/Android apps
* build-scripts to export game for other platforms (if feasible)
    * OUYA
    * Gamestick
    * As-yet-to-be-announced consoles
* smart build-stripping to optimize which resources get exported for target platforms
