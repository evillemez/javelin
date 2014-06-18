var pkg = require('./package.json');

module.exports = {
    paths: {
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
        vendorScripts: [
          'node_modules/pixi.js/bin/pixi.dev.js'
        ]
    },
    docs: {
        ghp: {
            demos: {
                target: 'build/ghp/docs/'+pkg.version+'/demos/',
                baseurl: '/javelin'
            }
        },
        local: {
            baseurl: '',
            target: 'build/docs/',
            demos: {
                target: 'build/docs/demos/',
                baseurl: ''
            }
        },
        ghplocal: {
            demos: {
                target: 'build/ghplocal/docs/'+pkg.version+'/demos/',
                baseurl: ''
            }
        }
    }
};
