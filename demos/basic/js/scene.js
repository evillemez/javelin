javelin.scene('basic', {
    plugins: {
        'renderer2d': {},
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