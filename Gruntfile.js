'use strict';

module.exports = function(grunt) {

  // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        
        //this is for convenience, used in other configs
        files: {
            lint: ['Gruntfile.js', 'src/**/*.js', 'tests/**/*.js'],
            test: ['tests/**/*.js']
        },
        watch: {
            files: "<%= files.lint %>",
            tasks: ["default"]
        },
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                node: true,
                es5: true,
                strict: true,
                browser: true,
                globals: {
                    Javelin: true,
                    should: true,
                    it: true,
                    define: true,
                    require: true,
                    describe: true
                }
            },
            all: "<%= files.lint %>"
        },
        simplemocha: {
            options: {
                globals: ['should', 'it', 'define','require','describe','Javelin'],
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
                src: ['util/build_intro.js', "src/**/*.js", 'util/build_outro.js'],
                dest: 'build/javelin.js'
            }
        },
        uglify: {
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
    
    // Default task
    grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'simplemocha']);
};
