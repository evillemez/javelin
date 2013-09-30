'use strict';

module.exports = function(grunt) {

  // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        
        //this is for convenience, used in other configs
        files: {
            lint: ['Gruntfile.js', 'src/**/*.js', 'tests/**/*.js'],
            test: ['tests/**/*.js'],            
            build: [
                'util/javelin.prefix',
                'src/javelin/Javelin.js',
                'src/javelin/Registry.js',
                'src/javelin/Engine.js',
                'src/javelin/Plugin.js',
                'src/javelin/AssetLoader.js',
                'src/javelin/Dispatcher.js',
                'src/javelin/Environment.js',
                'src/javelin/Component.js',
                'src/javelin/Entity.js',
                'src/components/**/*.js',
                'src/environments/**/*.js',
                'src/loaders/**/*.js',
                'src/plugins/**/*.js',
                'util/javelin.suffix'
            ]
        },
        watch: {
            all: {
                files: "<%= files.lint %>",
                tasks: ["default"],
                options: {
                    interrupt: true
                }
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: "<%= files.lint %>"
        },
        simplemocha: {
            options: {
                timeout: 3000,
                ignoreLeaks: false,
                ui: 'bdd',
                reporter: 'spec'
            },
            all: {
                src: '<%= files.test %>'
            }
        },
        concat: {
            options: {
                separator: ";"
            },
            dist: {
                src: "<%= files.build %>",
                dest: 'build/javelin.js'
            }
        },
        uglify: {
            options: {
                mangle: true
            },
            my_target: {
                files: {
                    'build/javelin.min.js': ['build/javelin.js']
                }
            }
        },
        javelindocs: {
            options: {
                target: 'build/docs/'
            }
        }
    });
    
    //register commands from plugins
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-simple-mocha');
    
    // Default task
    grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'simplemocha']);
    grunt.registerTask('build', ['jshint', 'concat', 'uglify']);
    grunt.registerTask('docs', ['default']);
};
