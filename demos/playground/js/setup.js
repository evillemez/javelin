//setup game namespace
var Playground = Playground || {};

//on document ready
$(function() {
    var engine = new Javelin.Engine({
        debug: true
        environment: Javelin.Environment.Browser,
        plugins: [
            //Javelin.Plugin.Input
            Javelin.Plugin.ThreeJs
            ,Javelin.Plugin.CannonJs
            //,Javelin.Plugin.Network
        ]
    });
        
    //once the engine sets up the scene, tell the browser
    //to start running the game
    engine.loadScene(Playground.scene, function() {
        engine.run();
    });
});
