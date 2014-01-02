# Javelin Grunt Tasks #

Lots of tasks are provided to automate working on the Javelin engine, its documentation and demos, as
well as working on projects that use Javelin.  Brief list of planned tasks:

Local tasks (for developing on this repo directly):

* `javelin-docs-parse-api` - Compile one `api.json` file, by parsing the code in `src/`.
* `javelin-docs-build-api` - Build api docs pages into `build/docs/<package.version>/api`.
* `javelin-docs-build-guides` - Build guides from markdown into `build/docs/<package.version>/guides`.
* `javelin-docs-build-demos` - Build javelin demos into `build/docs/<package.version>/demos`.
* `javelin-ghpages-build` - Build full GHPages site into `build/ghpages`
* `javelin-build` - Build and test everything.

For other projects depending on Javelin:

* `javelin-ghpages` - Start full GHPages site locally.
* `javelin-docs` - Build & serve docs site locally.
* `javelin-server` - Start server to view & live-reload projects scaffolded via `javelin-init`.
* `javelin-init` - Scaffold new javelin project.
  * including npm/bower reqs, gruntfile
  * or use grunt-init?
  * or use Yeoman?
