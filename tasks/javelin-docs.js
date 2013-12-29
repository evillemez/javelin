'use strict';

module.exports = function(grunt) {

    grunt.registerTask('javelin-docs', 'Build & serve Javelin docs locally.', [
        'javelin-docs-build',
        'javelin-docs-server'
    ]);

    grunt.registerTask('javelin-docs-build', 'Build Javelin API documentation locally.', [
        'javelin-docs-parse-api'
        //,'javelin-docs-build-api'
        //,'javelin-docs-build-guides'
        //,'javelin-docs-build-demos'
    ]);

};
