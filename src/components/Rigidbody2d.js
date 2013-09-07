/*global Box2D:true */

'use strict';

/**
 * The `rigidbody2d` component provides a wrapper for methods in the Box2D API.
 * 
 * @author Evan Villemez
 */
javelin.component('rigidbody2d', function(entity, game) {
    var self = this;
    var box2d = game.getPlugin('box2d');
    //the gameObject's transform
    var transform = entity.get('transform2d');
    var debug = game.debug;
    
    //box2d stuff used internally
    var bodyDef = null;
    var fixtureDef = null;
    var body = null;
    var fixture = null;    
    
    //these values are applied to the box2d fixture definition
    this.trigger = false;
    this.static = false;
    this.bullet = false;
    this.density = 0.5;
    this.friction = 0.3;
    this.restitution = 0.4;
    this.damping = 0.2;
    this.angularDamping = 0.3;
    this.fixedRotation = false;
    this.radius = null;
    this.shape = null; //array of custom shape points
    this.height = null;
    this.width = null;
    
	this.setPosition = function(x, y) {
		body.SetPosition(new box2d.Vec2(x * box2d.metersPerPixel, y * box2d.metersPerPixel));
	};
	
    this.applyForce = function(degrees, power) {
        body.ApplyForce(new box2d.Vec2(Math.cos(degrees * Javelin.PI_OVER_180) * power, Math.sin(degrees * Javelin.PI_OVER_180) * power), body.GetWorldCenter());
    };

    this.applyForceForward = function(amount) {
        self.applyForce(transform.rotation, amount);
    };

    this.applyForceBackward = function(amount) {
        self.applyForce((transform.rotation + 180 % 360), amount);
    };

    this.applyForceLeft = function(amount) {
        self.applyForce((transform.rotation - 90 % 360), amount);
    };

    this.applyForceRight = function(amount) {
        self.applyForce((transform.rotation + 90 % 360), amount);
    };

    this.applyImpulse = function(degrees, power) {
        body.ApplyImpulse(new box2d.Vec2(Math.cos(degrees * Javelin.PI_OVER_180) * power, Math.sin(degrees * Javelin.PI_OVER_180) * power), body.GetWorldCenter());
    };

    this.applyImpulseForward = function(amount) {
        self.applyImpulse(transform.rotation, amount);
    };

    this.applyImpulseBackward = function(amount) {
        self.applyImpulse((transform.rotation + 180 % 360), amount);
    };

    this.applyImpulseLeft = function(amount) {
        self.applyImpulse((transform.rotation - 90 % 360), amount);
    };

    this.applyImpulseRight = function(amount) {
        self.applyImpulse((transform.rotation + 90 % 360), amount);
    };
    
    this.applyRotationForce = function(force) {
        body.ApplyTorque(force);
    };
    
    this.applyRotationImpulse = function(force) {
        //TODO - is this available?
    };

    this.setVelocity = function(degrees, amount) {
        body.SetLinearVelocity(new box2d.Vec2(Math.cos(degrees * Javelin.PI_OVER_180) * amount, Math.sin(degrees * Javelin.PI_OVER_180) * amount));
    };
    
    this.setVelocityForward = function(amount) {
        self.setVelocity(transform.rotation, amount);
    };
    this.setVelocityBackward = function(amount) {
        self.setVelocity((transform.rotation + 180 % 360), amount);
    };
    this.setVelocityLeft = function(amount) {
        self.setVelocity((transform.rotation - 90 % 360), amount);
    };
    this.setVelocityRight = function(amount) {
        self.setVelocity((transform.rotation + 90 % 360), amount);
    };
    
    this.getVelocity = function() {
        return body.GetLinearVelocity();
    };

    //TODO: fill in API
    this.setAngularVelocity = function() {};
    this.getAngularVelocity = function() {};
    this.getInertia = function() {};
    this.teleport = function() {};
    
    this.reset = function() {
        //take into account potentially modified
        //component values - meaning change the fixture/body
        //reset mass data etc...
    };
    
    this.createBodyDefinition = function() {
        //create body definition
        bodyDef = new box2d.BodyDef();
        bodyDef.type = (self.static) ? box2d.Body.b2_staticBody : box2d.Body.b2_dynamicBody;
        bodyDef.position.x = transform.position.y * box2d.metersPerPixel;
        bodyDef.position.y = transform.position.y * box2d.metersPerPixel;
        bodyDef.angle = transform.rotation;
        bodyDef.linearDamping = self.damping;
        bodyDef.angularDamping = self.angularDamping;
        bodyDef.fixedRotation = self.fixedRotation;
        bodyDef.bullet = self.bullet;
        bodyDef.userData = gameObject;
        
        return bodyDef;
    };
    
    this.createFixtureDefinition = function() {
        //create fixture definition
        fixtureDef = new box2d.FixtureDef();
        fixtureDef.density = self.density;
        fixtureDef.restitution = self.restitution;
        fixtureDef.friction = self.friction;
        if (self.trigger) {
            fixtureDef.isSensor = true;
        }
//        fixtureDef.mass = this.mass;

        //set the fixture's shape - oooh boy.
        fixtureDef.shape = self.createFixtureShape();
        
        return fixtureDef;
    };
    
    //this mostly taken from gritsgame source - thanks!
    this.createFixtureShape = function() {
        //TODO: take into account scaling, or just not allow?
        var shape;
        
        if (self.radius) {
            shape = new box2d.CircleShape(self.radius * box2d.metersPerPixel);
            return shape;
        } else if (self.shape) {
            var points = self.shape;
            var vecs = [];
            for (var i = 0; i < points.length; i++) {
                var vec = new box2d.Vec2();
                vec.Set(points[i].x * box2d.metersPerPixel, points[i].y * box2d.metersPerPixel);
                vecs[i] = vec;
            }
            shape = new box2d.PolygonShape();
            shape.SetAsArray(vecs, vecs.length);
            return shape;
        } else {
            if (self.height && self.width) {
                shape = new box2d.PolygonShape();
                shape.SetAsBox(self.width * 0.5 * box2d.metersPerPixel, self.height * 0.5 * box2d.metersPerPixel);
                return shape;
            } else if (entity.hasComponent('sprite')) {
                var img = entity.getComponent('sprite').image;
                if (img) {
                    shape = new box2d.PolygonShape();
                    shape.SetAsBox(img.width * 0.5 * box2d.metersPerPixel, img.height * 0.5 * box2d.metersPerPixel);
                    return shape;
                } else {
                    throw new Error("Cannot create rigidbody shape.");
                }
            } else {
                throw new Error("Cannot create rigidbody shape.");
            }
        }
    };
    
    this.setBody = function(newBody) {
        body = newBody;
    };
    
    this.getBody = function() {
        return body;
    };
    
    this.setFixture = function(newFixture) {
        fixture = newFixture;
    };
    
    this.getFixture = function() {
        return fixture;
    };
    
    this.updateLocation = function() {
        var pos = body.GetPosition();
        transform.position.x = pos.x * box2d.pixelsPerMeter;
        transform.position.y = pos.y * box2d.pixelsPerMeter;
        if (!self.fixedRotation) {
            transform.rotation = body.GetAngle();
        }
    };
    
    this.$on('engine.create', function() {
        //get references to stuff
        transform = entity.getComponent('transform2d');
        box2d = game.getPlugin('box2d');
        body.SetPosition(new box2d.Vec2(transform.position.x * box2d.metersPerPixel, transform.position.y * box2d.metersPerPixel));
        body.SetAngle(transform.rotation);
        body.ResetMassData();
    });
    
    this.$on('box2d.lateUpdate', function(deltaTime) {
        self.updateLocation();
    });
    
    if (debug) {
        this.$on('canvas2d.draw', function(context, camera) {
            context.save();
            context.translate(transform.position.x, transform.position.y);
            context.rotate(transform.rotation * Javelin.PI_OVER_180);
            context.strokeStyle = self.trigger ? '#FF0' : '#0F0';

            //draw center of transform
            context.beginPath();
            context.arc(0, 0, 3, 0, 2 * Math.PI, true);
            context.closePath();
            context.stroke();

            //draw sprite image bounding box
            if (self.image) {
                var img = self.image;
                var topLeftX = 0 - (img.width * 0.5);
                var topLeftY = 0 - (img.height * 0.5);
                var height = img.height;
                var width = img.width;
        
                context.strokeRect(topLeftX, topLeftY, width, height);
            }
            
            if (self.radius) {
                context.beginPath();
                context.arc(0, 0, self.radius, 0, 2 * Math.PI, true);
                context.closePath();
                context.stroke();
            } else if (self.height && self.width) {
                context.strokeRect(
                    -self.width * 0.5,
                    -self.height * 0.5,
                    self.width,
                    self.height
                );
            } else if (self.shape) {
                //TODO
            }
            
            context.restore();
        });
    }
    
}, ['transform2d']);
