'use strict';

var exec = require('child_process').exec,
    fs = require('fs'),
    path = require('path'),
    swig = require('swig'),
    swigHelper = require(__dirname + '/../util/swigHelpers.js')
;

module.exports = function(grunt) {

    grunt.registerMultiTask('javelin-ghpages-build', 'Build GH Pages site.', function() {
        var root = path.resolve(__dirname, '..');
        var templatesDir = [root, 'util', 'ghpages', 'templates'].join(path.sep)
            , ops = this.options(this.data)
            , buildDir = [root, ops.basedir].join(path.sep)
            , renderObjects = []
            , templateVars = grunt.file.readJSON([root,'util','ghpages','templateVars.json'].join(path.sep))
            , done = this.async()
        ;
        templateVars.baseurl = ops.baseurl;

        //make build directory
        grunt.log.writeln(buildDir);
        grunt.file.mkdir(buildDir);

        //assemble index
        renderObjects.push({
            template: [templatesDir, 'index.swig.html'].join(path.sep),
            file: [buildDir, 'index.html'].join(path.sep),
            vars: templateVars
        });

        //TODO: assemble data for other pages

        //render all templates to final location
        swigHelper.renderObjects(grunt, renderObjects, done);
    });
};
