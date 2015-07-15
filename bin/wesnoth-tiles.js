var WesnothTiles;
(function (WesnothTiles) {
    'use strict';
    var MapBuilder = (function () {
        function MapBuilder($mapId, $loadingMode) {
            this.$mapId = $mapId;
            this.$loadingMode = $loadingMode;
            this.$tileChanges = [];
        }
        MapBuilder.prototype.setTile = function (q, r, terrain, overlay, fog) {
            if (terrain === void 0) { terrain = undefined; }
            if (overlay === void 0) { overlay = 62 /* NONE */; }
            if (fog === void 0) { fog = false; }
            this.$tileChanges.push({ q: q, r: r, terrain: terrain, overlay: overlay, fog: fog });
            return this;
        };
        // Unsets given hex. Overlay is cleared too.
        // It is not an equivalent of setting terrain to Void.
        // A 'rebuild' call is needed to actually display the change.}
        MapBuilder.prototype.unsetTile = function (q, r) {
            // We messages sent to the worker just have terrain as undefined.
            return this.setTile(q, r);
        };
        // When this promise is resolved, a rebuild call might be executed.
        MapBuilder.prototype.promise = function () {
            return WesnothTiles.Internal.sendCommand("setTiles", {
                loadingMode: this.$loadingMode,
                tileChanges: this.$tileChanges,
                mapId: this.$mapId
            });
        };
        return MapBuilder;
    })();
    WesnothTiles.MapBuilder = MapBuilder;
    WesnothTiles.pointToHexPos = function (x, y) {
        y = y / radius;
        var t1 = (x + halfRadius) / halfRadius;
        var t2 = Math.floor(y + t1);
        var q = Math.floor((Math.floor(t1 - y) + t2) / 3);
        var r = Math.floor((Math.floor(2 * y + 1) + t2) / 3) - q;
        return {
            q: Math.floor(q),
            r: Math.floor(r)
        };
    };
    WesnothTiles.hexToPoint = function (q, r) {
        return {
            x: q * radius * 3 / 4,
            y: r * radius + q * halfRadius
        };
    };
    var radius = 72;
    var halfRadius = radius / 2;
    var loadingPromise = undefined;
    var lastId = 0;
    var createLoadingPromise = function () {
        if (loadingPromise !== undefined)
            return;
        loadingPromise = WesnothTiles.Internal.loadResources().then(function () {
            WesnothTiles.Internal.loadWorker();
            var keys = [];
            WesnothTiles.Internal.definitions.forEach(function (val, key) {
                keys.push(key);
            });
            return keys;
        }).then(function (keys) { return WesnothTiles.Internal.sendCommand("init", keys); });
    };
    // Singleton creating map objects. It ensures that loading is already done before you can use a map.
    WesnothTiles.createMap = function () {
        if (loadingPromise === undefined) {
            createLoadingPromise();
        }
        return loadingPromise.then(function () {
            var map = new TilesMap(lastId);
            lastId++;
            return map;
        });
    };
    WesnothTiles.load = function () {
        createLoadingPromise();
        return loadingPromise;
    };
    var TilesMap = (function () {
        function TilesMap($mapId) {
            this.$mapId = $mapId;
            this.drawables = [];
            this.workerId = 0;
        }
        // Clears the map.
        TilesMap.prototype.clear = function () {
            return WesnothTiles.Internal.sendCommand("clear", this.$mapId);
        };
        // Rebuilds the map. Following calls to redraw will draw the resulting map.
        TilesMap.prototype.rebuild = function () {
            var _this = this;
            return WesnothTiles.Internal.sendCommand("rebuild", this.$mapId).then(function (drawableDatas) {
                _this.drawables = [];
                drawableDatas.forEach(function (drawableData) {
                    _this.drawables.push(new WesnothTiles.Internal.Drawable(drawableData.x, drawableData.y, drawableData.name, drawableData.frames, drawableData.duration));
                });
            });
        };
        // Rebuilds, then calculates the checksum. Build results are discarded.
        TilesMap.prototype.getCheckSum = function () {
            return WesnothTiles.Internal.sendCommand("getChecksum", this.$mapId);
        };
        // Draws map onto the canvas. Best used in Animation Frame.
        TilesMap.prototype.redraw = function (ctx, projection, timestamp) {
            this.drawables.forEach(function (drawable) {
                drawable.draw(projection, ctx, timestamp);
            });
            if (this.cursor !== undefined) {
                this.cursor.draw(projection, ctx, timestamp);
            }
        };
        // Creates instance of MapBuilder. LoadingMode argument is worth seting 
        // When you plan to load bigger chunks of tiles at once.
        TilesMap.prototype.getBuilder = function (loadingMode) {
            if (loadingMode === void 0) { loadingMode = false; }
            return new MapBuilder(this.$mapId, loadingMode);
        };
        TilesMap.prototype.moveCursor = function (x, y) {
            if (this.cursor === undefined)
                return;
            var hexPos = WesnothTiles.pointToHexPos(x, y);
            this.cursor.x = halfRadius * 1.5 * hexPos.q;
            this.cursor.y = halfRadius * (2 * hexPos.r + hexPos.q);
        };
        TilesMap.prototype.setCursorVisibility = function (visible, mapName) {
            if (mapName === void 0) { mapName = "default"; }
            this.cursor = visible ? new WesnothTiles.Internal.Drawable(0, 0, "hover-hex", undefined, undefined) : undefined;
        };
        return TilesMap;
    })();
    WesnothTiles.TilesMap = TilesMap;
})(WesnothTiles || (WesnothTiles = {}));
var WesnothTiles;
(function (WesnothTiles) {
    (function (ETerrain) {
        ETerrain[ETerrain["GRASS_GREEN"] = 0] = "GRASS_GREEN";
        ETerrain[ETerrain["GRASS_SEMI_DRY"] = 1] = "GRASS_SEMI_DRY";
        ETerrain[ETerrain["GRASS_DRY"] = 2] = "GRASS_DRY";
        ETerrain[ETerrain["GRASS_LEAF_LITTER"] = 3] = "GRASS_LEAF_LITTER";
        ETerrain[ETerrain["HILLS_REGULAR"] = 4] = "HILLS_REGULAR";
        ETerrain[ETerrain["HILLS_DRY"] = 5] = "HILLS_DRY";
        ETerrain[ETerrain["HILLS_DESERT"] = 6] = "HILLS_DESERT";
        ETerrain[ETerrain["HILLS_SNOW"] = 7] = "HILLS_SNOW";
        ETerrain[ETerrain["MOUNTAIN_BASIC"] = 8] = "MOUNTAIN_BASIC";
        ETerrain[ETerrain["MOUNTAIN_DRY"] = 9] = "MOUNTAIN_DRY";
        ETerrain[ETerrain["MOUNTAIN_SNOW"] = 10] = "MOUNTAIN_SNOW";
        ETerrain[ETerrain["MOUNTAIN_VOLCANO"] = 11] = "MOUNTAIN_VOLCANO";
        ETerrain[ETerrain["FROZEN_SNOW"] = 12] = "FROZEN_SNOW";
        ETerrain[ETerrain["FROZEN_ICE"] = 13] = "FROZEN_ICE";
        ETerrain[ETerrain["SAND_BEACH"] = 14] = "SAND_BEACH";
        ETerrain[ETerrain["SAND_DESERT"] = 15] = "SAND_DESERT";
        ETerrain[ETerrain["SWAMP_MUD"] = 16] = "SWAMP_MUD";
        ETerrain[ETerrain["SWAMP_WATER"] = 17] = "SWAMP_WATER";
        ETerrain[ETerrain["WATER_OCEAN"] = 18] = "WATER_OCEAN";
        ETerrain[ETerrain["WATER_COAST_TROPICAL"] = 19] = "WATER_COAST_TROPICAL";
        ETerrain[ETerrain["ABYSS"] = 20] = "ABYSS";
        ETerrain[ETerrain["VOID"] = 21] = "VOID"; // Xv 21
    })(WesnothTiles.ETerrain || (WesnothTiles.ETerrain = {}));
    var ETerrain = WesnothTiles.ETerrain;
    (function (EOverlay) {
        EOverlay[EOverlay["WOODS_PINE"] = 22] = "WOODS_PINE";
        EOverlay[EOverlay["SNOW_FOREST"] = 23] = "SNOW_FOREST";
        EOverlay[EOverlay["JUNGLE"] = 24] = "JUNGLE";
        EOverlay[EOverlay["PALM_DESERT"] = 25] = "PALM_DESERT";
        EOverlay[EOverlay["RAINFOREST"] = 26] = "RAINFOREST";
        EOverlay[EOverlay["SAVANNA"] = 27] = "SAVANNA";
        EOverlay[EOverlay["DECIDUOUS_SUMMER"] = 28] = "DECIDUOUS_SUMMER";
        EOverlay[EOverlay["DECIDUOUS_FALL"] = 29] = "DECIDUOUS_FALL";
        EOverlay[EOverlay["DECIDUOUS_WINTER"] = 30] = "DECIDUOUS_WINTER";
        EOverlay[EOverlay["DECIDUOUS_WINTER_SNOW"] = 31] = "DECIDUOUS_WINTER_SNOW";
        EOverlay[EOverlay["MIXED_SUMMER"] = 32] = "MIXED_SUMMER";
        EOverlay[EOverlay["MIXED_FALL"] = 33] = "MIXED_FALL";
        EOverlay[EOverlay["MIXED_WINTER"] = 34] = "MIXED_WINTER";
        EOverlay[EOverlay["MIXED_WINTER_SNOW"] = 35] = "MIXED_WINTER_SNOW";
        EOverlay[EOverlay["MUSHROOMS"] = 36] = "MUSHROOMS";
        EOverlay[EOverlay["FARM_VEGS"] = 37] = "FARM_VEGS";
        EOverlay[EOverlay["FLOWERS_MIXED"] = 38] = "FLOWERS_MIXED";
        EOverlay[EOverlay["RUBBLE"] = 39] = "RUBBLE";
        EOverlay[EOverlay["STONES_SMALL"] = 40] = "STONES_SMALL";
        EOverlay[EOverlay["OASIS"] = 41] = "OASIS";
        EOverlay[EOverlay["DETRITUS"] = 42] = "DETRITUS";
        EOverlay[EOverlay["LITER"] = 43] = "LITER";
        EOverlay[EOverlay["TRASH"] = 44] = "TRASH";
        EOverlay[EOverlay["VILLAGE_HUMAN"] = 45] = "VILLAGE_HUMAN";
        EOverlay[EOverlay["VILLAGE_HUMAN_RUIN"] = 46] = "VILLAGE_HUMAN_RUIN";
        EOverlay[EOverlay["VILLAGE_HUMAN_CITY"] = 47] = "VILLAGE_HUMAN_CITY";
        EOverlay[EOverlay["VILLAGE_HUMAN_CITY_RUIN"] = 48] = "VILLAGE_HUMAN_CITY_RUIN";
        EOverlay[EOverlay["VILLAGE_TROPICAL"] = 49] = "VILLAGE_TROPICAL";
        EOverlay[EOverlay["VILLAGE_HUT"] = 50] = "VILLAGE_HUT";
        EOverlay[EOverlay["VILLAGE_LOG_CABIN"] = 51] = "VILLAGE_LOG_CABIN";
        EOverlay[EOverlay["VILLAGE_CAMP"] = 52] = "VILLAGE_CAMP";
        EOverlay[EOverlay["VILLAGE_IGLOO"] = 53] = "VILLAGE_IGLOO";
        EOverlay[EOverlay["VILLAGE_ORC"] = 54] = "VILLAGE_ORC";
        EOverlay[EOverlay["VILLAGE_ELVEN"] = 55] = "VILLAGE_ELVEN";
        EOverlay[EOverlay["VILLAGE_DESERT"] = 56] = "VILLAGE_DESERT";
        EOverlay[EOverlay["VILLAGE_DESERT_CAMP"] = 57] = "VILLAGE_DESERT_CAMP";
        EOverlay[EOverlay["VILLAGE_DWARVEN"] = 58] = "VILLAGE_DWARVEN";
        EOverlay[EOverlay["VILLAGE_SWAMP"] = 59] = "VILLAGE_SWAMP";
        EOverlay[EOverlay["VILLAGE_COAST"] = 60] = "VILLAGE_COAST";
        EOverlay[EOverlay["DESERT_PLANTS"] = 61] = "DESERT_PLANTS";
        EOverlay[EOverlay["NONE"] = 62] = "NONE";
    })(WesnothTiles.EOverlay || (WesnothTiles.EOverlay = {}));
    var EOverlay = WesnothTiles.EOverlay;
})(WesnothTiles || (WesnothTiles = {}));
var WesnothTiles;
(function (WesnothTiles) {
    var Internal;
    (function (Internal) {
        'use strict';
        var DrawableData = (function () {
            function DrawableData(x, y, name, layer, base, frames, duration) {
                this.x = x;
                this.y = y;
                this.name = name;
                this.layer = layer;
                this.base = base;
                this.frames = frames;
                this.duration = duration;
            }
            DrawableData.prototype.toString = function () {
                if (this.duration === undefined)
                    return this.name + this.layer + ',' + this.x + ',' + this.y;
                else
                    return this.name + this.duration + this.layer + ',' + this.x + ',' + this.y;
            };
            return DrawableData;
        })();
        Internal.DrawableData = DrawableData;
    })(Internal = WesnothTiles.Internal || (WesnothTiles.Internal = {}));
})(WesnothTiles || (WesnothTiles = {}));
var WesnothTiles;
(function (WesnothTiles) {
    var Internal;
    (function (Internal) {
        'use strict';
        // This file is responsible for the loading of the graphics.
        var atlases = new Map();
        Internal.definitions = new Map();
        var provideAtlas = function (name) {
            var img = new Image();
            var promises = [];
            promises.push(new Promise(function (resolve, reject) {
                img.src = name + ".png";
                img.onload = function () {
                    if (atlases.has(name)) {
                        console.error("That atlas was already loaded!", name);
                        return;
                    }
                    atlases.set(name, img);
                    console.log("atlas loaded!!", name);
                    resolve();
                };
                img.onerror = function () {
                    reject();
                };
            }));
            promises.push(new Promise(function (resolve, reject) {
                var req = new XMLHttpRequest();
                req.open('GET', name + ".json", true);
                req.onreadystatechange = function (aEvt) {
                    if (req.readyState == 4) {
                        if (req.status == 200) {
                            var frames = JSON.parse(req.responseText);
                            console.log(frames);
                            resolve(frames);
                        }
                        else
                            reject();
                    }
                };
                req.send(null);
            }).then(function (frames) {
                frames.frames.forEach(function (d) {
                    var def = new Internal.SpriteDefinition({
                        point: { x: d.frame.x, y: d.frame.y },
                        size: { x: d.frame.w, y: d.frame.h }
                    }, {
                        point: { x: d.spriteSourceSize.x, y: d.spriteSourceSize.y },
                        size: { x: d.spriteSourceSize.w, y: d.spriteSourceSize.h }
                    }, { x: d.sourceSize.w, y: d.sourceSize.h }, img);
                    if (Internal.definitions.has(d.filename)) {
                        console.error("Frame name already included!", def);
                        return;
                    }
                    Internal.definitions.set(d.filename, def);
                });
            }));
            return Promise.all(promises).then(function () {
            });
        };
        // Will return promise when they are supported;) (by ArcticTypescript)
        Internal.loadResources = function () {
            var promises = [];
            for (var i = 0; i < 2; i++) {
                promises.push(provideAtlas("hexes_" + i));
            }
            return Promise.all(promises).then(function () {
            });
        };
    })(Internal = WesnothTiles.Internal || (WesnothTiles.Internal = {}));
})(WesnothTiles || (WesnothTiles = {}));
/// <reference path="Resources.ts"/>
var WesnothTiles;
(function (WesnothTiles) {
    var Internal;
    (function (Internal) {
        'use strict';
        var Drawable = (function () {
            function Drawable(x, y, name, frames, duration) {
                this.x = x;
                this.y = y;
                this.name = name;
                this.frames = frames;
                this.duration = duration;
            }
            Drawable.prototype.draw = function (projection, ctx, timestamp) {
                var sprite;
                if (this.duration === undefined) {
                    sprite = Internal.definitions.get(this.name);
                    if (sprite === undefined) {
                        console.error("Undefined sprite", this.name);
                    }
                    if (this.x > projection.right + sprite.size().x / 2 || this.y > projection.bottom + sprite.size().y / 2 || this.x + sprite.size().x / 2 < projection.left || this.y + sprite.size().y / 2 < projection.top)
                        return;
                    sprite.draw(this.x - projection.left, this.y - projection.top, ctx);
                    return;
                }
                else {
                    var frame = 1 + Math.floor(timestamp / this.duration) % this.frames;
                    var frameString = "A" + (frame >= 10 ? frame.toString() : ("0" + frame.toString()));
                    sprite = Internal.definitions.get(this.name.replace("@A", frameString));
                }
                // Check if we really need to draw the sprite, maybe it is outside of the drawing area.
                if (this.x > projection.right + sprite.size().x / 2 || this.y > projection.bottom + sprite.size().y / 2 || this.x + sprite.size().x / 2 < projection.left || this.y + sprite.size().y / 2 < projection.top)
                    return;
                if (sprite === undefined) {
                    console.error("Undefined sprite", this.name, this);
                }
                sprite.draw(this.x + projection.x - projection.left, this.y + projection.y - projection.top, ctx);
            };
            return Drawable;
        })();
        Internal.Drawable = Drawable;
    })(Internal = WesnothTiles.Internal || (WesnothTiles.Internal = {}));
})(WesnothTiles || (WesnothTiles = {}));
/// <reference path="Resources.ts"/>
var WesnothTiles;
(function (WesnothTiles) {
    var Internal;
    (function (Internal) {
        'use strict';
        var SpriteDefinition = (function () {
            function SpriteDefinition(frame, spriteSource, sourceSize, atlas) {
                this.frame = frame;
                this.spriteSource = spriteSource;
                this.sourceSize = sourceSize;
                this.atlas = atlas;
            }
            SpriteDefinition.prototype.draw = function (x, y, ctx) {
                ctx.drawImage(this.atlas, this.frame.point.x, this.frame.point.y, this.frame.size.x, this.frame.size.y, x + this.spriteSource.point.x - this.sourceSize.x / 2, y + this.spriteSource.point.y - this.sourceSize.y / 2, this.frame.size.x, this.frame.size.y);
            };
            SpriteDefinition.prototype.size = function () {
                return this.sourceSize;
            };
            return SpriteDefinition;
        })();
        Internal.SpriteDefinition = SpriteDefinition;
    })(Internal = WesnothTiles.Internal || (WesnothTiles.Internal = {}));
})(WesnothTiles || (WesnothTiles = {}));
var WesnothTiles;
(function (WesnothTiles) {
    var Internal;
    (function (Internal) {
        'use strict';
        var id = 0;
        var deferreds = new Map();
        var worker;
        Internal.loadWorker = function () {
            worker = new Worker("worker.js");
            worker.onmessage = function (obj) {
                var response = obj.data;
                if (deferreds.has(response.id)) {
                    deferreds.get(response.id).resolve(response.data);
                    deferreds.delete(response.id);
                }
            };
        };
        Internal.sendCommand = function (commandName, params) {
            return new Promise(function (resolve, reject) {
                deferreds.set(id, {
                    resolve: resolve,
                    reject: reject
                });
                worker.postMessage({
                    id: id,
                    func: commandName,
                    data: params
                });
                id++;
            });
        };
    })(Internal = WesnothTiles.Internal || (WesnothTiles.Internal = {}));
})(WesnothTiles || (WesnothTiles = {}));
/// <reference path="../common/interfaces.ts"/>
/// <reference path="internal/Drawable.ts"/>
/// <reference path="internal/SpriteDefinition.ts"/>
/// <reference path="internal/Resources.ts"/>
/// <reference path="internal/WorkerCommander.ts"/>
/// <reference path="TilesMap.ts"/> 
