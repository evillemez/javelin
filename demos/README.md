# Javelin Demos #

Demos in this directory are for showing examples of how to implement various things in a game using Javelin.

These demos don't function as is - they are processed and published as part of the docs site.  To see
the demos in action, run `grunt javelin-docs-server`, and view the docs site.

To create a new demo, you can run `grunt javelin-docs-scaffold-demo:NAME_OF_DEMO`.

The page that loads each demo is created programatically via a grunt task when the docs site is built.
This means that when you create a new demo, you must adhere to some conventions, and make certain
assumptions:

* 800x600 viewport
* all assets will be automatically loaded before the demo starts
* 

## Directories ##

* `demos/shared/assets/` - For assets reused in multiple demos.  Reusing assets is highly encouraged.
