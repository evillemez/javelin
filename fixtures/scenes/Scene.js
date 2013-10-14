Fixtures.Scene = {
    entities: [
        'foo',
        'bar',
        'baz',
        {
            fromPrefab: 'baz',
            components: {
                'foo': {
                    x: 100,
                    y: 100
                }
            }
        }
    ]
};
