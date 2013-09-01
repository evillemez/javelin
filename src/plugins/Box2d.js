/*global Box2D:true */

'use strict';

Javelin.Plugin.Box2d = function(plugin, config) {
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
	
	plugin.pixelsPerMeter = config.pixelsPerMeter || 50;
	plugin.metersPerPixel = 1 / plugin.pixelsPerMeter;
    
    if (Box2D) {
        //assign shortcut references to Box2D stuff
        plugin.Vec2 = Box2D.Common.Math.b2Vec2;
        plugin.BodyDef =  Box2D.Dynamics.b2BodyDef;
        plugin.Body =  Box2D.Dynamics.b2Body;
        plugin.FixtureDef =  Box2D.Dynamics.b2FixtureDef;
        plugin.Fixture =  Box2D.Dynamics.b2Fixture;
        plugin.World =  Box2D.Dynamics.b2World;
        plugin.MassData = Box2D.Collision.Shapes.b2MassData;
        plugin.PolygonShape =  Box2D.Collision.Shapes.b2PolygonShape;
        plugin.CircleShape = Box2D.Collision.Shapes.b2CircleShape;
        plugin.DebugDraw =  Box2D.Dynamics.b2DebugDraw;
        plugin.RevoluteJointDef =  Box2D.Dynamics.Joints.b2RevoluteJointDef;

        plugin.worldInstance = null;
        plugin.bodies = {};

        //TODO: explosion/implosion forces
        plugin.applyRadialForce = function(x, y, impulse, radius, implode, callback) {
            var center = new plugin.Vec2(x, y);
            var aa = new plugin.Vec2(x - radius, y - radius);
            var bb = new plugin.Vec2(x + radius, y + radius);
            var aabb = new Box2D.Collision.b2AABB();
            aabb.upperBound = bb;
            aabb.lowerBound = aa;
            
            plugin.worldInstance.QueryAABB(function(fixture) {
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
                body.ApplyImpulse(new plugin.Vec2(Math.cos(angle) * force, Math.sin(angle) * force), body.GetPosition());

                if (callback) {
                    callback(go);
                }

                return true;
                
            }, aabb);
        };

        plugin.raycast = function() {
            
        };

        plugin.$onLoad = function() {
            //setup world
            plugin.worldInstance = null;
            plugin.worldInstance = new plugin.World(new plugin.Vec2(gravityX, gravityY), allowSleep);
            
            
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
                plugin.callGoCallbacks(event, goA, goB, contact);
                plugin.callGoCallbacks(event, goB, goA, contact);
            };

            contactListener.EndContact = function(contact) {
                var goA = contact.GetFixtureA().GetBody().GetUserData();
                var goB = contact.GetFixtureB().GetBody().GetUserData();
                var isTrigger = (goA.getComponent('rigidbody2d').trigger || goB.getComponent('rigidbody2d').trigger);
                var event = (isTrigger) ? 'box2d.trigger.exit' : 'box2d.collision.exit';
                plugin.callGoCallbacks(event, goA, goB, contact);
                plugin.callGoCallbacks(event, goB, goA, contact);
            };

            contactListener.PostSolve = function(contact, manifold) {
                //do anything?
            };
            
            plugin.worldInstance.SetContactListener(contactListener);
            
            if (plugin.$engine && plugin.$engine.debug) {
                var debugDraw = new Box2D.Dynamics.b2DebugDraw();
                debugDraw.SetSprite(plugin.$engine.getPlugin('canvas2d').context);
            }
        };
        
        plugin.callGoCallbacks = function(name, goA, goB, contact) {
            var cbs = goA.getCallbacks(name);
            if (cbs.length) {
                for (var i in cbs) {
                    cbs[i](goB, contact);
                }
            }
        };
        
        plugin.$onPostUpdateStep = function(deltaTime) {
            var i, j, cbs;
            var gos = plugin.$engine.gos;
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
            
            if (plugin.$engine.time - lastTimeStepped >= stepsPerSecond) {
                plugin.worldInstance.Step(stepHZ, velocityIterations, positionIterations);
                
                if (clearForces) {
                    plugin.worldInstance.ClearForces();
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
        
        plugin.$onGameObjectCreate = function(gameObject) {
            var rigidbody = gameObject.getComponent('rigidbody2d');
            if (rigidbody) {
                var bodyDef = rigidbody.createBodyDefinition();
                var body = plugin.worldInstance.CreateBody(bodyDef);
                var fixtureDef = rigidbody.createFixtureDefinition();

                //TODO: set collision layer stuff on the fixtureDef.filter                

                var fixture = body.CreateFixture(fixtureDef);
                rigidbody.setFixture(fixture);
                rigidbody.setBody(body);
                                
                //storing references to all bodies (for now)
                plugin.bodies[gameObject.id] = body;
            }
        };
        
        plugin.$onGameObjectDestroy = function(gameObject) {
            var rigidbody = gameObject.getComponent('rigidbody2d');
            if (rigidbody) {
                plugin.worldInstance.DestroyBody(rigidbody.getBody());
            }
            
            //remove reference to body
            plugin.bodies[gameObject.id] = null;
        };
    }
};
Javelin.Plugin.Box2d.alias = 'box2d';
