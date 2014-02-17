# Javelin Demos #

Demos in this directory are for showing examples of how to implement various things in a 
project using Javelin.

These demos will not function as is - they are processed and published as part of 
the docs site.  To see the demos in action, run `grunt javelin-docs`, and view the 
docs site.

The page that loads each demo is created programatically via a grunt task when the docs 
site is built. This means that when you create a new demo, you must adhere to some 
conventions, and make certain assumptions:

* 800x600 viewport
* all assets will be automatically loaded before the demo starts
* Demo README is shown on the page as is (parsed into HTML, that is)

## Creating a demo ##

All demos require several things:

* a `meta.json` file in the root of the demo
* a `README.md` in the root of the demo
* all javascript belongs in the `js/` directory
* all assets belong in the `assets/` directory

Generally, look at existing demos and copy their structure - the build tasks expects
demos to follow the same structure.

## Directories ##

* `demos/shared/assets/` - For assets reused in multiple demos.  Reusing assets is highly 
encouraged.  Do not add new assets (particularly images and sounds), unless absolutely 
required for the demo.  We want to keep this repository as small as possible.
