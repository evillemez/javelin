'use strict';

/**
 * This contains config for several plugins used when building the main `javelin.js` scripts.
 *
 * It also contains config for the many included custom tasks, most of which are used for 
 * generating the documentation, guides and demos - all of which can be run locally, but also
 * generated for publishing via Github Pages.
 */
module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        
        //this is for convenience, used in other configs
        fileCollections: {
            lint: ['Gruntfile.js', 'src/**/*.js', 'tests/**/*.js', 'fixtures/**/*.js', 'tasks/**/*.js'],
            test: ['tests/**/*.js'],
            javelinCore: [
                'util/build/javelin.prefix',
                'src/javelin/Javelin.js',
                'src/javelin/Registry.js',
                'src/javelin/Engine.js',
                'src/javelin/Plugin.js',
                'src/javelin/AssetLoader.js',
                'src/javelin/Dispatcher.js',
                'src/javelin/Environment.js',
                'src/javelin/Component.js',
                'src/javelin/Entity.js',
                'util/build/javelin.suffix'
            ],
            javelinFull: [
                'util/build/javelin.prefix',
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
                'util/build/javelin.suffix'
            ],
            fixtures: [
                'util/build/fixtures.prefix',
                'fixtures/**/*.js',
                'util/build/fixtures.suffix'
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
                dest: 'build/javelin/javelin-<%= pkg.version %>.js'
            },
            core: {
                src: "<%= fileCollections.javelinCore %>",
                dest: 'build/javelin/javelin-<%= pkg.version %>.core.js'
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
                    'build/javelin/javelin-<%= pkg.version %>.min.js': ['build/javelin/javelin-<%= pkg.version %>.js']
                }
            },
            core: {
                files: {
                    'build/javelin/javelin-<%= pkg.version %>.core.min.js': ['build/javelin/javelin-<%= pkg.version %>.core.js']
                }
            }
        },
        watch: {
            javelin: {
                files: "<%= fileCollections.lint %>",
                tasks: ["default"],
                options: {
                    interrupt: true
                }
            },
            docs: {
                files: ["<%= fileCollections.lint %>", 'demos/**/*.*', 'util/docs/**/*.*'],
                tasks: ['javelin-docs-build-local'],
                options: {
                    interrupt: true
                }
            }
        },
        copy: {
            build: {
                src: 'build/javelin/javelin-<%= pkg.version %>.js',
                dest: 'build/javelin/javelin.js'
            },
            docs: {files:[
                {
                    src: 'util/docs/bower.json',
                    dest: 'build/docs/bower.json'
                },
                {
                    src: 'build/javelin/**/*.js',
                    dest: 'build/docs/javelin/'
                }
            ]},
            ghp: {files: [
                {
                    src: 'util/ghpages/bower.json',
                    dest: 'build/ghp/bower.json'
                }
            ]},
            ghplocal: {files:[
                {
                    src: 'util/ghpages/bower.json',
                    dest: 'build/ghplocal/bower.json'
                }
            ]}
        },
        'http-server': {
            docs: {
                root: 'build/docs/',
                port: 8555,
                host: '127.0.0.1',
                showDir: true,
                autoIndex: true,
                runInBackground: false                
            },
            ghplocal: {
                root: 'build/ghplocal/',
                port: 8556,
                host: '127.0.0.1',
                showDir: true,
                autoIndex: true,
                runInBackground: false
            }
        },
        'javelin-docs-parse-api': {
            options: {
                src:'src/**/*.js'
            },
            local: {
                dest: 'build/docs/api/api.json'
            },
            ghplocal: {
                dest: 'build/ghplocal/docs/<%= pkg.version %>/api/api.json'
            },
            ghp: {
                dest: 'build/ghp/docs/<%= pkg.version %>/api/api.json'
            }
        },
        'javelin-docs-build-api': {
            local:  {
                dest: 'build/docs/api/',
                baseurl: ''
            },
            ghplocal: {
                dest: 'build/ghplocal/docs/<%= pkg.version %>/api/',
                baseurl: '/docs/<%= pkg.version %>'
            },
            ghp: {
                dest: 'build/ghp/docs/<%= pkg.version %>/api/',
                baseurl: '/javelin/docs/<%= pkg.version %>'
            }
        },
        'javelin-docs-build-guides': {},
        'javelin-docs-build-demos': {
            local: {
                dest: 'build/docs/demos/',
                baseurl: ''
            },
            ghplocal: {
                dest: 'build/ghplocal/docs/<%= pkg.version %>/demos/',
                baseurl: '/docs/<%= pkg.version %>'
            },
            ghp: {
                dest: 'build/ghp/docs/<%= pkg.version %>/demos/',
                baseurl: '/docs/<%= pkg.version %>'
            }
        },
        'javelin-ghpages-build': {
            ghplocal: {
                basedir: 'build/ghplocal/',
                baseurl: ''
            },
            ghp: {
                basedir: 'build/ghp/',
                baseurl: '/javelin'
            }
        }
    });
    
    //load grunt commands from plugins
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-concat-sourcemap');
    //grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-simple-mocha');
    grunt.loadNpmTasks('grunt-http-server');

    //load custom javelin tasks
    grunt.loadTasks('tasks/');

    //build local docs site
    grunt.registerTask('javelin-docs-build-local', [
        'build',
        'javelin-docs-parse-api:local',
//        'javelin-docs-build-api:local',
//        'javelin-docs-build-guides:local',
        'javelin-docs-build-demos:local',
        'copy:docs'
    ]);

    //build & serve docs site locally
    grunt.registerTask('javelin-docs', [
        'javelin-docs-build-local',
        'http-server:docs'
    ]);

    //build & serve full GH Pages site locally
    grunt.registerTask('javelin-ghpages', [
        'build',
        'javelin-docs-parse-api:ghplocal',
//        'javelin-docs-build-api:ghplocal',
//        'javelin-docs-build-guides:ghplocal',
        'javelin-docs-build-demos:ghplocal',
        'javelin-ghpages-build:ghplocal',
        'copy:ghplocal',
        'http-server:ghplocal'
    ]);

    //build GH Pages site, as if it were being served from GH Pages
    grunt.registerTask('javelin-build-ghpages-live', [
        'build',
        'javelin-docs-parse-api:ghp',
//        'javelin-docs-build-api:ghp',
//        'javelin-docs-build-guides:ghp',
        'javelin-docs-build-demos:ghp'
//        'javelin-ghpages-build:ghp'
    ]);
    
    grunt.registerTask('build', ['jshint', 'concat_sourcemap', 'uglify', 'copy:build']);
    grunt.registerTask('default', ['build', 'simplemocha']);
};
