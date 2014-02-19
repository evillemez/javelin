var gameConfig = {
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
    }    
};

javelin.scene('default', {
    entities: [
        'player'
    ]
});

javelin.prefab('player', {
    components: {
        'demo.controls': {
            speed: 5
        },
        'demo.ball': {
            color: '00FF00',
            radius: 1
        }
    }
});
