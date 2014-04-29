/**
 * Takes care of managing the engine loop in a generic web browser
 * environment.
 *
 * @package  common
 * @type environment
 */
javelin.environment('browser', function(config) {
    var self = this;
    this.config = config;
    var intervalId = null;

    //TODO: change to requestAnimationFrame
    this.run = function(stepsPerSecond) {
        intervalId = setInterval(function() {
            try {
                self.engine.step();
            } catch (e) {
                console.log(e);
            }
        }, stepsPerSecond);
    };

    this.stop = function(callback) {
        clearInterval(intervalId);
        setTimeout(callback, 1);
    };

});
