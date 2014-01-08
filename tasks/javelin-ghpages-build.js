'use strict';

var exec = require('child_process').exec,
    fs = require('fs'),
    path = require('path'),
    swig = require('swig')
;

module.exports = function(grunt) {

    grunt.registerMultiTask('javelin-ghpages-build', 'Build GH Pages site.', function() {
        var ops = this.options(this.data);

        
    });
};
