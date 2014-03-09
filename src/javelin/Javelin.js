//setup main namespaces
var Javelin = Javelin || {
    Components: {},
    Plugins: {},
    Environments: {},
    Loaders: {}
};

//constants - prepended with $ because you can't start a variable with a number
Javelin.$PI_OVER_180 = Math.PI / 180;
Javelin.$180_OVER_PI = 180 / Math.PI;
Javelin.$2xPI = 2 * Math.PI;

//singleton registry instance
Javelin.instance = null;

/* utility methods: note that these are for checking LITERALS only, as they are used internally
quite a bit, and have an expected format, there may be edge cases where these don't give the
expected result */
Javelin.isString = function(value) {
    return typeof value === 'string';
};

Javelin.isEmpty = function(item) {
    for (var key in item) {
        return false;
    }
    
    return true;
};

Javelin.isFunction = function(value) {
    return typeof value === 'function';
};

Javelin.isObject = function(value) {
    return value !== null && !Javelin.isArray(value) && typeof value === 'object';
};

Javelin.isArray = function(value) {
    return Object.prototype.toString.apply(value) === '[object Array]';
};

Javelin.noop = function() {};

//singleton factory methods - mostly used during tests
Javelin.getInstance = function() {
    if (Javelin.instance) {
        return Javelin.instance;
    }

    Javelin.instance = Javelin.createInstance();

    return Javelin.instance;
};

Javelin.createNewInstance = function() {
    Javelin.instance = new Javelin.Registry();

    return Javelin.instance;
};

Javelin.createInstance = function() {
    var javelin = Javelin.createNewInstance();

    //environments
    javelin.environment('browser', Javelin.Environments.Browser);
    javelin.environment('server', Javelin.Environments.Server);

    //loaders
    javelin.loader(['.json'], ['browser'], Javelin.Loaders.BrowserJsonLoader);
    javelin.loader(['.atlas.json'], ['browser'], Javelin.Loaders.BrowserAtlasLoader);
    javelin.loader(['.png','.jpg','.jpeg','.gif'], ['browser'], Javelin.Loaders.BrowserImageLoader);
    javelin.loader(['.mp3','.ogg'], ['browser'], Javelin.Loaders.BrowserSoundLoader);

    //plugins
    javelin.plugin('renderer2d', Javelin.Plugins.Renderer2d);
    javelin.plugin('audio2d', Javelin.Plugins.Audio2d);
    javelin.plugin('box2d', Javelin.Plugins.Box2d);
    javelin.plugin('input', Javelin.Plugins.Input);

    //components
    javelin.component('transform2d', [], Javelin.Components.Transform2d);
    javelin.component('rigidbody2d', ['transform2d'], Javelin.Components.Rigidbody2d);
    javelin.component('audioEmitter2d', ['transform2d'], Javelin.Components.AudioEmitter2d);
    javelin.component('audioListener2d', ['transform2d'], Javelin.Components.AudioListener2d);
    javelin.component('sprite2d', ['transform2d'], Javelin.Components.Sprite2d);
    javelin.component('spriteAnimator2d', ['sprite2d'], Javelin.Components.SpriteAnimator2d);
    javelin.component('particle2d', ['transform2d'], Javelin.Components.Particle2d);

    return javelin;
};
