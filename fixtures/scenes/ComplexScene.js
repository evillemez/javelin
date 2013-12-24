Fixtures.ComplexScene = {
    plugins: {
        'test': {
            foo: 500,
            bar: 600
        }
    },
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
