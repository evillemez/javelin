'use strict';

module.exports = function(grunt) {

  // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        
        //this is for convenience, used in other configs
        files: {
            lint: ['Gruntfile.js', 'src/**/*.js', '!src/vendor/**/*.js', 'tests/**/*.js'],
            test: ['tests/**/*.js'],
            fixtures: ['tests/fixtures/**/*.js'],
            
            //note: src/vendor DOES need to be included in the build, but not until I can make it work
            //and pass the tests properly
            build: ['util/build_intro.js', "src/javelin/**/*.js", 'util/build_outro.js']
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
        jsdoc : {
            dist : {
                src: ['src/**/*.js'], 
                options: {
                    destination: 'doc'
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
                globals: ['_', 'should', 'it', 'define','require','describe','Javelin', 'THREE', 'window', 'self', 'before','after','beforeEach','afterEach'],
                timeout: 3000,
                ignoreLeaks: false,
                ui: 'bdd',
                reporter: 'tap'
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
            //not entirely sure whether or not I can use mangle... will have to experiment
            options: {
                mangle: false
            },
            my_target: {
                files: {
                    'build/javelin.min.js': ['build/javelin.js']
                }
            }
        }
    });
    
    //register commands from plugins
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-simple-mocha');
    grunt.loadNpmTasks('grunt-jsdoc');
    
    // Default task
    grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'simplemocha']);
    grunt.registerTask('build', ['jshint', 'concat', 'uglify']);
};
