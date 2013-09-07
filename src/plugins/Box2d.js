/*global Box2D:true */

'use strict';

javelin.plugin('box2d', function(config, game) {
    var self = this;
    //internal config w/ defaults
    var velocityIterations = config.velocityIterations || 10;
    var positionIterations = config.positionIterations || 10;
    var stepHZ = config.stepHZ || 1.0 / 30.0;
    var clearForces = config.clearForces || false;
    var stepHz = 1.0 / (config.stepsPerSecond || 1000/30);
    var stepsPerSecond = config.stepsPerSecond || 1000/30;
    var gravityX = config.gravityX || 0.0;
    var gravityY = config.gravityY || 0.0;
    var lastTimeStepped = Date.now();
    var allowSleep = config.allowSleep || false;
    
    this.pixelsPerMeter = config.pixelsPerMeter || 50;
    this.metersPerPixel = 1 / this.pixelsPerMeter;
    
    if (Box2D) {
        //assign shortcut references to Box2D stuff
        this.Vec2 = Box2D.Common.Math.b2Vec2;
        this.BodyDef =  Box2D.Dynamics.b2BodyDef;
        this.Body =  Box2D.Dynamics.b2Body;
        this.FixtureDef =  Box2D.Dynamics.b2FixtureDef;
        this.Fixture =  Box2D.Dynamics.b2Fixture;
        this.World =  Box2D.Dynamics.b2World;
        this.MassData = Box2D.Collision.Shapes.b2MassData;
        this.PolygonShape =  Box2D.Collision.Shapes.b2PolygonShape;
        this.CircleShape = Box2D.Collision.Shapes.b2CircleShape;
        this.DebugDraw =  Box2D.Dynamics.b2DebugDraw;
        this.RevoluteJointDef =  Box2D.Dynamics.Joints.b2RevoluteJointDef;

        this.worldInstance = null;
        this.bodies = {};

        //TODO: explosion/implosion forces
        this.applyRadialForce = function(x, y, impulse, radius, implode, callback) {
            var center = new this.Vec2(x, y);
            var aa = new this.Vec2(x - radius, y - radius);
            var bb = new this.Vec2(x + radius, y + radius);
            var aabb = new Box2D.Collision.b2AABB();
            aabb.upperBound = bb;
            aabb.lowerBound = aa;
            
            self.worldInstance.QueryAABB(function(fixture) {
                var body = fixture.GetBody();
                var go = body.GetUserData();
                var targetPos = body.GetPosition();
                
                //ignore sensors
                if (fixture.IsSensor()) {
                    return true;
                }
                
                //check actual radius
                var distance = Box2D.Common.Math.b2Math.Distance(center, body.GetPosition());
                if (distance >= radius) {
                    return true;
                }
                
                //figure out force
                var amount = radius - distance;
                var strength = amount / radius;
                var force = impulse * strength;
                
                //figure out angle to apply force (depends on whether or not this is exploding or imploding)
                var angle;
                if (implode) {
                    angle = Math.atan2(center.y - targetPos.y, center.x - targetPos.x);
                } else {
                    angle = Math.atan2(targetPos.y - center.y, targetPos.x - center.x);
                }
                body.ApplyImpulse(new this.Vec2(Math.cos(angle) * force, Math.sin(angle) * force), body.GetPosition());

                if (callback) {
                    callback(go);
                }

                return true;
                
            }, aabb);
        };

        this.raycast = function() {
            
        };

        this.$onLoad = function() {
            //setup world
            self.worldInstance = null;
            self.worldInstance = new self.World(new self.Vec2(gravityX, gravityY), allowSleep);
            
            
            //setup contact listener
            var contactListener = new Box2D.Dynamics.b2ContactListener();
            contactListener.PreSolve = function(contact, manifold) {
                //does anything need to happen here?
            };
            contactListener.BeginContact = function(contact) {
                var goA = contact.GetFixtureA().GetBody().GetUserData();
                var goB = contact.GetFixtureB().GetBody().GetUserData();
                var isTrigger = (goA.getComponent('rigidbody2d').trigger || goB.getComponent('rigidbody2d').trigger);
                var event = (isTrigger) ? 'box2d.trigger.enter' : 'box2d.collision.enter';
                self.callGoCallbacks(event, goA, goB, contact);
                self.callGoCallbacks(event, goB, goA, contact);
            };

            contactListener.EndContact = function(contact) {
                var goA = contact.GetFixtureA().GetBody().GetUserData();
                var goB = contact.GetFixtureB().GetBody().GetUserData();
                var isTrigger = (goA.getComponent('rigidbody2d').trigger || goB.getComponent('rigidbody2d').trigger);
                var event = (isTrigger) ? 'box2d.trigger.exit' : 'box2d.collision.exit';
                self.callGoCallbacks(event, goA, goB, contact);
                self.callGoCallbacks(event, goB, goA, contact);
            };

            contactListener.PostSolve = function(contact, manifold) {
                //do anything?
            };
            
            self.worldInstance.SetContactListener(contactListener);
            
            if (self.$engine && self.$engine.debug) {
                var debugDraw = new Box2D.Dynamics.b2DebugDraw();
                debugDraw.SetSprite(self.$engine.getPlugin('canvas2d').context);
            }
        };
        
        this.callGoCallbacks = function(name, goA, goB, contact) {
            var cbs = goA.getCallbacks(name);
            if (cbs.length) {
                for (var i in cbs) {
                    cbs[i](goB, contact);
                }
            }
        };
        
        this.$onPostUpdateStep = function(deltaTime) {
            var i, j, cbs;
            var gos = self.$engine.gos;
            for (i in gos) {
                if (gos[i].enabled) {
                    cbs = gos[i].getCallbacks('box2d.update');
                    if (cbs) {
                        for (j in cbs) {
                            cbs[j](lastTimeStepped);
                        }
                    }
                }
            }
            
            if (self.$engine.time - lastTimeStepped >= stepsPerSecond) {
                self.worldInstance.Step(stepHZ, velocityIterations, positionIterations);
                
                if (clearForces) {
                    self.worldInstance.ClearForces();
                }
                
                lastTimeStepped = Date.now();
            }

            for (i in gos) {
                if (gos[i].enabled) {
                    cbs = gos[i].getCallbacks('box2d.lateUpdate');
                    if (cbs) {
                        for (j in cbs) {
                            cbs[j](lastTimeStepped);
                        }
                    }
                }
            }
        };
        
        this.$onGameObjectCreate = function(gameObject) {
            var rigidbody = gameObject.getComponent('rigidbody2d');
            if (rigidbody) {
                var bodyDef = rigidbody.createBodyDefinition();
                var body = self.worldInstance.CreateBody(bodyDef);
                var fixtureDef = rigidbody.createFixtureDefinition();

                //TODO: set collision layer stuff on the fixtureDef.filter                

                var fixture = body.CreateFixture(fixtureDef);
                rigidbody.setFixture(fixture);
                rigidbody.setBody(body);
                                
                //storing references to all bodies (for now)
                self.bodies[gameObject.id] = body;
            }
        };
        
        this.$onGameObjectDestroy = function(gameObject) {
            var rigidbody = gameObject.getComponent('rigidbody2d');
            if (rigidbody) {
                self.worldInstance.DestroyBody(rigidbody.getBody());
            }
            
            //remove reference to body
            self.bodies[gameObject.id] = null;
        };
    }
});
