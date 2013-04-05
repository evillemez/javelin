/*global Box2D:true */

'use strict';

/**
 * The `rigidbody2d` component provides a wrapper for methods in the Box2D API.
 * 
 * @author Evan Villemez
 */
Javelin.Component.Rigidbody2d = function(gameObject, component) {
    var box2d;  //actually a reference to the box2d plugin, which contains shortcuts to the box2d apis

    //box2d stuff used internally
    var bodyDef = null;
    var fixtureDef = null;
    var body = null;
    var fixture = null;
    
    //the gameObject's transform
    var transform = null;
    
    //these values are applied to the box2d fixture definition
    component.trigger = false;
    component.static = false;
    component.bullet = false;
    component.density = 1.0;
    component.friction = 0.0;
    component.restitution = 0.0;
    component.damping = 0.2;
    component.angularDamping = 0.3;
    component.fixedRotation = false;
    component.radius = null;
    component.shape = null; //array of custom shape points
    component.height = null;
    component.width = null;
    
    component.applyForce = function(degrees, power) {
        body.ApplyImpulse(new box2d.Vec2(Math.cos(degrees * Javelin.PI_OVER_180) * power, Math.sin(degrees * Javelin.PI_OVER_180) * power), body.GetWorldCenter());
    };
    component.applyForceForward = function(amount) {
        component.applyForce(transform.rotation, amount);
    };
    component.applyForceBackward = function(amount) {
        component.applyForce((transform.rotation + 180 % 360), amount);
    };
    component.applyForceLeft = function(amount) {
        component.applyForce((transform.rotation - 90 % 360), amount);
    };
    component.applyForceRight = function(amount) {
        component.applyForce((transform.rotation + 90 % 360), amount);
    };

    component.applyImpulse = function(degrees, power) {
        body.ApplyImpulse(new box2d.Vec2(Math.cos(degrees * Javelin.PI_OVER_180) * power, Math.sin(degrees * Javelin.PI_OVER_180) * power), body.GetWorldCenter());
    };
    component.applyImpulseForward = function(amount) {
        component.applyImpulse(transform.rotation, amount);
    };
    component.applyImpulseBackward = function(amount) {
        component.applyImpulse((transform.rotation + 180 % 360), amount);
    };
    component.applyImpulseLeft = function(amount) {
        component.applyImpulse((transform.rotation - 90 % 360), amount);
    };
    component.applyImpulseRight = function(amount) {
        component.applyImpulse((transform.rotation + 90 % 360), amount);
    };
    
    //TODO
    component.applyRotationForce = function(force) {
        body.ApplyTorque(force);
    };
    
    component.setVelocity = function(x, y) {
        body.SetLinearVelocity(new box2d.Vec2(x, y));
    };
    
    component.getVelocity = function() {
        return body.GetLinearVelocity();
    };

    //TODO: fill in API
    component.applyRotationImpulse = function(force, x, y) {};
    component.setAngularVelocity = function() {};
    component.getAngularVelocity = function() {};
    component.getInertia = function() {};
    component.teleport = function() {};
    
    component.reset = function() {
        //take into account potentially modified
        //component values - meaning change the fixture/body
        //reset mass data etc...
    };
    
    component.createBodyDefinition = function() {
        //create body definition
        bodyDef = new box2d.BodyDef();
        bodyDef.type = (component.static) ? box2d.Body.b2_staticBody : box2d.Body.b2_dynamicBody;
        bodyDef.position = transform.position;
        bodyDef.angle = transform.rotation;
        bodyDef.linearDamping = component.damping;
        bodyDef.angularDamping = component.angularDamping;
        bodyDef.fixedRotation = component.fixedRotation;
        bodyDef.bullet = component.bullet;
        bodyDef.userData = gameObject;
        
        return bodyDef;
    };
    
    component.createFixtureDefinition = function() {
        //create fixture definition
        fixtureDef = new box2d.FixtureDef();
        fixtureDef.density = component.density;
        fixtureDef.restitution = component.restitution;
        fixtureDef.friction = component.friction;
//        fixtureDef.mass = component.mass;

        //set the fixture's shape - oooh boy.
        fixtureDef.shape = component.createFixtureShape();
        
        return fixtureDef;
    };
    
    //this mostly taken from gritsgame source - thanks!
    component.createFixtureShape = function() {
        //TODO: take into account scaling
        var shape;
        
        if (component.radius) {
            shape = new box2d.CircleShape(component.radius);
        } else if (component.shape) {
            var points = component.shape;
            var vecs = [];
            for (var i = 0; i < points.length; i++) {
              var vec = new box2d.Vec2();
              vec.Set(points[i].x, points[i].y);
              vecs[i] = vec;
            }
            shape = new box2d.PolygonShape();
            shape.SetAsArray(vecs, vecs.length);
            return shape;
        } else {
            if (component.height && component.width) {
                shape = new box2d.PolygonShape();
                shape.SetAsBox(component.width * 0.5, component.height * 0.5);
                return shape;
            } else if (gameObject.hasComponent('sprite')) {
                var img = gameObject.getComponent('sprite').image;
                if (img) {
                    shape = new box2d.PolygonShape();
                    shape.SetAsBox(img.width * 0.5, img.height * 0.5);
                    return shape;
                } else {
                    throw new Error("Cannot create rigidbody shape.");
                }
            } else {
                throw new Error("Cannot create rigidbody shape.");
            }
        }
    };
    
    component.setBody = function(newBody) {
        body = newBody;
    };
    
    component.getBody = function() {
        return body;
    };
    
    component.setFixture = function(newFixture) {
        fixture = newFixture;
    };
    
    component.getFixture = function() {
        return fixture;
    };
    
    component.$on('engine.create', function() {
        //get references to stuff
        transform = gameObject.getComponent('transform2d');
        box2d = gameObject.engine.getPlugin('box2d');
        
    });
    
    component.$on('box2d.lateUpdate', function(deltaTime) {
        transform.position = body.GetPosition();
        transform.rotation = body.GetAngle();
    });
    
};
Javelin.Component.Rigidbody2d.alias = 'rigidbody2d';
Javelin.Component.Rigidbody2d.requires = ['transform2d'];
