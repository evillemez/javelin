'use strict';

var exec = require('child_process').exec,
    fs = require('fs'),
    path = require('path'),
    swig = require('swig'),
    swigHelper = require(__dirname + '/../util/swigHelpers.js')
;

module.exports = function(grunt) {

    grunt.registerMultiTask('javelin-docs-build-demos', 'Builds doc demos.', function() {
        var root = path.resolve(__dirname, '..');
        var templatesDir = [root, 'util', 'docs', 'templates'].join(path.sep)
            , ops = this.options(this.data)
            , buildDir = [root, ops.dest].join(path.sep)
            , demosDir = [root, 'demos'].join(path.sep)
            , templates = []
            , done = this.async()
        ;

        //make build directory
        grunt.file.mkdir(buildDir);

        //assemble demos index
        templates.push({
            template: [templatesDir, 'demos.index.swig.html'].join(path.sep),
            file: [buildDir, 'index.html'].join(path.sep),
            vars: { baseurl: ops.baseurl }
        });

        //assemble individual demo pages
        grunt.file.expand(demosDir + '/*/').forEach(function(dir) {

            var   fileMeta = dir + '/meta.json'
                , fileReadme = dir + '/README.md'
                , templateVars = { baseurl: ops.baseurl }
            ;
            
            if (!grunt.file.exists(fileMeta)) {
                return;
            }

            templateVars.meta = grunt.file.readJSON(fileMeta);
            templateVars.readme = grunt.file.read(fileReadme);
            templateVars.scripts = grunt.file.expand(dir + '/js/**/*.js').map(function(file) {
                //TODO: resolve properly (nested files)
                return path.basename(file);
            });

            //TODO: copy demo js files to new location
            grunt.file.expand(dir + '/js/**/*.js').forEach(function(file) {
                grunt.log.writeln('FOUND DEMO JS FILE: ' + file);
            });

            templates.push({
                template: [templatesDir, 'demo.swig.html'].join(path.sep),
                file: [buildDir, templateVars.meta.dir, 'index.html'].join(path.sep),
                vars: templateVars
            });
        });
console.log(templates);
        swigHelper.renderObjects(grunt, templates, done);
    });
};
