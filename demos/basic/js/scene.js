var gameConfig = {};

javelin.scene('basic', {
    plugins: {
        'renderer2d': {
            renderTargetId: 'viewport'
        },
        'input': {
            keyboard: {
                buttons: {
                    'up': 'uparrow',
                    'down': 'downarrow',
                    'left': 'leftarrow',
                    'right': 'rightarrow'
                }
            }
        }
    },
    entities: [
        'basic.player',
        'basic.grid'
    ]
});
