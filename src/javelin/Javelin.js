//setup main namespaces
var Javelin = Javelin || {};

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

    Javelin.instance = new Javelin.Registry();

    return Javelin.instance;
};

Javelin.createNewInstance = function() {
    Javelin.instance = new Javelin.Registry();

    return Javelin.instance;
};
