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

        //find all demos and parse meta.json files
        var demoMeta = [];
        grunt.file.expand(demosDir + '/*/').forEach(function(dir) {
            var file = dir + '/meta.json';

            if (!grunt.file.exists(file)) {
                return;
            }

            var data = grunt.file.readJSON(file);
            data.path = dir;
            demoMeta.push(data);
        });

        //assemble demos index page
        templates.push({
            template: [templatesDir, 'demos.index.swig.html'].join(path.sep),
            file: path.normalize([buildDir, 'index.html'].join(path.sep)),
            vars: {
                baseurl: ops.baseurl,
                demos: demoMeta
            }
        });

        //assemble individual demo pages
        demoMeta.forEach(function(data) {

            var   fileMeta = data.path + 'meta.json'
                , fileReadme = data.path + 'README.md'
                , templateVars = { baseurl: ops.baseurl }
            ;
            
            if (!grunt.file.exists(fileMeta)) {
                return;
            }

            //read stuff in directory to assemble variables
            //for swig when rendering demo page template
            templateVars.meta = data;
            templateVars.readme = grunt.file.read(fileReadme);
            templateVars.scripts = grunt.file.expand(data.path + 'js/**/*.js').map(function(file) {
                return path.relative(data.path, file);
            });

            //copy javascript files in demo, TODO: make async
            grunt.file.expand(data.path + 'js/**/*.js').forEach(function(file) {
                var relative = path.relative(data.path, file);
                var target = [buildDir, data.dir, relative].join(path.sep);
                target = path.normalize(target);
                grunt.log.writeln('Copying js: ' + target);
                grunt.file.copy(file, target);
            });

            //copy assets in demo, TODO: make async
            grunt.file.expand(data.path + 'assets/**/*.*').forEach(function(file) {
                var relative = path.relative(data.path, file);
                var target = [buildDir, data.dir, relative].join(path.sep);
                target = path.normalize(target);
                grunt.log.writeln('Copying asset: ' + target);
                grunt.file.copy(file, target);
            });
            
            // TODO: run README through swig, then render markdown to html

            //add demo template for swig to render
            templates.push({
                template: [templatesDir, 'demo.swig.html'].join(path.sep),
                file: path.normalize([buildDir, templateVars.meta.dir, 'index.html'].join(path.sep)),
                vars: templateVars
            });
        });
        
        //make swig render demo pages
        swigHelper.renderObjects(grunt, templates, done);
    });
};
