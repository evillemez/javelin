javelin.scene('default', {
    entities: [
        'player'
    ],
    loader: {
        environments: {
            browser: {
                basepath: window.javelinDemos.browserConfig.baseurl
            }
        },
        preload: [
            '/demos/shared/assets/robot/robot.atlas.json',
            '/demos/shared/assets/robot/robot.png'
        ]
    },
    plugins: {
        'pixi': {
            renderTargetId: 'viewport',
        },
        'input': {
            keyboard: {
                buttons: {
                    'up': 'uparrow',
                    'down': 'downarrow',
                    'left': 'leftarrow',
                    'right': 'rightarrow',
                    'camUp': 'w',
                    'camDown': 's',
                    'camLeft': 'a',
                    'camRight': 'd',
                    'zoomIn': 'e',
                    'zoomOut': 'q'
                }
            }
        }
    }
});
