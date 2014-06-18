/*global PIXI: true */

/**
 * A base component for any renderable object.  Provides some basic asset loading
 * shortcuts and the base API required by the plugin to manage renderable objects.
 *
 * This component also takes care of managing the PIXI parent/child relationships
 * for renderable objects.  Thus, any renderable should assume it is wrapping an
 * instance of a `PIXI.DisplayObjectContainer`.
 *
 * @type component
 * @apidoc packages.pixi.components.renderable.html
 */
javelin.component('pixi.renderable', ['transform2d'], function(entity, engine) {

    /**
     * @var {String} The name of the layer this entity should be assigned to.  "default" unless
     * otherwise specified
     */
    this.layer = 'default';

    /**
     * How the entity should be culled.  By default, if the top-level renderable is not visible
     * on the layer, then all children will be hidden as well.
     *
     * If set to "self", each individual child will be checked independently for culling. Only
     * use this if you have to.
     *
     * @var {string} "container" or "self"
     */
    this.cullMode = 'container';

    /**
     * Boundaries for culling - some types of renderables can set this automaticall, for example sprites. However,
     * you may need to set this manually for certain types of renderables, such as PIXI.Graphics, which can contain
     * arbitrary dimensions.
     */
    this.cullBoundry = {
        x: 0,
        y: 0
    };

    this.assetPaths = [];
    this.assets = [];

    //private references
    var self = this
        , myDisplayObject = null
        , myTransform = null
        , layer = null
        , parentRenderable = null
        , parentDisplayObject = null
        , plugin = null
    ;

    /**
     * Set a pixi display object.  This would be any object that gets added to a pixi "stage". Any
     * other component that defines a PIXI DisplayObject should use this method during the
     * `entity.create` phase to set the display object.
     */
    this.setDisplayObject = function(obj) {
        myDisplayObject = obj;
    };

    /**
     * Get the pixi display object.  This will recursively check all
     * children for display objects and add them as child display objects.
     */
    this.getDisplayObject = function(rebuild) {
        rebuild = rebuild || false;

        //if already have it, return it
        if (!rebuild && myDisplayObject) {
            return myDisplayObject;
        }

        //check children for any renderables
        var l = entity.children.length;
        if (l) {
            for (var i = 0; i < l; i++) {
                var childRenderable = entity.children[i].get('pixi.renderable');
                if (childRenderable) {
                    myDisplayObject.addChild(childRenderable.getDisplayObject());
                }
            }
        }

        return myDisplayObject;
    };

    /**
     * Renderables can only be visisble on the layer of their parent - so if you add a renderable as a child of a
     * renderable on a different layer, that is the same as changing the layer of the child.
     */
    this.getLayer = function() {
        return (parentRenderable) ? parentRenderable.getLayer() : self.layer;
    };

    this.hide = function() { entity.broadcast('pixi.hide'); };
    this.show = function() { entity.broadcast('pixi.show'); };
    entity.on('pixi.hide', function() { myDisplayObject.visible = false; });
    entity.on('pixi.show', function() { myDisplayObject.visible = true; });

    /**
     * This method also updates the display object position by normalizing the display coordinates from
     * the game coordinates.
     */
    this.cull = function() {
        var camera = layer.getCamera();

        //normalize game to canvas coordinates
        var myPos = layer.normalizeCanvasPosition(myTransform.position.x, myTransform.position.y);
        myDisplayObject.position = myPos;
        myDisplayObject.rotation = myTransform.rotation;

        //return early if camera can't see this position and we should be culling all children
        var visible = camera.canSeePoint(myPos.x, myPos.y);    //TODO: change to test AABB visibility
        if (!visible && self.cullMode === 'container') {
            self.hide();
            return;
        }

        //show self or not
        if (!visible) {
            myDisplayObject.visible = false;
        } else {
            myDisplayObject.visible = true;
        }

        //cull renderable on each child
        //TODO: consider caching references to child renderable components
        var children = entity.children;
        var l = children.length;
        if (l) {
            for (var i = 0; i < l; i++) {
                var renderable = children[i].get('pixi.renderable');
                if (renderable) {
                    renderable.cull();
                }
            }
        }
    };

    entity.on('pixi.transform', function() {
        if (parentDisplayObject) {
            return;
        }

        self.cull();
    });

    entity.on('pixi.draw', function() {
        //TODO: anything necessary to do here?
    });

    /**
     * Loads any unloaded assets when the entity is instantiated.
     */
    entity.on('entity.create', function() {

        //load assets
        if (!self.assets.length) {
            self.disable();
          
            console.log('loading');
          
            engine.loadAssets(self.assetPaths, function(loaded) {
                self.assets = loaded;
                self.enable();
            });
        }

        //cache refence to parent components and displayObjects
        if (self.parent) {
            parentRenderable = self.parent.get('pixi.renderable');
            if (parentRenderable) {
                parentDisplayObject = parentRenderable.getDisplayObject();
            }
        }

        //cache reference to assigned layer
        plugin = engine.getPlugin('pixi');
        layer = plugin.getLayer(self.getLayer());
    });

    entity.on('entity.destroy', function() {
        if (parentRenderable) {
            parentRenderable.removeChild(myDisplayObject);
        }
    });

    entity.on('entity.enable', function() {
        if (myDisplayObject) {
            myDisplayObject.visible = true;
        }
    });

    entity.on('entity.disable', function() {
        if (myDisplayObject) {
            myDisplayObject.visible = false;
        }
    });

    entity.on('entity.parent', function(oldParent, newParent) {
        parentRenderable = null;
        parentDisplayObject = null;
        layer = plugin.getLayer(self.getLayer());

        if (oldParent) {
            var oldParentRenderable = oldParent.get('pixi.renderable');
            if (oldParentRenderable) {
                oldParentRenderable.removeChild(myDisplayObject);
            }
        }

        if (newParent) {
            var newParentRenderable = newParent.get('pixi.renderable');
            if (newParentRenderable) {
                parentDisplayObject = parentRenderable.getDisplayObject();
                newParentRenderable.addChild(myDisplayObject);
            }
        } else {
            //NOTE: this may be a bad idea - I'm not sure yet, will need to test extensively
            console.log('renderable adding to stage due to hierarchy change');
            layer.stage.addChild(myDisplayObject);
        }

    });
});
