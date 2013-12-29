# Javelin Grunt Tasks #

Lots of tasks are provided to automate working on the Javelin engine, its documentation and demos, as
well as working on projects that use Javelin.  Brief list of planned tasks:

Local tasks (for developing on this repo directly):

* `javelin-docs-parse-api` - Compile one `api.json` file, by parsing the code in `src/`.
* `javelin-docs-build-api` - Build api docs pages into `build/docs/<package.version>/api`.
* `javelin-docs-build-guides` - Build guides from markdown into `build/docs/<package.version>/guides`.
* `javelin-docs-scaffold-demo` - Scaffold a new demo in `docs/demos`
* `javelin-docs-build-demos` - Build javelin demos into `build/docs/<package.version>/demos`.
* `javelin-docs-build` - Run all docs related build commands to build full docs site in `build/docs/`.
* `javelin-build` - Build and test everything.

Plugin tasks, for other projects depending on Javelin:

* `javelin-docs-server` - Start simple node server to view docs site locally.
* `javelin-server` - Start server to view & live-reload project.
* `javelin-scaffold` - Scaffold new javelin project.
  * including npm/bower reqs, gruntfile
  * or use grunt-init?
  * or use Yeoman?