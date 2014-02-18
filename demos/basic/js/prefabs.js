javelin.prefab('basic.player', {
    components: {
        'basic.controls': {
            speed: 5
        },
        'basic.ball': {
            color: '00FF00',
            radius: 1
        }
    }
});

javelin.prefab('basic.grid', {
    component: {
        'basic.grid': {}
    }
});
