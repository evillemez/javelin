'use strict';

//just to experiment with creating multiple game objects
Grits.RobotManagerComponent = function(go, comp) {
    //public api
    comp.maxRobots = 10;
    comp.createDelay = 2;
    
    //private
    var lastTimeCreated = null;
    var robots = [];
    var y = 0;
    
    //behavior
    comp.$on('update', function(deltaTime) {
        var time = go.engine.time;
        if (time + comp.createDelay >= lastTimeCreated) {
            lastTimeCreated = time;
            
            //instantiate a new robot
            if (robots.length < comp.maxRobots) {
                var go = engine.instantiate(Grits.Prefab.Robot);
                robots.push(go);
                var t = go.getComponent('transform2d');
                y += 30;
                t.position.y = y;
            }
        }
    });

};
Grits.RobotManagerComponent.alias = "grits.robot_manager";
Javelin.register(Grits.RobotManagerComponent);
