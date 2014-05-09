'use strict';
/*
var chai = require('chai');
chai.Assertion.includeStack = true;
var assert = chai.assert;

describe("Input Plugin", function() {
    
    var e, j, f;
    
    beforeEach(function() {
        j = require('../build/javelin/dist/javelin.core.js');
        f = require('./fixtures/fixtures.js');
        e = new j.Engine(new f.Env.TestEnvironment(), {
            debug: true
        });
        e.initialize();
    });
    
    it("should load the input plugin", function() {
        e.loadPlugin('input');
        var p = e.getPlugin('input');
        assert.isObject(p);
        assert.isNotBoolean(p);
    });
    
    it("should allow defining buttons", function() {
        e.loadPlugin('input');
        var p = e.getPlugin('input');
        assert.throws(function() {
            p.getButton('move left');
        }, /not defined/);
        assert.throws(function() {
            p.getButtonUp('move left');
        }, /not defined/);
        assert.throws(function() {
            p.getButtonDown('move left');
        }, /not defined/);
        
        p.defineButton('move left');
        
        assert.strictEqual(p.getButton('move left'), 0);
        assert.isFalse(p.getButtonUp('move left'));
        assert.isFalse(p.getButtonDown('move left'));
    });
    
    it("should allow getting and setting button values", function() {
        e.loadPlugin('input');
        var p = e.getPlugin('input');
        p.defineButton('move left');

        assert.strictEqual(p.getButton('move left'), 0);
        assert.isFalse(p.getButtonUp('move left'));
        assert.isFalse(p.getButtonDown('move left'));
        
        p.setButton('move left', 1);
        p.setButtonUp('move left', true);
        p.setButtonDown('move left', true);
        
        assert.strictEqual(p.getButton('move left'), 1);
        assert.isTrue(p.getButtonUp('move left'));
        assert.isTrue(p.getButtonDown('move left'));
    });
    
    it("should define buttons in keyboard config", function() {
        var conf = {
            keyboard: {
                buttons: {
                    'move left': 'a',
                    'move right': 'b',
                    'fire': 'space'
                }
            }
        };
        
        e.loadPlugin('input', conf);
        var p = e.getPlugin('input');
        
        assert.strictEqual(p.getButton('move left'), 0);
        assert.isFalse(p.getButtonUp('move left'));
        assert.isFalse(p.getButtonDown('move left'));
        assert.strictEqual(p.getButton('move right'), 0);
        assert.isFalse(p.getButtonUp('move right'));
        assert.isFalse(p.getButtonDown('move right'));
        assert.strictEqual(p.getButton('fire'), 0);
        assert.isFalse(p.getButtonUp('fire'));
        assert.isFalse(p.getButtonDown('fire'));
    });
});
*/
