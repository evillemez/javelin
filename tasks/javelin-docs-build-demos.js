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
            , buildDir = [root, ops.basedir].join(path.sep)
            , templates = []
            , templateVars = {baseurl: ops.baseurl}
            , done = this.async()
        ;

        //make build directory
        grunt.log.writeln(buildDir);
        grunt.file.mkdir(buildDir);

        //assemble demos index
        templates.push({
            template: [templatesDir, 'demos.index.swig.html'].join(path.sep),
            file: [buildDir, 'demos', 'index.html'].join(path.sep),
            vars: templateVars
        });

        //TODO: assemble data for each demo, check for a meta.json, parse the README

        swigHelper.renderObjects(grunt, templates, done);
    });
};
