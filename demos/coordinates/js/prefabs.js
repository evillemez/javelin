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

javelin.prefab('grid', {
    component: {
        'demo.grid': {}
    }
});
