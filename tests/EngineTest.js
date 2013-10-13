//TODO: REFACTOR TO USE FIXTURES PROPERLY
'use strict';

var chai = require('chai')
    , spies = require('chai-spies')
    , assert = chai.assert
    , expect = chai.expect
    , Javelin = require('../build/javelin.js')
;
chai.use(spies);
chai.Assertion.includeStack = true;

describe("Engine", function() {
    
    var javelin, spies, fixtures;

    //before each test create an empty javelin
    //repository and register the test fixtures
    beforeEach(function() {
        //TODO: don't allow fixtures to be cached
        fixtures = require('../build/fixtures.js');
        javelin = Javelin.createNewInstance();
        spies = {};

        javelin.component('foo', fixtures.FooComponent);
        //test plugins
        
        //test prefabs
        
        //test scenes
        
        //test loaders
        
        //test environment
    });

    it("should step with no components and or objects");
    
    it("should properly load and unload plugins");

    it("should notify plugins on step");

    it("should properly instantiate simple entities");

    it("should properly instantiate complex entities");

    it("should properly destroy entities");

    it("should retrieve entities by id");

    it("should load and unload scenes"); //ensure proper callbacks called

    it("should instantiate plugins when loading scenes");

    it("should load required assets when loading scenes");

    it("should instantiate entities when loading scenes");
    
    it("should load required assets when loading scenes");
    
    it("should call plugins on entity create and destroy");
    
    it("should notify plugins on prefab instantiate and destroy");

    it("should notify plugins on flush");

    it("should step with no errors");

    it("should call entity component callbacks on create/destroy and update");
                
    it("should properly instantiate and destroy entities during update step");
    
    it("should emit events emitted by root entities");
    
    it("should dispatch events to root level entities");

});
//*/
