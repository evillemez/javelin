var gameConfig = {};

javelin.scene('default', {
    plugins: {
        'renderer2d': {
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
    },
    entities: [
        'player',
        'grid'
    ]
});