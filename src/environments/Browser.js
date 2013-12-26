Javelin.Environments.Browser = function(config, engine) {
    var self = this;
    this.intervalId = null;

    //TODO: change to requestAnimationFrame
    this.run = function(stepsPerSecond) {
        self.intervalId = setInterval(function() {
            try {
                engine.step();
            } catch (e) {
                console.log(e);

                if (engine.debug) {
                    alert(e);
                }
            }
        }, stepsPerSecond);
    };

    this.stop = function(callback) {
        clearInterval(self.intervalId);
        setTimeout(callback, 1);
    };

};
