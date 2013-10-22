'use strict';

//TODO: configure fixtures lint/build/etc...

module.exports = function(grunt) {

  // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        
        //this is for convenience, used in other configs
        fileCollections: {
            lint: ['Gruntfile.js', 'src/**/*.js', 'tests/**/*.js', 'fixtures/**/*.js', 'tasks/**/*.js'],
            test: ['tests/**/*.js'],
            javelinCore: [
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
                'util/javelin.suffix'
            ],
            javelinFull: [
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
            ],
            fixtures: [
                'util/fixtures.prefix',
                'fixtures/**/*.js',
                'util/fixtures.suffix'
            ]
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: "<%= fileCollections.lint %>"
        },
        simplemocha: {
            options: {
                timeout: 3000,
                ignoreLeaks: false,
                ui: 'bdd',
                reporter: 'spec'
            },
            all: {
                src: '<%= fileCollections.test %>'
            }
        },
        concat_sourcemap: {
            options: {
                separator: "\n\n"
            },
            full: {
                src: "<%= fileCollections.javelinFull %>",
                dest: 'build/javelin.js'
            },
            core: {
                src: "<%= fileCollections.javelinCore %>",
                dest: 'build/javelin.core.js'
            },
            fixtures: {
                src: "<%= fileCollections.fixtures %>",
                dest: 'build/fixtures.js'
            }
        },
        uglify: {
            options: {
                mangle: true
            },
            full: {
                files: {
                    'build/javelin.min.js': ['build/javelin.js']
                }
            },
            core: {
                files: {
                    'build/javelin.core.min.js': ['build/javelin.core.js']
                }
            }
        },
        watch: {
            all: {
                files: "<%= fileCollections.lint %>",
                tasks: ["default"],
                options: {
                    interrupt: true
                }
            }
        },
        javelin_docs: {
            options: {
                target: 'build/docs/'
            }
        }
    });
    
    //load commands from plugins
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-concat-sourcemap');
    //grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-simple-mocha');

    //load custom tasks
    grunt.loadTasks('tasks/');
    
    // Custom tasks
    grunt.registerTask('default', ['jshint', 'concat_sourcemap', 'uglify', 'simplemocha']);
    grunt.registerTask('build', ['jshint', 'concat', 'uglify']);
};
