var WesnothTiles;
(function (WesnothTiles) {
    'use strict';
    const radius = 72;
    const halfRadius = radius / 2;
    class MapBuilder {
        constructor($mapId, $loadingMode) {
            this.$mapId = $mapId;
            this.$loadingMode = $loadingMode;
            this.$tileChanges = [];
        }
        setTile(q, r, terrain = undefined, overlay = WesnothTiles.EOverlay.NONE, fog = false) {
            this.$tileChanges.push({ q: q, r: r, terrain: terrain, overlay: overlay, fog: fog });
            return this;
        }
        // Unsets given hex. Overlay is cleared too.
        // It is not an equivalent of setting terrain to Void.
        // A 'rebuild' call is needed to actually display the change.}
        unsetTile(q, r) {
            // We messages sent to the worker just have terrain as undefined.
            return this.setTile(q, r);
        }
        // When this promise is resolved, a rebuild call might be executed.
        promise() {
            return WesnothTiles.Internal.sendCommand("setTiles", {
                loadingMode: this.$loadingMode,
                tileChanges: this.$tileChanges,
                mapId: this.$mapId
            });
        }
    }
    WesnothTiles.MapBuilder = MapBuilder;
    WesnothTiles.pointToHexPos = (x, y) => {
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
    WesnothTiles.hexToPoint = (q, r) => {
        return {
            x: q * radius * 3 / 4,
            y: r * radius + q * halfRadius
        };
    };
    let loadingPromise = undefined;
    const createLoadingPromise = () => {
        if (loadingPromise !== undefined)
            return;
        loadingPromise = WesnothTiles.Internal.loadResources().then(() => {
            WesnothTiles.Internal.loadWorker();
            var keys = [];
            WesnothTiles.Internal.definitions.forEach((val, key) => {
                keys.push(key);
            });
            return keys;
        }).then(keys => WesnothTiles.Internal.sendCommand("init", keys));
    };
    // Singleton creating map objects. It ensures that loading is already done before you can use a map.
    WesnothTiles.createMap = () => {
        if (loadingPromise === undefined) {
            createLoadingPromise();
        }
        return loadingPromise.then(() => {
            const map = new TilesMap();
            return map;
        });
    };
    WesnothTiles.config = {
        path: ""
    };
    WesnothTiles.init = (newConfig) => {
        Object.assign(WesnothTiles.config, newConfig);
    };
    class TilesMap {
        constructor() {
            this.drawables = [];
            this.workerId = 0;
            this.$mapId = TilesMap.lastId++;
        }
        // Clears the map.
        clear() {
            return WesnothTiles.Internal.sendCommand("clear", this.$mapId);
        }
        // Rebuilds the map. Following calls to redraw will draw the resulting map.
        rebuild() {
            return WesnothTiles.Internal.sendCommand("rebuild", this.$mapId).then(drawableDatas => {
                this.drawables = [];
                drawableDatas.forEach(drawableData => {
                    this.drawables.push(new WesnothTiles.Internal.Drawable(drawableData.x, drawableData.y, drawableData.name, drawableData.frames, drawableData.duration));
                });
            });
        }
        // Rebuilds, then calculates the checksum. Build results are discarded.
        getCheckSum() {
            return WesnothTiles.Internal.sendCommand("getChecksum", this.$mapId);
        }
        // Draws map onto the canvas. Best used in Animation Frame.
        redraw(ctx, projection, timestamp) {
            this.drawables.forEach(drawable => {
                drawable.draw(projection, ctx, timestamp);
            });
            if (this.cursor !== undefined) {
                this.cursor.draw(projection, ctx, timestamp);
            }
        }
        // Creates instance of MapBuilder. LoadingMode argument is worth seting 
        // When you plan to load bigger chunks of tiles at once.
        getBuilder(loadingMode = false) {
            return new MapBuilder(this.$mapId, loadingMode);
        }
        moveCursor(x, y) {
            if (this.cursor === undefined)
                return;
            var hexPos = WesnothTiles.pointToHexPos(x, y);
            this.cursor.x = halfRadius * 1.5 * hexPos.q;
            this.cursor.y = halfRadius * (2 * hexPos.r + hexPos.q);
        }
        setCursorVisibility(visible) {
            if (visible && this.cursor === undefined) {
                this.cursor = new WesnothTiles.Internal.Drawable(0, 0, "hover-hex", undefined, undefined);
            }
            else if (!visible && this.cursor !== undefined) {
                this.cursor = undefined;
            }
        }
    }
    TilesMap.lastId = 0;
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
        class DrawableData {
            constructor(x, y, name, layer, base, frames, duration) {
                this.x = x;
                this.y = y;
                this.name = name;
                this.layer = layer;
                this.base = base;
                this.frames = frames;
                this.duration = duration;
            }
            toString() {
                if (this.duration === undefined)
                    return this.name + this.layer + ',' + this.x + ',' + this.y;
                else
                    return this.name + this.duration + this.layer + ',' + this.x + ',' + this.y;
            }
        }
        Internal.DrawableData = DrawableData;
    })(Internal = WesnothTiles.Internal || (WesnothTiles.Internal = {}));
})(WesnothTiles || (WesnothTiles = {}));
var WesnothTiles;
(function (WesnothTiles) {
    var Internal;
    (function (Internal) {
        'use strict';
        // This file is responsible for the loading of the graphics.
        const atlases = new Map();
        Internal.definitions = new Map();
        const provideAtlas = (name) => {
            const img = new Image();
            const promises = [];
            promises.push(new Promise((resolve, reject) => {
                img.src = WesnothTiles.config.path + name + ".png";
                img.onload = () => {
                    if (atlases.has(name)) {
                        console.error("That atlas was already loaded!", name);
                        return;
                    }
                    atlases.set(name, img);
                    resolve();
                };
                img.onerror = () => {
                    reject();
                };
            }));
            promises.push(new Promise((resolve, reject) => {
                const req = new XMLHttpRequest();
                req.open('GET', WesnothTiles.config.path + name + ".json", true);
                req.onreadystatechange = function (aEvt) {
                    if (req.readyState == 4) {
                        if (req.status == 200) {
                            const frames = JSON.parse(req.responseText);
                            resolve(frames);
                        }
                        else
                            reject();
                    }
                };
                req.send(null);
            }).then((frames) => {
                frames.frames.forEach((d) => {
                    const def = new Internal.SpriteDefinition({
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
            return Promise.all(promises)
                .then(() => { });
        };
        Internal.loadResources = () => {
            const promises = [];
            for (let i = 0; i < 2; i++) {
                promises.push(provideAtlas("hexes_" + i));
            }
            return Promise.all(promises).then(() => { });
        };
    })(Internal = WesnothTiles.Internal || (WesnothTiles.Internal = {}));
})(WesnothTiles || (WesnothTiles = {}));
/// <reference path="Resources.ts"/>
var WesnothTiles;
(function (WesnothTiles) {
    var Internal;
    (function (Internal) {
        'use strict';
        class Drawable {
            constructor(x, y, name, frames, duration) {
                this.x = x;
                this.y = y;
                this.name = name;
                this.frames = frames;
                this.duration = duration;
            }
            draw(projection, ctx, timestamp) {
                let sprite;
                if (this.duration === undefined) {
                    sprite = Internal.definitions.get(this.name);
                    if (sprite === undefined) {
                        console.error("Undefined sprite", this.name);
                    }
                    if (this.x > projection.right + sprite.size().x / 2 || this.y > projection.bottom + sprite.size().y / 2
                        || this.x + sprite.size().x / 2 < projection.left || this.y + sprite.size().y / 2 < projection.top)
                        return;
                    sprite.draw(this.x + projection.x - projection.left, this.y + projection.y - projection.top, ctx);
                    return;
                }
                else {
                    const frame = 1 + Math.floor(timestamp / this.duration) % this.frames;
                    const frameString = "A" + (frame >= 10 ? frame.toString() : ("0" + frame.toString()));
                    sprite = Internal.definitions.get(this.name.replace("@A", frameString));
                }
                if (sprite === undefined) {
                    console.error("Undefined sprite", this.name, this);
                }
                // Check if we really need to draw the sprite, maybe it is outside of the drawing area.
                if (this.x > projection.right + sprite.size().x / 2 || this.y > projection.bottom + sprite.size().y / 2
                    || this.x + sprite.size().x / 2 < projection.left || this.y + sprite.size().y / 2 < projection.top)
                    return;
                sprite.draw(this.x + projection.x - projection.left, this.y + projection.y - projection.top, ctx);
            }
        }
        Internal.Drawable = Drawable;
    })(Internal = WesnothTiles.Internal || (WesnothTiles.Internal = {}));
})(WesnothTiles || (WesnothTiles = {}));
/// <reference path="Resources.ts"/>
var WesnothTiles;
(function (WesnothTiles) {
    var Internal;
    (function (Internal) {
        'use strict';
        class SpriteDefinition {
            constructor(frame, spriteSource, sourceSize, atlas) {
                this.frame = frame;
                this.spriteSource = spriteSource;
                this.sourceSize = sourceSize;
                this.atlas = atlas;
            }
            draw(x, y, ctx) {
                ctx.drawImage(this.atlas, this.frame.point.x, this.frame.point.y, this.frame.size.x, this.frame.size.y, x + this.spriteSource.point.x - this.sourceSize.x / 2, y + this.spriteSource.point.y - this.sourceSize.y / 2, this.frame.size.x, this.frame.size.y);
            }
            size() {
                return this.sourceSize;
            }
        }
        Internal.SpriteDefinition = SpriteDefinition;
    })(Internal = WesnothTiles.Internal || (WesnothTiles.Internal = {}));
})(WesnothTiles || (WesnothTiles = {}));
var WesnothTiles;
(function (WesnothTiles) {
    var Internal;
    (function (Internal) {
        'use strict';
        let id = 0;
        let worker;
        const deferreds = new Map();
        Internal.loadWorker = () => {
            const blob = new Blob([Internal.workerString], { type: 'application/javascript' });
            worker = new Worker(URL.createObjectURL(blob));
            worker.onmessage = (obj) => {
                const response = obj.data;
                if (deferreds.has(response.id)) {
                    deferreds.get(response.id).resolve(response.data);
                    deferreds.delete(response.id);
                }
            };
        };
        Internal.sendCommand = (commandName, params) => {
            return new Promise((resolve, reject) => {
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

// Template used for the worker to fit inside as a string (so it can be loaded immediately).

var WesnothTiles;
(function (WesnothTiles) {
    var Internal;
    (function (Internal) {
        'use strict';
        Internal.workerString = `// Drawing algoritm. Pretty complicated, although much simplified compared to Wesnoth (which is much more powerful).
var WesnothTiles;
(function (WesnothTiles) {
    var Worker;
    (function (Worker) {
        'use strict';
        const replaceRotation = (input, rot, rotations) => {
            if (rotations === undefined)
                return input;
            return rotations === undefined ? input : input.replace(\"@R0\", rotations[rot])
                .replace(\"@R1\", rotations[(rot + 1) % 6])
                .replace(\"@R2\", rotations[(rot + 2) % 6])
                .replace(\"@R3\", rotations[(rot + 3) % 6])
                .replace(\"@R4\", rotations[(rot + 4) % 6])
                .replace(\"@R5\", rotations[(rot + 5) % 6]);
        };
        const rotationsMap = new Map();
        const getRotatedPos = (pos, rot) => {
            if (rot === 0)
                return pos;
            return rotationsMap.get(rot).get(pos.q).get(pos.r);
        };
        const setFlags = (rot, rotations, set_no_flags, flags) => {
            if (set_no_flags !== undefined)
                for (let i = 0; i < set_no_flags.length; i++)
                    flags.set(replaceRotation(set_no_flags[i], rot, rotations), true);
        };
        const checkFlags = (rot, rotations, set_no_flags, flags) => {
            if (set_no_flags !== undefined)
                for (let i = 0; i < set_no_flags.length; i++)
                    if (flags.has(replaceRotation(set_no_flags[i], rot, rotations)))
                        return false;
            return true;
        };
        Worker.prepareRotations = () => {
            for (let rot = 0; rot < 6; rot++) {
                const rotMap = new Map();
                rotationsMap.set(rot, rotMap);
                for (let q = -1; q <= 1; q++) {
                    const iMap = new Map();
                    rotMap.set(q, iMap);
                    for (let r = -1; r <= 1; r++) {
                        const result = [0, 0, 0];
                        result[(6 - rot) % 3] = rot % 2 === 0 ? q : -q;
                        result[(7 - rot) % 3] = rot % 2 === 0 ? r : -r;
                        result[(8 - rot) % 3] = rot % 2 === 0 ? -q - r : q + r;
                        iMap.set(r, { q: result[0], r: result[1] });
                    }
                }
            }
        };
        const getImgName = (hex, img, tg, rot, translatedPostfix) => {
            let num = img.variations.length;
            for (;;) {
                num = hex.getRandom(0, num);
                let translatedName = tg.builder.toString(img.name, translatedPostfix);
                translatedName = translatedName.replace(\"@V\", img.variations[num]);
                if (Worker.spriteNames.has(translatedName)) {
                    return img.name.replace(\"@V\", img.variations[num]);
                }
                if (num === 0) {
                    return undefined;
                }
            }
        };
        const performRotatedTerrainGraphics = (tg, dp, rot = 0) => {
            if (tg.probability !== 100 && dp.hex.getRandom(0, 101) > tg.probability)
                return;
            for (let i = 0; i < tg.tiles.length; i++) {
                const tile = tg.tiles[i];
                const rotHex = getRotatedPos(tile, rot);
                const hexPosQ = dp.hex.q + rotHex.q;
                const hexPosR = dp.hex.r + rotHex.r;
                const hex = dp.hexMap.getHexP(hexPosQ, hexPosR);
                if (hex === undefined
                    || (tile.type !== undefined && !tile.type.has(hex.terrain))
                    || (tile.overlay !== undefined && !tile.overlay.has(hex.overlay))
                    || (tile.fog !== undefined && tile.fog !== hex.fog)
                    || !checkFlags(rot, tg.rotations, tile.set_no_flag, hex.flags))
                    return;
            }
            const drawableDatas = [];
            for (let j = 0; j < tg.images.length; j++) {
                const img = tg.images[j];
                const translatedPostfix = img.postfix !== undefined ? replaceRotation(img.postfix, rot, tg.rotations) : \"\";
                const imgName = getImgName(dp.hex, img, tg, rot, translatedPostfix);
                // console.log(\"Name\",imgName, img.name, translatedPostfix);
                if (imgName === undefined)
                    return;
                const drawPos = {
                    x: (36 * 1.5) * dp.hex.q - 36 + img.center.x,
                    y: 36 * (2 * dp.hex.r + dp.hex.q) - 36 + img.center.y
                };
                const newBase = img.base !== undefined ? {
                    x: drawPos.x,
                    y: drawPos.y
                } : undefined;
                drawableDatas.push(tg.builder.toDrawable(imgName, translatedPostfix, drawPos, img.layer, newBase));
            }
            for (let i = 0; i < tg.tiles.length; i++) {
                const tile = tg.tiles[i];
                const rotHex = getRotatedPos(tile, rot);
                const rotatedHex = dp.hexMap.getHexP(dp.hex.q + rotHex.q, dp.hex.r + rotHex.r);
                setFlags(rot, tg.rotations, tile.set_no_flag, rotatedHex.flags);
            }
            dp.drawableDatas.push.apply(dp.drawableDatas, drawableDatas);
        };
        const performTerrainGraphics = (tg, dp) => {
            if (tg.rotations !== undefined) {
                for (let i = 0; i < tg.rotations.length; i++) {
                    performRotatedTerrainGraphics(tg, dp, i);
                }
            }
            else
                performRotatedTerrainGraphics(tg, dp);
        };
        Worker.rebuild = (hexMap) => {
            Worker.prepareRotations();
            // clear old flags.
            hexMap.iterate(h => h.reset());
            const drawableDatas = [];
            const dp = {
                hex: null,
                hexMap: hexMap,
                drawableDatas: drawableDatas
            };
            hexMap.tgGroup.tgs.forEach(tg => {
                tg.hexes.forEach(hex => {
                    dp.hex = hex;
                    performTerrainGraphics(tg, dp);
                });
            });
            return drawableDatas;
        };
    })(Worker = WesnothTiles.Worker || (WesnothTiles.Worker = {}));
})(WesnothTiles || (WesnothTiles = {}));
var WesnothTiles;
(function (WesnothTiles) {
    var Worker;
    (function (Worker) {
        'use strict';
        class Hex {
            constructor(q, r, terrain, overlay = WesnothTiles.EOverlay.NONE, fog = false) {
                this.q = q;
                this.r = r;
                this.terrain = terrain;
                this.overlay = overlay;
                this.fog = fog;
                this.hashesTaken = 0;
                this.flags = new Map();
                this.str = q + \",\" + r;
            }
            getRandom(from, to) {
                this.hashesTaken++;
                return from + Worker.murmurhash3(this.str, this.hashesTaken) % to;
            }
            reset() {
                this.flags.clear();
                this.hashesTaken = 0;
            }
        }
        Worker.Hex = Hex;
    })(Worker = WesnothTiles.Worker || (WesnothTiles.Worker = {}));
})(WesnothTiles || (WesnothTiles = {}));
var WesnothTiles;
(function (WesnothTiles) {
    var Worker;
    (function (Worker) {
        'use strict';
        class HexMap {
            constructor() {
                this.tgGroup = new Worker.TgGroup();
                this.hexes = new Map();
                this.loadingMode = false;
            }
            getHexP(q, r) {
                const map = this.hexes.get(q);
                return (map !== undefined) ? map.get(r) : undefined;
            }
            removeHex(q, r) {
                const map = this.hexes.get(q);
                if (map !== undefined)
                    map.delete(r);
            }
            removeTerrain(q, r) {
                const row = this.hexes.get(q);
                if (row === undefined) {
                    return;
                }
                const hex = row.get(r);
                if (hex !== undefined) {
                    this.removeHexFromTgs(hex);
                    row.delete(r);
                }
            }
            setTerrain(q, r, terrain, overlay = WesnothTiles.EOverlay.NONE, fog = false) {
                let row = this.hexes.get(q);
                if (row === undefined) {
                    row = new Map();
                    this.hexes.set(q, row);
                }
                let hex = row.get(r);
                if (hex === undefined) {
                    hex = new Worker.Hex(q, r, terrain);
                    row.set(r, hex);
                }
                hex.terrain = terrain;
                hex.overlay = overlay;
                hex.fog = fog;
                if (!this.loadingMode) {
                    this.removeHexFromTgs(hex);
                    this.addHexToTgs(hex);
                    this.iterateNeighbours(hex.q, hex.r, h => {
                        this.removeHexFromTgs(h);
                        this.addHexToTgs(h);
                    });
                }
            }
            setLoadingMode() {
                this.loadingMode = true;
                // remove all currently loaded Tgs.
                this.tgGroup.tgs.forEach(tg => {
                    tg.hexes.clear();
                });
            }
            unsetLoadingMode() {
                if (!this.loadingMode)
                    return;
                this.loadingMode = false;
                this.iterate(h => {
                    this.addHexToTgs(h);
                });
            }
            removeHexFromTgs(hex) {
                const key = hex.str;
                this.tgGroup.tgs.forEach(tg => {
                    tg.hexes.delete(key);
                });
            }
            calculateStreaks(hex, bestStreaksMap) {
                const currentStreakMap = new Map();
                let bestFogStreak = 0;
                let currentFogStreak = 0;
                this.iterateNeighboursDouble(hex.q, hex.r, (terrain, fog) => {
                    // stop current streaks.
                    currentStreakMap.forEach((val, key) => {
                        if (key !== terrain) {
                            currentStreakMap.set(key, 0);
                        }
                    });
                    if (!fog)
                        currentFogStreak = 0;
                    if (terrain === undefined)
                        return;
                    const newValue = currentStreakMap.has(terrain) ?
                        (currentStreakMap.get(terrain) + 1) % 7 :
                        1;
                    currentStreakMap.set(terrain, newValue);
                    const bestStreak = bestStreaksMap.has(terrain) ?
                        bestStreaksMap.get(terrain) : 0;
                    if (newValue > bestStreak)
                        bestStreaksMap.set(terrain, newValue);
                    if (fog) {
                        currentFogStreak = (currentFogStreak + 1) % 7;
                        bestFogStreak = Math.max(bestFogStreak, currentFogStreak);
                    }
                    else {
                        currentFogStreak = 0;
                    }
                });
                return bestFogStreak;
            }
            addHexToTgs(hex) {
                // for transition macros, try to catch longest sequences of the same neighbour type
                // in a row. That way we can filter out transition macros of higher grades.
                const streaksMap = new Map();
                const fogStreak = this.calculateStreaks(hex, streaksMap);
                // iterate through all the macros and check which of them applies here.      
                this.tgGroup.tgs.forEach(tg => {
                    const tile = tg.tiles[0];
                    if (tile.type !== undefined && !tile.type.has(hex.terrain))
                        return;
                    if (tile.overlay !== undefined && !tile.overlay.has(hex.overlay))
                        return;
                    if (tg.transition !== undefined) {
                        if (tile.fog === undefined) {
                            let found = 0;
                            streaksMap.forEach((value, key) => {
                                if (tg.transition.has(key))
                                    found += value;
                            });
                            if (found < tg.transitionNumber) {
                                return;
                            }
                        }
                    }
                    if (tile.fog !== undefined) {
                        if (tg.transitionNumber === undefined && !hex.fog) {
                            return;
                        }
                        else {
                            if (tg.transitionNumber > fogStreak)
                                return;
                        }
                    }
                    tg.hexes.set(hex.str, hex);
                });
            }
            iterate(callback) {
                this.hexes.forEach(map => {
                    map.forEach(hex => {
                        callback(hex);
                    });
                });
            }
            iterateNeighbours(q, r, callback) {
                const func = (hex) => {
                    if (hex !== undefined)
                        callback(hex);
                };
                func(this.getHexP(q + 1, r));
                func(this.getHexP(q - 1, r));
                func(this.getHexP(q, r + 1));
                func(this.getHexP(q, r - 1));
                func(this.getHexP(q + 1, r - 1));
                func(this.getHexP(q - 1, r + 1));
            }
            // This function is for optimization purposes.
            iterateNeighboursDouble(q, r, callback) {
                const func = (hex) => {
                    if (hex !== undefined)
                        callback(hex.terrain, hex.fog);
                    else
                        callback(undefined, undefined);
                };
                func(this.getHexP(q, r - 1));
                func(this.getHexP(q + 1, r - 1));
                func(this.getHexP(q + 1, r));
                func(this.getHexP(q, r + 1));
                func(this.getHexP(q - 1, r + 1));
                func(this.getHexP(q - 1, r));
                // We do not need to make the fifth and sixth call in the repeat round.
                // They wouldn't be needed under even most unlucky circumtances
                func(this.getHexP(q, r - 1));
                func(this.getHexP(q + 1, r - 1));
                func(this.getHexP(q + 1, r));
                func(this.getHexP(q, r + 1));
            }
            clear() {
                this.hexes.clear();
                this.tgGroup.tgs.forEach(tg => {
                    tg.hexes.clear();
                });
            }
        }
        Worker.HexMap = HexMap;
    })(Worker = WesnothTiles.Worker || (WesnothTiles.Worker = {}));
})(WesnothTiles || (WesnothTiles = {}));
var WesnothTiles;
(function (WesnothTiles) {
    var Worker;
    (function (Worker) {
        'use strict';
        const getTerrainMap = (terrains) => {
            if (terrains === undefined)
                return undefined;
            const terrainList = new Map();
            terrains.forEach(terrain => {
                terrainList.set(terrain, true);
            });
            return terrainList;
        };
        // image builders.
        Worker.IB_IMAGE_SINGLE = {
            toDrawable: (imageStem, postfix, pos, layer, base) => {
                // console.log(\"Adding \" + imageStem + postfix);
                return new WesnothTiles.Internal.DrawableData(pos.x, pos.y, imageStem + postfix, layer, base, undefined, undefined // TODO change me to undefined, i am not needed.
                );
            },
            toString: (imageStem, postfix) => {
                return imageStem + postfix;
            }
        };
        Worker.IB_ANIMATION_15_SLOW = {
            toDrawable: (imageStem, postfix, pos, layer, base) => {
                return new WesnothTiles.Internal.DrawableData(pos.x, pos.y, imageStem + \"-@A\" + postfix, layer, base, 15, 150);
            },
            toString: (imageStem, postfix) => {
                return imageStem + \"-A01\" + postfix;
            }
        };
        Worker.IB_ANIMATION_15 = {
            toDrawable: (imageStem, postfix, pos, layer, base) => {
                return new WesnothTiles.Internal.DrawableData(pos.x, pos.y, imageStem + \"-@A\" + postfix, layer, base, 15, 110);
            },
            toString: (imageStem, postfix) => {
                return imageStem + \"-A01\" + postfix;
            }
        };
        Worker.IB_ANIMATION_06 = {
            toDrawable: (imageStem, postfix, pos, layer, base) => {
                return new WesnothTiles.Internal.DrawableData(pos.x, pos.y, imageStem + \"-@A\" + postfix, layer, base, 6, 200);
            },
            toString: (imageStem, postfix) => {
                return imageStem + \"-A01\" + postfix;
            }
        };
        const GENERIC_SINGLE_PLFB = (tgGroup, terrains, overlays, fog, imageStem, plfb) => {
            const img = {
                name: imageStem,
                layer: plfb.layer,
                variations: [\"\", \"2\", \"3\", \"4\", \"5\", \"6\", \"7\", \"8\", \"9\", \"10\", \"11\"],
                base: { x: 90 - 90, y: 108 - 144 },
                center: { x: 90 - 54, y: 108 - 72 }
            };
            const tile = {
                q: 0,
                r: 0,
                type: getTerrainMap(terrains),
                overlay: getTerrainMap(overlays),
                fog: fog,
                set_no_flag: [plfb.flag]
            };
            const terrainGraphic = {
                tiles: [
                    tile
                ],
                images: [img],
                probability: plfb.prob,
                builder: plfb.builder
            };
            tgGroup.addTg(terrainGraphic);
        };
        Worker.TERRAIN_BASE_PLFB = (tgGroup, terrains, imageStem, plfb) => {
            if (plfb.prob === undefined)
                plfb.prob = 100;
            if (plfb.layer === undefined)
                plfb.layer = -1000;
            if (plfb.flag === undefined)
                plfb.flag = \"base\";
            if (plfb.builder === undefined)
                plfb.builder = Worker.IB_IMAGE_SINGLE;
            GENERIC_SINGLE_PLFB(tgGroup, terrains, undefined, undefined, imageStem, plfb);
        };
        const GENERIC_SINGLE_RANDOM_LFB = (tgGroup, terrains, overlays, fog, imageStem, lfb) => {
            GENERIC_SINGLE_PLFB(tgGroup, terrains, overlays, fog, imageStem + \"@V\", {
                prob: 100,
                layer: lfb.layer,
                flag: lfb.flag,
                builder: lfb.builder
            });
        };
        Worker.OVERLAY_RANDOM_LFB = (tgGroup, terrains, overlays, fog, imageStem, lfb) => {
            GENERIC_SINGLE_RANDOM_LFB(tgGroup, terrains, overlays, fog, imageStem, {
                layer: lfb.layer === undefined ? 0 : lfb.layer,
                flag: lfb.flag === undefined ? \"overlay\" : lfb.flag,
                builder: lfb.builder === undefined ? Worker.IB_IMAGE_SINGLE : lfb.builder,
            });
        };
        Worker.TERRAIN_BASE_RANDOM_LFB = (tgGroup, terrains, imageStem, lfb) => {
            if (lfb.layer === undefined)
                lfb.layer = -1000;
            if (lfb.flag === undefined)
                lfb.flag = \"base\";
            if (lfb.builder === undefined)
                lfb.builder = Worker.IB_IMAGE_SINGLE;
            GENERIC_SINGLE_RANDOM_LFB(tgGroup, terrains, undefined, undefined, imageStem, lfb);
        };
        const BORDER_RESTRICTED_PLFB = (tgGroup, terrains, fog, adjacent, fogAdjacent, imageStem, plfb) => {
            const img = {
                name: imageStem,
                postfix: \"-@R0\",
                layer: plfb.layer,
                center: { x: 36, y: 36 },
                variations: [\"\", \"2\"]
            };
            const tile1 = {
                q: 0,
                r: 0,
                type: getTerrainMap(adjacent),
                fog: fogAdjacent,
                set_no_flag: [plfb.flag + \"-@R0\"]
            };
            const tile2 = {
                q: 0,
                r: -1,
                type: getTerrainMap(terrains),
                fog: fog,
                set_no_flag: [plfb.flag + \"-@R3\"]
            };
            const terrainGraphic = {
                tiles: [
                    tile1,
                    tile2
                ],
                images: [img],
                probability: plfb.prob,
                rotations: [\"n\", \"ne\", \"se\", \"s\", \"sw\", \"nw\"],
                transitionNumber: 1,
                transition: getTerrainMap(terrains),
                builder: plfb.builder
            };
            tgGroup.addTg(terrainGraphic);
        };
        const BORDER_RESTRICTED6_PLFB = (tgGroup, terrains, fog, adjacent, fogAdjacent, imageStem, plfb) => {
            const img = {
                name: imageStem,
                postfix: \"-@R0-@R1-@R2-@R3-@R4-@R5\",
                layer: plfb.layer,
                center: { x: 36, y: 36 },
                variations: [\"\", \"2\"]
            };
            const tile1 = {
                q: 0,
                r: 0,
                type: getTerrainMap(adjacent),
                fog: fogAdjacent,
                set_no_flag: [plfb.flag + \"-@R0\", plfb.flag + \"-@R1\", plfb.flag + \"-@R2\", plfb.flag + \"-@R3\", plfb.flag + \"-@R4\", plfb.flag + \"-@R5\"]
            };
            const tile2 = {
                q: 0,
                r: -1,
                type: getTerrainMap(terrains),
                fog: fog,
                set_no_flag: [plfb.flag + \"-@R3\"]
            };
            const tile3 = {
                q: 1,
                r: -1,
                type: getTerrainMap(terrains),
                fog: fog,
                set_no_flag: [plfb.flag + \"-@R4\"]
            };
            const tile4 = {
                q: 1,
                r: 0,
                type: getTerrainMap(terrains),
                fog: fog,
                set_no_flag: [plfb.flag + \"-@R5\"]
            };
            const tile5 = {
                q: 0,
                r: 1,
                type: getTerrainMap(terrains),
                fog: fog,
                set_no_flag: [plfb.flag + \"-@R0\"]
            };
            const tile6 = {
                q: -1,
                r: 1,
                type: getTerrainMap(terrains),
                fog: fog,
                set_no_flag: [plfb.flag + \"-@R1\"]
            };
            const tile7 = {
                q: -1,
                r: 0,
                type: getTerrainMap(terrains),
                fog: fog,
                set_no_flag: [plfb.flag + \"-@R2\"]
            };
            const terrainGraphic = {
                tiles: [
                    tile1,
                    tile2,
                    tile3,
                    tile4,
                    tile5,
                    tile6,
                    tile7
                ],
                images: [img],
                probability: plfb.prob,
                rotations: [\"n\", \"ne\", \"se\", \"s\", \"sw\", \"nw\"],
                transition: getTerrainMap(terrains),
                transitionNumber: 6,
                builder: plfb.builder
            };
            tgGroup.addTg(terrainGraphic);
        };
        const BORDER_RESTRICTED4_PLFB = (tgGroup, terrains, fog, adjacent, fogAdjacent, imageStem, plfb) => {
            const img = {
                name: imageStem,
                postfix: \"-@R0-@R1-@R2-@R3\",
                layer: plfb.layer,
                center: { x: 36, y: 36 },
                variations: [\"\", \"2\"]
            };
            const tile1 = {
                q: 0,
                r: 0,
                type: getTerrainMap(adjacent),
                fog: fogAdjacent,
                set_no_flag: [plfb.flag + \"-@R0\", plfb.flag + \"-@R1\", plfb.flag + \"-@R2\", plfb.flag + \"-@R3\"]
            };
            const tile2 = {
                q: 0,
                r: -1,
                type: getTerrainMap(terrains),
                fog: fog,
                set_no_flag: [plfb.flag + \"-@R3\"]
            };
            const tile3 = {
                q: 1,
                r: -1,
                type: getTerrainMap(terrains),
                fog: fog,
                set_no_flag: [plfb.flag + \"-@R4\"]
            };
            const tile4 = {
                q: 1,
                r: 0,
                type: getTerrainMap(terrains),
                fog: fog,
                set_no_flag: [plfb.flag + \"-@R5\"]
            };
            const tile5 = {
                q: 0,
                r: 1,
                type: getTerrainMap(terrains),
                fog: fog,
                set_no_flag: [plfb.flag + \"-@R0\"]
            };
            const terrainGraphic = {
                tiles: [
                    tile1,
                    tile2,
                    tile3,
                    tile4,
                    tile5
                ],
                images: [img],
                probability: plfb.prob,
                rotations: [\"n\", \"ne\", \"se\", \"s\", \"sw\", \"nw\"],
                transition: getTerrainMap(terrains),
                transitionNumber: 4,
                builder: plfb.builder
            };
            tgGroup.addTg(terrainGraphic);
        };
        const BORDER_RESTRICTED3_PLFB = (tgGroup, terrains, fog, adjacent, fogAdjacent, imageStem, plfb) => {
            const img = {
                name: imageStem,
                postfix: \"-@R0-@R1-@R2\",
                layer: plfb.layer,
                center: { x: 36, y: 36 },
                variations: [\"\", \"2\"]
            };
            const tile1 = {
                q: 0,
                r: 0,
                type: getTerrainMap(adjacent),
                fog: fogAdjacent,
                set_no_flag: [plfb.flag + \"-@R0\", plfb.flag + \"-@R1\", plfb.flag + \"-@R2\"]
            };
            const tile2 = {
                q: 0,
                r: -1,
                type: getTerrainMap(terrains),
                fog: fog,
                set_no_flag: [plfb.flag + \"-@R3\"]
            };
            const tile3 = {
                q: 1,
                r: -1,
                type: getTerrainMap(terrains),
                fog: fog,
                set_no_flag: [plfb.flag + \"-@R4\"]
            };
            const tile4 = {
                q: 1,
                r: 0,
                type: getTerrainMap(terrains),
                fog: fog,
                set_no_flag: [plfb.flag + \"-@R5\"]
            };
            const terrainGraphic = {
                tiles: [
                    tile1,
                    tile2,
                    tile3,
                    tile4
                ],
                images: [img],
                probability: plfb.prob,
                rotations: [\"n\", \"ne\", \"se\", \"s\", \"sw\", \"nw\"],
                transition: getTerrainMap(terrains),
                transitionNumber: 3,
                builder: plfb.builder
            };
            tgGroup.addTg(terrainGraphic);
        };
        const BORDER_RESTRICTED2_PLFB = (tgGroup, terrains, fog, adjacent, fogAdjacent, imageStem, plfb) => {
            const img = {
                name: imageStem,
                postfix: \"-@R0-@R1\",
                layer: plfb.layer,
                center: { x: 36, y: 36 },
                variations: [\"\", \"2\"]
            };
            const tile1 = {
                q: 0,
                r: 0,
                type: getTerrainMap(adjacent),
                fog: fogAdjacent,
                set_no_flag: [plfb.flag + \"-@R0\", plfb.flag + \"-@R1\"]
            };
            const tile2 = {
                q: 0,
                r: -1,
                type: getTerrainMap(terrains),
                fog: fog,
                set_no_flag: [plfb.flag + \"-@R3\"]
            };
            const tile3 = {
                q: 1,
                r: -1,
                type: getTerrainMap(terrains),
                fog: fog,
                set_no_flag: [plfb.flag + \"-@R4\"]
            };
            const terrainGraphic = {
                tiles: [
                    tile1,
                    tile2,
                    tile3
                ],
                images: [img],
                probability: plfb.prob,
                rotations: [\"n\", \"ne\", \"se\", \"s\", \"sw\", \"nw\"],
                transition: getTerrainMap(terrains),
                transitionNumber: 2,
                builder: plfb.builder
            };
            tgGroup.addTg(terrainGraphic);
        };
        const BORDER_RESTRICTED6_RANDOM_LFB = (tgGroup, terrains, fog, adjacent, fogAdjacent, imageStem, lfb) => {
            BORDER_RESTRICTED6_PLFB(tgGroup, terrains, fog, adjacent, fogAdjacent, imageStem + \"@V\", {
                prob: 100,
                layer: lfb.layer,
                flag: lfb.flag,
                builder: lfb.builder
            });
        };
        const BORDER_RESTRICTED4_RANDOM_LFB = (tgGroup, terrains, fog, adjacent, fogAdjacent, imageStem, lfb) => {
            BORDER_RESTRICTED4_PLFB(tgGroup, terrains, fog, adjacent, fogAdjacent, imageStem + \"@V\", {
                prob: 100,
                layer: lfb.layer,
                flag: lfb.flag,
                builder: lfb.builder
            });
        };
        const BORDER_RESTRICTED3_RANDOM_LFB = (tgGroup, terrains, fog, adjacent, fogAdjacent, imageStem, lfb) => {
            BORDER_RESTRICTED3_PLFB(tgGroup, terrains, fog, adjacent, fogAdjacent, imageStem + \"@V\", {
                prob: 100,
                layer: lfb.layer,
                flag: lfb.flag,
                builder: lfb.builder
            });
        };
        const BORDER_RESTRICTED2_RANDOM_LFB = (tgGroup, terrains, fog, adjacent, fogAdjacent, imageStem, lfb) => {
            BORDER_RESTRICTED2_PLFB(tgGroup, terrains, fog, adjacent, fogAdjacent, imageStem + \"@V\", {
                prob: 100,
                layer: lfb.layer,
                flag: lfb.flag,
                builder: lfb.builder
            });
        };
        const BORDER_RESTRICTED_RANDOM_LFB = (tgGroup, terrains, fog, adjacent, fogAdjacent, imageStem, lfb) => {
            BORDER_RESTRICTED_PLFB(tgGroup, terrains, fog, adjacent, fogAdjacent, imageStem + \"@V\", {
                prob: 100,
                layer: lfb.layer,
                flag: lfb.flag,
                builder: lfb.builder
            });
        };
        const BORDER_COMPLETE_LFB = (tgGroup, terrains, fog, adjacent, fogAdjacent, imageStem, lfb, grades) => {
            grades.forEach(grade => {
                switch (grade) {
                    case 6:
                        BORDER_RESTRICTED6_RANDOM_LFB(tgGroup, terrains, fog, adjacent, fogAdjacent, imageStem, lfb);
                        break;
                    // 5 borders transition was nowhere used, thus got removed.
                    case 4:
                        BORDER_RESTRICTED4_RANDOM_LFB(tgGroup, terrains, fog, adjacent, fogAdjacent, imageStem, lfb);
                        break;
                    case 3:
                        BORDER_RESTRICTED3_RANDOM_LFB(tgGroup, terrains, fog, adjacent, fogAdjacent, imageStem, lfb);
                        break;
                    case 2:
                        BORDER_RESTRICTED2_RANDOM_LFB(tgGroup, terrains, fog, adjacent, fogAdjacent, imageStem, lfb);
                        break;
                    case 1:
                        BORDER_RESTRICTED_RANDOM_LFB(tgGroup, terrains, fog, adjacent, fogAdjacent, imageStem, lfb);
                        break;
                }
            });
        };
        // grades is used by BORDER_COMPLETE, to filter out not needed macros.
        Worker.TRANSITION_COMPLETE_LFB = (tgGroup, terrains, adjacent, imageStem, lfb, grades) => {
            if (lfb.layer === undefined)
                lfb.layer = -500;
            if (lfb.flag === undefined)
                lfb.flag = \"transition\";
            if (lfb.builder === undefined)
                lfb.builder = Worker.IB_IMAGE_SINGLE;
            BORDER_COMPLETE_LFB(tgGroup, terrains, undefined, adjacent, undefined, imageStem, lfb, grades);
        };
        Worker.FOG_TRANSITION_LFB = (tgGroup, fog, fogAdjacent, imageStem, lfb, grades) => {
            if (lfb.layer === undefined)
                lfb.layer = -500;
            if (lfb.flag === undefined)
                lfb.flag = \"transition\";
            if (lfb.builder === undefined)
                lfb.builder = Worker.IB_IMAGE_SINGLE;
            BORDER_COMPLETE_LFB(tgGroup, undefined, fog, undefined, fogAdjacent, imageStem, lfb, grades);
        };
        const GENERIC_SINGLEHEX_PLFB = (tgGroup, terrains, imageStem, plfb) => {
            const img = {
                name: imageStem,
                layer: plfb.layer,
                center: { x: 36, y: 36 },
                variations: [\"\", \"2\", \"3\", \"4\", \"5\", \"6\", \"7\", \"8\", \"9\", \"10\", \"11\"]
            };
            const tile = {
                q: 0,
                r: 0,
                type: getTerrainMap(terrains),
                set_no_flag: [plfb.flag]
            };
            const terrainGraphic = {
                tiles: [
                    tile
                ],
                images: [img],
                probability: plfb.prob,
                builder: plfb.builder
            };
            tgGroup.addTg(terrainGraphic);
        };
        Worker.TERRAIN_BASE_SINGLEHEX_PLFB = (tgGroup, terrains, imageStem, plfb) => {
            if (plfb.prob === undefined)
                plfb.prob = 100;
            if (plfb.layer === undefined)
                plfb.layer = -1000;
            if (plfb.flag === undefined)
                plfb.flag = \"base\";
            if (plfb.builder === undefined)
                plfb.builder = Worker.IB_IMAGE_SINGLE;
            GENERIC_SINGLEHEX_PLFB(tgGroup, terrains, imageStem, plfb);
        };
        Worker.ANIMATED_WATER_15_TRANSITION = (tgGroup, terrains, adjacent, imageStem, layer) => {
            const img = {
                name: imageStem,
                postfix: \"-@R0\",
                layer: layer,
                center: { x: 36, y: 36 },
                variations: [\"\"]
            };
            const tile1 = {
                q: 0,
                r: 0,
                type: getTerrainMap(adjacent),
                set_no_flag: [\"transition-@R0\"]
            };
            const tile2 = {
                q: 0,
                r: -1,
                type: getTerrainMap(terrains),
            };
            const terrainGraphic = {
                tiles: [
                    tile1,
                    tile2
                ],
                probability: 100,
                images: [img],
                rotations: [\"n\", \"ne\", \"se\", \"s\", \"sw\", \"nw\"],
                builder: Worker.IB_ANIMATION_15_SLOW,
                transition: getTerrainMap(terrains),
                transitionNumber: 1
            };
            tgGroup.addTg(terrainGraphic);
        };
        Worker.NEW_BEACH = (tgGroup, terrains, adjacent, imageStem) => {
            const concave_img1 = {
                name: imageStem + \"-concave\",
                postfix: \"-@R0-@R5\",
                layer: -500,
                center: { x: 36, y: 36 },
                variations: [\"\"]
            };
            const concave_img2 = {
                name: imageStem + \"-concave\",
                postfix: \"-@R0-@R1\",
                layer: -500,
                center: { x: 36, y: 36 },
                variations: [\"\"]
            };
            const concave_tile1 = {
                q: 0,
                r: 0,
                type: getTerrainMap(adjacent),
                set_no_flag: [\"beach-@R0-@R5\", \"beach-@R0-@R1\"]
            };
            const concave_tile2 = {
                q: 0,
                r: -1,
                type: getTerrainMap(terrains),
                set_no_flag: [\"beach-@R2-@R3\"]
            };
            const concave_tile3 = {
                q: 1,
                r: -1,
                type: getTerrainMap(terrains),
                set_no_flag: [\"beach-@R4-@R3\"]
            };
            const concave_terrainGraphic = {
                tiles: [
                    concave_tile1,
                    concave_tile2,
                    concave_tile3
                ],
                images: [concave_img1, concave_img2],
                probability: 100,
                transition: getTerrainMap(terrains),
                transitionNumber: 2,
                rotations: [\"tr\", \"r\", \"br\", \"bl\", \"l\", \"tl\"],
                builder: Worker.IB_IMAGE_SINGLE
            };
            tgGroup.addTg(concave_terrainGraphic);
            // ----------------------------------------------------
            const convex0_img1 = {
                name: imageStem + \"-convex\",
                postfix: \"-@R0-@R5\",
                layer: -500,
                center: { x: 36, y: 36 },
                variations: [\"\"]
            };
            const convex0_img2 = {
                name: imageStem + \"-convex\",
                postfix: \"-@R0-@R1\",
                layer: -500,
                center: { x: 36, y: 36 },
                variations: [\"\"]
            };
            const convex0_tile1 = {
                q: 0,
                r: 0,
                type: getTerrainMap(terrains),
                set_no_flag: [\"beach-@R0-@R5\", \"beach-@R0-@R1\"]
            };
            const convex0_tile2 = {
                q: 0,
                r: -1,
                type: getTerrainMap(adjacent),
                set_no_flag: [\"beach-@R2-@R3\"]
            };
            const convex0_tile3 = {
                q: 1,
                r: -1,
                type: getTerrainMap(adjacent),
                set_no_flag: [\"beach-@R4-@R3\"]
            };
            const convex0_terrainGraphic = {
                tiles: [
                    convex0_tile1,
                    convex0_tile2,
                    convex0_tile3
                ],
                images: [convex0_img1, convex0_img2],
                probability: 100,
                transition: getTerrainMap(adjacent),
                transitionNumber: 2,
                rotations: [\"tr\", \"r\", \"br\", \"bl\", \"l\", \"tl\"],
                builder: Worker.IB_IMAGE_SINGLE
            };
            tgGroup.addTg(convex0_terrainGraphic);
            // ----------------------------------------------------
            const convex1_img1 = {
                name: imageStem + \"-convex\",
                postfix: \"-@R0-@R5\",
                layer: -500,
                center: { x: 36, y: 36 },
                variations: [\"\"]
            };
            const convex1_tile1 = {
                q: 0,
                r: 0,
                type: getTerrainMap(terrains),
                set_no_flag: [\"beach-@R0-@R5\"]
            };
            const convex1_tile2 = {
                q: 0,
                r: -1,
                type: getTerrainMap(adjacent),
                set_no_flag: [\"beach-@R2-@R3\"]
            };
            const convex1_tile3 = {
                q: 1,
                r: -1,
                type: getTerrainMap(Worker.swapTerrains(adjacent.concat(terrains))),
            };
            const convex1_terrainGraphic = {
                tiles: [
                    convex1_tile1,
                    convex1_tile2,
                    convex1_tile3
                ],
                transition: getTerrainMap(adjacent),
                transitionNumber: 1,
                images: [convex1_img1],
                probability: 100,
                rotations: [\"tr\", \"r\", \"br\", \"bl\", \"l\", \"tl\"],
                builder: Worker.IB_IMAGE_SINGLE
            };
            tgGroup.addTg(convex1_terrainGraphic);
            // ----------------------------------------------------
            const convex2_img1 = {
                name: imageStem + \"-convex\",
                postfix: \"-@R0-@R1\",
                layer: -500,
                center: { x: 36, y: 36 },
                variations: [\"\"]
            };
            const convex2_tile1 = {
                q: 0,
                r: 0,
                type: getTerrainMap(terrains),
                set_no_flag: [\"beach-@R0-@R1\"]
            };
            const convex2_tile2 = {
                q: 0,
                r: -1,
                type: getTerrainMap(Worker.swapTerrains(adjacent.concat(terrains))),
            };
            const convex2_tile3 = {
                q: 1,
                r: -1,
                type: getTerrainMap(adjacent),
                set_no_flag: [\"beach-@R4-@R3\"]
            };
            const convex2_terrainGraphic = {
                tiles: [
                    convex2_tile1,
                    convex2_tile2,
                    convex2_tile3
                ],
                images: [convex2_img1],
                probability: 100,
                transition: getTerrainMap(adjacent),
                transitionNumber: 1,
                rotations: [\"tr\", \"r\", \"br\", \"bl\", \"l\", \"tl\"],
                builder: Worker.IB_IMAGE_SINGLE
            };
            tgGroup.addTg(convex2_terrainGraphic);
        };
        Worker.NEW_WAVES = (tgGroup, terrains, adjacent, layer, imageStem) => {
            const convex_img1 = {
                name: imageStem + \"-convex\",
                postfix: \"-@R0\",
                layer: layer,
                center: { x: 36, y: 36 },
                variations: [\"\"]
            };
            const convex_tile1 = {
                q: 0,
                r: 0,
                type: getTerrainMap(terrains),
                set_no_flag: [\"waves-@R0\"]
            };
            const convex_tile2 = {
                q: 0,
                r: -1,
                type: getTerrainMap(adjacent),
                set_no_flag: [\"waves-@R2\"]
            };
            const convex_tile3 = {
                q: 1,
                r: -1,
                type: getTerrainMap(adjacent),
                set_no_flag: [\"waves-@R4\"]
            };
            const convex_terrainGraphic = {
                tiles: [
                    convex_tile1,
                    convex_tile2,
                    convex_tile3
                ],
                images: [convex_img1],
                probability: 100,
                rotations: [\"tr\", \"r\", \"br\", \"bl\", \"l\", \"tl\"],
                builder: Worker.IB_ANIMATION_06
            };
            tgGroup.addTg(convex_terrainGraphic);
            // ----------------------------------------------------
            const concave_img1 = {
                name: imageStem + \"-concave\",
                postfix: \"-@R0\",
                layer: layer,
                center: { x: 36, y: 36 },
                variations: [\"\"]
            };
            const concave_tile1 = {
                q: 0,
                r: 0,
                type: getTerrainMap(adjacent),
                set_no_flag: [\"waves-@R0\"]
            };
            const concave_tile2 = {
                q: 0,
                r: -1,
                type: getTerrainMap(terrains),
                set_no_flag: [\"waves-@R2\"]
            };
            const concave_tile3 = {
                q: 1,
                r: -1,
                type: getTerrainMap(terrains),
                set_no_flag: [\"waves-@R4\"]
            };
            const concave_terrainGraphic = {
                tiles: [
                    concave_tile1,
                    concave_tile2,
                    concave_tile3
                ],
                images: [concave_img1],
                probability: 100,
                rotations: [\"tr\", \"r\", \"br\", \"bl\", \"l\", \"tl\"],
                builder: Worker.IB_ANIMATION_06
            };
            tgGroup.addTg(concave_terrainGraphic);
        };
        Worker.MOUNTAIN_SINGLE = (tgGroup, terrains, imageStem, prob, flag) => {
            const img = {
                name: imageStem,
                base: { x: 90 - 54, y: 107 - 72 },
                layer: 0,
                center: { x: 90 - 54, y: 108 - 72 },
                variations: [\"\", \"2\", \"3\", \"4\", \"5\", \"6\"],
            };
            const tile = {
                q: 0,
                r: 0,
                type: getTerrainMap(terrains),
                set_no_flag: [flag]
            };
            const terrainGraphic = {
                tiles: [tile],
                images: [img],
                probability: prob,
                builder: Worker.IB_IMAGE_SINGLE
            };
            tgGroup.addTg(terrainGraphic);
        };
        const GENERIC_RESTRICTED3_N_NE_SE_PLFB = (tgGroup, terrains, adjacent, imageStem, plfb, rotation) => {
            const img = {
                name: imageStem,
                postfix: rotation,
                layer: plfb.layer,
                base: { x: 90 - 90, y: 108 - 144 },
                center: { x: 90 - 54, y: 108 - 72 },
                variations: [\"\", \"2\", \"3\", \"4\", \"5\", \"6\", \"7\", \"8\", \"9\", \"10\", \"11\"]
            };
            const tile1 = {
                q: 0,
                r: 0,
                type: getTerrainMap(terrains),
                set_no_flag: [plfb.flag]
            };
            const tile2 = {
                q: 0,
                r: -1,
                type: getTerrainMap(adjacent)
            };
            const tile3 = {
                q: 1,
                r: -1,
                type: getTerrainMap(adjacent)
            };
            const tile4 = {
                q: 1,
                r: 0,
                type: getTerrainMap(adjacent)
            };
            const terrainGraphic = {
                tiles: [
                    tile1,
                    tile2,
                    tile3,
                    tile4
                ],
                images: [img],
                probability: plfb.prob,
                rotations: [\"n\", \"ne\", \"se\", \"s\", \"sw\", \"nw\"],
                builder: plfb.builder
            };
            tgGroup.addTg(terrainGraphic);
        };
        const GENERIC_RESTRICTED3_N_NE_S_PLFB = (tgGroup, terrains, adjacent, imageStem, plfb, rotation) => {
            const img = {
                name: imageStem,
                postfix: rotation,
                layer: plfb.layer,
                base: { x: 90 - 90, y: 108 - 144 },
                center: { x: 90 - 54, y: 108 - 72 },
                variations: [\"\", \"2\", \"3\", \"4\", \"5\", \"6\", \"7\", \"8\", \"9\", \"10\", \"11\"]
            };
            const tile1 = {
                q: 0,
                r: 0,
                type: getTerrainMap(terrains),
                set_no_flag: [plfb.flag]
            };
            const tile2 = {
                q: 0,
                r: -1,
                type: getTerrainMap(adjacent)
            };
            const tile3 = {
                q: 1,
                r: -1,
                type: getTerrainMap(adjacent)
            };
            const tile4 = {
                q: 0,
                r: 1,
                type: getTerrainMap(adjacent)
            };
            const terrainGraphic = {
                tiles: [
                    tile1,
                    tile2,
                    tile3,
                    tile4
                ],
                images: [img],
                probability: plfb.prob,
                rotations: [\"n\", \"ne\", \"se\", \"s\", \"sw\", \"nw\"],
                builder: plfb.builder
            };
            tgGroup.addTg(terrainGraphic);
        };
        const GENERIC_RESTRICTED3_N_NE_SW_PLFB = (tgGroup, terrains, adjacent, imageStem, plfb, rotation) => {
            const img = {
                name: imageStem,
                postfix: rotation,
                layer: plfb.layer,
                base: { x: 90 - 90, y: 108 - 144 },
                center: { x: 90 - 54, y: 108 - 72 },
                variations: [\"\", \"2\", \"3\", \"4\", \"5\", \"6\", \"7\", \"8\", \"9\", \"10\", \"11\"]
            };
            const tile1 = {
                q: 0,
                r: 0,
                type: getTerrainMap(terrains),
                set_no_flag: [plfb.flag]
            };
            const tile2 = {
                q: 0,
                r: -1,
                type: getTerrainMap(adjacent)
            };
            const tile3 = {
                q: 1,
                r: -1,
                type: getTerrainMap(adjacent)
            };
            const tile4 = {
                q: -1,
                r: 1,
                type: getTerrainMap(adjacent)
            };
            const terrainGraphic = {
                tiles: [
                    tile1,
                    tile2,
                    tile3,
                    tile4
                ],
                images: [img],
                probability: plfb.prob,
                rotations: [\"n\", \"ne\", \"se\", \"s\", \"sw\", \"nw\"],
                builder: plfb.builder
            };
            tgGroup.addTg(terrainGraphic);
        };
        const GENERIC_RESTRICTED3_N_SE_SW_PLFB = (tgGroup, terrains, adjacent, imageStem, plfb, rotation) => {
            const img = {
                name: imageStem,
                postfix: rotation,
                layer: plfb.layer,
                base: { x: 90 - 90, y: 108 - 144 },
                center: { x: 90 - 54, y: 108 - 72 },
                variations: [\"\", \"2\", \"3\", \"4\", \"5\", \"6\", \"7\", \"8\", \"9\", \"10\", \"11\"]
            };
            const tile1 = {
                q: 0,
                r: 0,
                type: getTerrainMap(terrains),
                set_no_flag: [plfb.flag]
            };
            const tile2 = {
                q: 0,
                r: -1,
                type: getTerrainMap(adjacent)
            };
            const tile3 = {
                q: 1,
                r: 0,
                type: getTerrainMap(adjacent)
            };
            const tile4 = {
                q: -1,
                r: 1,
                type: getTerrainMap(adjacent)
            };
            const terrainGraphic = {
                tiles: [
                    tile1,
                    tile2,
                    tile3,
                    tile4
                ],
                images: [img],
                probability: plfb.prob,
                rotations: [\"n\", \"ne\", \"se\", \"s\", \"sw\", \"nw\"],
                builder: plfb.builder
            };
            tgGroup.addTg(terrainGraphic);
        };
        const GENERIC_RESTRICTED2_N_NE_PLFB = (tgGroup, terrains, adjacent, imageStem, plfb, rotation) => {
            const img = {
                name: imageStem,
                postfix: rotation,
                layer: plfb.layer,
                base: { x: 90 - 90, y: 108 - 144 },
                center: { x: 90 - 54, y: 108 - 72 },
                variations: [\"\", \"2\", \"3\", \"4\", \"5\", \"6\", \"7\", \"8\", \"9\", \"10\", \"11\"]
            };
            const tile1 = {
                q: 0,
                r: 0,
                type: getTerrainMap(terrains),
                set_no_flag: [plfb.flag]
            };
            const tile2 = {
                q: 0,
                r: -1,
                type: getTerrainMap(adjacent)
            };
            const tile3 = {
                q: 1,
                r: -1,
                type: getTerrainMap(adjacent)
            };
            const terrainGraphic = {
                tiles: [
                    tile1,
                    tile2,
                    tile3,
                ],
                images: [img],
                probability: plfb.prob,
                rotations: [\"n\", \"ne\", \"se\", \"s\", \"sw\", \"nw\"],
                builder: plfb.builder
            };
            tgGroup.addTg(terrainGraphic);
        };
        const GENERIC_RESTRICTED2_N_SE_PLFB = (tgGroup, terrains, adjacent, imageStem, plfb, rotation) => {
            const img = {
                name: imageStem,
                postfix: rotation,
                layer: plfb.layer,
                base: { x: 90 - 90, y: 108 - 144 },
                center: { x: 90 - 54, y: 108 - 72 },
                variations: [\"\", \"2\", \"3\", \"4\", \"5\", \"6\", \"7\", \"8\", \"9\", \"10\", \"11\"]
            };
            const tile1 = {
                q: 0,
                r: 0,
                type: getTerrainMap(terrains),
                set_no_flag: [plfb.flag]
            };
            const tile2 = {
                q: 0,
                r: -1,
                type: getTerrainMap(adjacent)
            };
            const tile3 = {
                q: 1,
                r: 0,
                type: getTerrainMap(adjacent)
            };
            const terrainGraphic = {
                tiles: [
                    tile1,
                    tile2,
                    tile3,
                ],
                images: [img],
                probability: plfb.prob,
                rotations: [\"n\", \"ne\", \"se\", \"s\", \"sw\", \"nw\"],
                builder: plfb.builder
            };
            tgGroup.addTg(terrainGraphic);
        };
        const GENERIC_RESTRICTED2_N_S_PLFB = (tgGroup, terrains, adjacent, imageStem, plfb, rotation) => {
            const img = {
                name: imageStem,
                postfix: rotation,
                layer: plfb.layer,
                base: { x: 90 - 90, y: 108 - 144 },
                center: { x: 90 - 54, y: 108 - 72 },
                variations: [\"\", \"2\", \"3\", \"4\", \"5\", \"6\", \"7\", \"8\", \"9\", \"10\", \"11\"]
            };
            const tile1 = {
                q: 0,
                r: 0,
                type: getTerrainMap(terrains),
                set_no_flag: [plfb.flag]
            };
            const tile2 = {
                q: 0,
                r: -1,
                type: getTerrainMap(adjacent)
            };
            const tile3 = {
                q: 0,
                r: 1,
                type: getTerrainMap(adjacent)
            };
            const terrainGraphic = {
                tiles: [
                    tile1,
                    tile2,
                    tile3,
                ],
                images: [img],
                probability: plfb.prob,
                rotations: [\"n\", \"ne\", \"se\", \"s\", \"sw\", \"nw\"],
                builder: plfb.builder
            };
            tgGroup.addTg(terrainGraphic);
        };
        const GENERIC_RESTRICTED2_PLFB = (tgGroup, terrains, adjacent, imageStem, plfb, rotation) => {
            GENERIC_RESTRICTED2_N_NE_PLFB(tgGroup, terrains, adjacent, imageStem, plfb, rotation);
            GENERIC_RESTRICTED2_N_SE_PLFB(tgGroup, terrains, adjacent, imageStem, plfb, rotation);
            GENERIC_RESTRICTED2_N_S_PLFB(tgGroup, terrains, adjacent, imageStem, plfb, rotation);
        };
        Worker.OVERLAY_RESTRICTED2_PLFB = (tgGroup, terrains, adjacent, imageStem, plfb) => {
            GENERIC_RESTRICTED2_PLFB(tgGroup, terrains, adjacent, imageStem, {
                prob: plfb.prob === undefined ? 100 : plfb.prob,
                layer: plfb.layer === undefined ? 0 : plfb.layer,
                flag: plfb.flag === undefined ? \"overlay\" : plfb.flag,
                builder: plfb.builder === undefined ? Worker.IB_IMAGE_SINGLE : plfb.builder,
            }, \"\");
        };
        const GENERIC_RESTRICTED3_PLFB = (tgGroup, terrains, adjacent, imageStem, plfb, rotation) => {
            GENERIC_RESTRICTED3_N_NE_SE_PLFB(tgGroup, terrains, adjacent, imageStem, plfb, rotation);
            GENERIC_RESTRICTED3_N_NE_S_PLFB(tgGroup, terrains, adjacent, imageStem, plfb, rotation);
            GENERIC_RESTRICTED3_N_NE_SW_PLFB(tgGroup, terrains, adjacent, imageStem, plfb, rotation);
            GENERIC_RESTRICTED3_N_SE_SW_PLFB(tgGroup, terrains, adjacent, imageStem, plfb, rotation);
        };
        const GENERIC_RESTRICTED3_RANDOM_LFB = (tgGroup, terrains, adjacent, imageStem, lfb, rotation) => {
            GENERIC_RESTRICTED3_PLFB(tgGroup, terrains, adjacent, imageStem + \"@V\", {
                layer: lfb.layer,
                prob: 100,
                flag: lfb.flag,
                builder: lfb.builder
            }, rotation);
        };
        Worker.OVERLAY_RESTRICTED3_PLFB = (tgGroup, terrains, adjacent, imageStem, plfb) => {
            GENERIC_RESTRICTED3_PLFB(tgGroup, terrains, adjacent, imageStem, {
                prob: plfb.prob === undefined ? 100 : plfb.prob,
                layer: plfb.layer === undefined ? 0 : plfb.layer,
                flag: plfb.flag === undefined ? \"overlay\" : plfb.flag,
                builder: plfb.builder === undefined ? Worker.IB_IMAGE_SINGLE : plfb.builder,
            }, \"\");
        };
        const GENERIC_RESTRICTED2_RANDOM_LFB = (tgGroup, terrains, adjacent, imageStem, lfb, rotation) => {
            GENERIC_RESTRICTED2_PLFB(tgGroup, terrains, adjacent, imageStem + \"@V\", {
                layer: lfb.layer,
                prob: 100,
                flag: lfb.flag,
                builder: lfb.builder
            }, rotation);
        };
        const GENERIC_RESTRICTED_PLFB = (tgGroup, terrains, overlays, adjacent, adjacentOverlays, imageStem, plfb, rotation) => {
            const img = {
                name: imageStem,
                postfix: rotation,
                layer: plfb.layer,
                base: { x: 90 - 90, y: 108 - 144 },
                center: { x: 90 - 54, y: 108 - 72 },
                variations: [\"\", \"2\", \"3\", \"4\", \"5\", \"6\", \"7\", \"8\", \"9\", \"10\", \"11\"]
            };
            const tile1 = {
                q: 0,
                r: 0,
                type: getTerrainMap(terrains),
                overlay: getTerrainMap(overlays),
                set_no_flag: [plfb.flag]
            };
            const tile2 = {
                q: 0,
                r: -1,
                type: getTerrainMap(adjacent),
                overlay: getTerrainMap(adjacentOverlays),
            };
            const terrainGraphic = {
                tiles: [
                    tile1,
                    tile2,
                ],
                images: [img],
                probability: plfb.prob,
                rotations: [\"n\", \"ne\", \"se\", \"s\", \"sw\", \"nw\"],
                builder: plfb.builder
            };
            tgGroup.addTg(terrainGraphic);
        };
        const GENERIC_RESTRICTED_RANDOM_LFB = (tgGroup, terrains, adjacent, imageStem, lfb, rotation) => {
            GENERIC_RESTRICTED_PLFB(tgGroup, terrains, undefined, adjacent, undefined, imageStem + \"@V\", {
                layer: lfb.layer,
                prob: 100,
                flag: lfb.flag,
                builder: lfb.builder
            }, rotation);
        };
        const GENERIC_COMPLETE_LFB = (tgGroup, terrains, adjacent, imageStem, lfb) => {
            GENERIC_RESTRICTED3_RANDOM_LFB(tgGroup, terrains, adjacent, imageStem + \"-small\", lfb, \"-@R0-@R1-@R2\");
            GENERIC_RESTRICTED3_RANDOM_LFB(tgGroup, terrains, adjacent, imageStem + \"-small\", lfb, \"\");
            GENERIC_RESTRICTED2_RANDOM_LFB(tgGroup, terrains, adjacent, imageStem + \"-small\", lfb, \"-@R0-@R1\");
            GENERIC_RESTRICTED2_RANDOM_LFB(tgGroup, terrains, adjacent, imageStem + \"-small\", lfb, \"\");
            GENERIC_RESTRICTED_RANDOM_LFB(tgGroup, terrains, adjacent, imageStem + \"-small\", lfb, \"-@R0\");
            GENERIC_RESTRICTED_RANDOM_LFB(tgGroup, terrains, adjacent, imageStem + \"-small\", lfb, \"\");
            GENERIC_SINGLE_RANDOM_LFB(tgGroup, terrains, undefined, undefined, imageStem, lfb);
        };
        Worker.OVERLAY_COMPLETE_LFB = (tgGroup, terrains, adjacent, imageStem, lfb) => {
            GENERIC_COMPLETE_LFB(tgGroup, terrains, adjacent, imageStem, {
                layer: lfb.layer === undefined ? 0 : lfb.layer,
                flag: lfb.flag === undefined ? \"overlay\" : lfb.flag,
                builder: lfb.builder === undefined ? Worker.IB_IMAGE_SINGLE : lfb.builder,
            });
        };
        Worker.MOUNTAIN_SINGLE_RANDOM = (tgGroup, terrains, imageStem, flag) => {
            Worker.MOUNTAIN_SINGLE(tgGroup, terrains, imageStem + \"@V\", 100, flag);
        };
        Worker.OVERLAY_PLFB = (tgGroup, terrains, overlays, fog, imageStem, plfb) => {
            GENERIC_SINGLE_PLFB(tgGroup, terrains, overlays, fog, imageStem, {
                prob: plfb.prob === undefined ? 100 : plfb.prob,
                layer: plfb.layer === undefined ? 0 : plfb.layer,
                flag: plfb.flag === undefined ? \"overlay\" : plfb.flag,
                builder: plfb.builder === undefined ? Worker.IB_IMAGE_SINGLE : plfb.builder,
            });
        };
        Worker.OVERLAY_ROTATION_RESTRICTED2_PLFB = (tgGroup, terrains, adjacent, imageStem, plfb) => {
            GENERIC_RESTRICTED2_PLFB(tgGroup, terrains, adjacent, imageStem, {
                prob: plfb.prob === undefined ? 100 : plfb.prob,
                layer: plfb.layer === undefined ? 0 : plfb.layer,
                flag: plfb.flag === undefined ? \"overlay\" : plfb.flag,
                builder: plfb.builder === undefined ? Worker.IB_IMAGE_SINGLE : plfb.builder,
            }, \"-@R0-@R1\");
        };
        Worker.OVERLAY_ROTATION_RESTRICTED_PLFB = (tgGroup, terrains, adjacent, imageStem, plfb) => {
            GENERIC_RESTRICTED_PLFB(tgGroup, terrains, undefined, adjacent, undefined, imageStem, {
                prob: plfb.prob === undefined ? 100 : plfb.prob,
                layer: plfb.layer === undefined ? 0 : plfb.layer,
                flag: plfb.flag === undefined ? \"overlay\" : plfb.flag,
                builder: plfb.builder === undefined ? Worker.IB_IMAGE_SINGLE : plfb.builder,
            }, \"-@R0\");
        };
        Worker.MOUNTAINS_2x4_NW_SE = (tgGroup, terrains, imageStem, flag, prob) => {
            const center = { x: 198 - 54, y: 180 - 108 };
            const img1 = {
                name: imageStem + \"_1\",
                postfix: \"\",
                layer: 0,
                center: center,
                base: { x: 88 - 54, y: 107 - 108 },
                variations: [\"\"]
            };
            const img2 = {
                name: imageStem + \"_2\",
                postfix: \"\",
                layer: 0,
                center: center,
                base: { x: 144 - 54, y: 107 - 108 },
                variations: [\"\"]
            };
            const img3 = {
                name: imageStem + \"_3\",
                postfix: \"\",
                center: center,
                layer: 0,
                base: { x: 196 - 54, y: 107 - 108 },
                variations: [\"\"]
            };
            const img4 = {
                name: imageStem + \"_4\",
                postfix: \"\",
                center: center,
                layer: 0,
                base: { x: 248 - 54, y: 107 - 108 },
                variations: [\"\"]
            };
            const img5 = {
                name: imageStem + \"_5\",
                postfix: \"\",
                center: center,
                layer: 0,
                base: { x: 304 - 54, y: 107 - 108 },
                variations: [\"\"]
            };
            const terrainGraphic = {
                tiles: [],
                images: [img1, img2, img3, img4, img5],
                probability: prob,
                builder: Worker.IB_IMAGE_SINGLE
            };
            for (let i = 0; i < 4; i++) {
                terrainGraphic.tiles.push({
                    q: i,
                    r: 0,
                    type: getTerrainMap(terrains),
                    set_no_flag: [flag]
                });
                terrainGraphic.tiles.push({
                    q: i + 1,
                    r: -1,
                    type: getTerrainMap(terrains),
                    set_no_flag: [flag]
                });
            }
            tgGroup.addTg(terrainGraphic);
        };
        Worker.MOUNTAINS_1x3_NW_SE = (tgGroup, terrains, imageStem, flag, prob) => {
            const center = { x: 144 - 54, y: 162 - 108 };
            const img1 = {
                name: imageStem + \"_1\",
                postfix: \"\",
                layer: 0,
                center: center,
                base: { x: 88 - 54, y: 128 - 108 },
                variations: [\"\"]
            };
            const img2 = {
                name: imageStem + \"_2\",
                postfix: \"\",
                layer: 0,
                center: center,
                base: { x: 142 - 54, y: 144 - 108 },
                variations: [\"\"]
            };
            const img3 = {
                name: imageStem + \"_3\",
                postfix: \"\",
                layer: 0,
                center: center,
                base: { x: 196 - 54, y: 180 - 108 },
                variations: [\"\"]
            };
            const terrainGraphic = {
                tiles: [],
                images: [img1, img2, img3],
                probability: prob,
                builder: Worker.IB_IMAGE_SINGLE
            };
            for (let i = 0; i < 3; i++) {
                terrainGraphic.tiles.push({
                    q: i,
                    r: 0,
                    type: getTerrainMap(terrains),
                    set_no_flag: [flag]
                });
            }
            tgGroup.addTg(terrainGraphic);
        };
        Worker.MOUNTAINS_2x4_SW_NE = (tgGroup, terrains, imageStem, flag, prob) => {
            const center = { x: 198 - 216, y: 180 - 72 };
            const img1 = {
                name: imageStem + \"_1\",
                postfix: \"\",
                layer: 0,
                center: center,
                base: { x: 88 - 216, y: 107 - 72 },
                variations: [\"\"]
            };
            const img2 = {
                name: imageStem + \"_2\",
                postfix: \"\",
                layer: 0,
                center: center,
                base: { x: 144 - 216, y: 107 - 72 },
                variations: [\"\"]
            };
            const img3 = {
                name: imageStem + \"_3\",
                postfix: \"\",
                layer: 0,
                center: center,
                base: { x: 196 - 216, y: 107 - 72 },
                variations: [\"\"]
            };
            const img4 = {
                name: imageStem + \"_4\",
                postfix: \"\",
                layer: 0,
                center: center,
                base: { x: 248 - 216, y: 107 - 72 },
                variations: [\"\"]
            };
            const img5 = {
                name: imageStem + \"_5\",
                postfix: \"\",
                layer: 0,
                center: center,
                base: { x: 304 - 216, y: 107 - 72 },
                variations: [\"\"]
            };
            const terrainGraphic = {
                tiles: [],
                images: [img1, img2, img3, img4, img5],
                probability: prob,
                builder: Worker.IB_IMAGE_SINGLE
            };
            for (let i = 0; i < 4; i++) {
                terrainGraphic.tiles.push({
                    q: -i,
                    r: i,
                    type: getTerrainMap(terrains),
                    set_no_flag: [flag]
                });
                terrainGraphic.tiles.push({
                    q: 1 - i,
                    r: i,
                    type: getTerrainMap(terrains),
                    set_no_flag: [flag]
                });
            }
            tgGroup.addTg(terrainGraphic);
        };
        Worker.MOUNTAINS_1x3_SW_NE = (tgGroup, terrains, imageStem, flag, prob) => {
            const center = { x: 144 - 162, y: 162 - 108 };
            const img1 = {
                name: imageStem + \"_1\",
                postfix: \"\",
                layer: 0,
                center: center,
                base: { x: 88 - 162, y: 180 - 108 },
                variations: [\"\"]
            };
            const img2 = {
                name: imageStem + \"_2\",
                postfix: \"\",
                layer: 0,
                center: center,
                base: { x: 142 - 162, y: 144 - 108 },
                variations: [\"\"]
            };
            const img3 = {
                name: imageStem + \"_3\",
                postfix: \"\",
                layer: 0,
                center: center,
                base: { x: 196 - 162, y: 128 - 108 },
                variations: [\"\"]
            };
            const terrainGraphic = {
                tiles: [],
                images: [img1, img2, img3],
                probability: prob,
                builder: Worker.IB_IMAGE_SINGLE
            };
            for (let i = 0; i < 3; i++) {
                terrainGraphic.tiles.push({
                    q: -i,
                    r: i,
                    type: getTerrainMap(terrains),
                    set_no_flag: [flag]
                });
            }
            tgGroup.addTg(terrainGraphic);
        };
        Worker.MOUNTAINS_2x2 = (tgGroup, terrains, imageStem, flag, prob) => {
            const center = { x: 144 - 108, y: 144 - 72 };
            const img1 = {
                name: imageStem + \"_1\",
                postfix: \"\",
                layer: 0,
                center: center,
                base: { x: 88 - 108, y: 107 - 72 },
                variations: [\"\"]
            };
            const img2 = {
                name: imageStem + \"_2\",
                postfix: \"\",
                layer: 0,
                center: center,
                base: { x: 142 - 108, y: 72 - 72 },
                variations: [\"\"]
            };
            const img3 = {
                name: imageStem + \"_3\",
                postfix: \"\",
                layer: 0,
                center: center,
                base: { x: 196 - 108, y: 107 - 72 },
                variations: [\"\"]
            };
            const terrainGraphic = {
                tiles: [],
                images: [img1, img2, img3],
                probability: prob,
                builder: Worker.IB_IMAGE_SINGLE
            };
            for (let i = 0; i < 2; i++) {
                terrainGraphic.tiles.push({
                    q: -i,
                    r: i,
                    type: getTerrainMap(terrains),
                    set_no_flag: [flag]
                });
                terrainGraphic.tiles.push({
                    q: 1 - i,
                    r: i,
                    type: getTerrainMap(terrains),
                    set_no_flag: [flag]
                });
            }
            tgGroup.addTg(terrainGraphic);
        };
        Worker.VOLCANO_2x2 = (tgGroup, volcano, adjacent, imageStem, flag) => {
            const center = { x: 144 - 108, y: 144 - 72 };
            const img1 = {
                name: imageStem + \"_1\",
                postfix: \"\",
                layer: 0,
                center: center,
                base: { x: 88 - 108, y: 107 - 72 },
                variations: [\"\"]
            };
            const img2 = {
                name: imageStem + \"_2\",
                postfix: \"\",
                layer: 0,
                center: center,
                base: { x: 142 - 108, y: 72 - 72 },
                variations: [\"\"]
            };
            const img3 = {
                name: imageStem + \"_3\",
                postfix: \"\",
                center: center,
                layer: 0,
                base: { x: 196 - 108, y: 107 - 72 },
                variations: [\"\"]
            };
            const terrainGraphic = {
                tiles: [],
                images: [img1, img2, img3],
                probability: 100,
                builder: Worker.IB_IMAGE_SINGLE
            };
            terrainGraphic.tiles.push({
                q: 0,
                r: 0,
                type: getTerrainMap(volcano),
                set_no_flag: [flag]
            });
            terrainGraphic.tiles.push({
                q: 1,
                r: 0,
                type: getTerrainMap(adjacent),
                set_no_flag: [flag]
            });
            terrainGraphic.tiles.push({
                q: -1,
                r: 1,
                type: getTerrainMap(adjacent),
                set_no_flag: [flag]
            });
            terrainGraphic.tiles.push({
                q: 0,
                r: 1,
                type: getTerrainMap(adjacent),
                set_no_flag: [flag]
            });
            tgGroup.addTg(terrainGraphic);
        };
        const CORNER_PLFB_CONVEX = (tgGroup, terrains, adjacent, imageStem, plfb) => {
            // 0 [\"tr\", \"r\", \"br\", \"bl\", \"l\", \"tl\"]
            tgGroup.addTg({
                tiles: [{
                        q: 0,
                        r: 0,
                        type: getTerrainMap(terrains),
                        set_no_flag: [plfb.flag + \"-tr\"]
                    }, {
                        q: 0,
                        r: -1,
                        type: getTerrainMap(adjacent),
                        set_no_flag: [plfb.flag + \"-br\"]
                    }, {
                        q: 1,
                        r: -1,
                        type: getTerrainMap(adjacent),
                        set_no_flag: [plfb.flag + \"-l\"]
                    }
                ],
                images: [{
                        name: imageStem,
                        postfix: \"-tr\",
                        layer: plfb.layer,
                        center: { x: 72 - 9, y: 0 },
                        variations: [\"\"]
                    }],
                transition: getTerrainMap(adjacent),
                transitionNumber: 2,
                probability: plfb.prob,
                builder: plfb.builder
            });
            // 1 [\"tr\", \"r\", \"br\", \"bl\", \"l\", \"tl\"]
            tgGroup.addTg({
                tiles: [{
                        q: 0,
                        r: 0,
                        type: getTerrainMap(terrains),
                        set_no_flag: [plfb.flag + \"-r\"]
                    }, {
                        q: 1,
                        r: -1,
                        type: getTerrainMap(adjacent),
                        set_no_flag: [plfb.flag + \"-bl\"]
                    }, {
                        q: 1,
                        r: 0,
                        type: getTerrainMap(adjacent),
                        set_no_flag: [plfb.flag + \"-tl\"]
                    }
                ],
                images: [{
                        name: imageStem,
                        postfix: \"-r\",
                        layer: plfb.layer,
                        center: { x: 72 - 9, y: 18 },
                        variations: [\"\"]
                    }],
                transition: getTerrainMap(adjacent),
                transitionNumber: 2,
                probability: plfb.prob,
                builder: plfb.builder
            });
            // 2 [\"tr\", \"r\", \"br\", \"bl\", \"l\", \"tl\"]
            tgGroup.addTg({
                tiles: [{
                        q: 0,
                        r: 0,
                        type: getTerrainMap(terrains),
                        set_no_flag: [plfb.flag + \"-br\"]
                    }, {
                        q: 1,
                        r: 0,
                        type: getTerrainMap(adjacent),
                        set_no_flag: [plfb.flag + \"-l\"]
                    }, {
                        q: 0,
                        r: 1,
                        type: getTerrainMap(adjacent),
                        set_no_flag: [plfb.flag + \"-tr\"]
                    }
                ],
                images: [{
                        name: imageStem,
                        postfix: \"-br\",
                        layer: plfb.layer,
                        center: { x: 54, y: 54 + 9 },
                        variations: [\"\"]
                    }],
                transition: getTerrainMap(adjacent),
                transitionNumber: 2,
                probability: plfb.prob,
                builder: plfb.builder
            });
            // 3 [\"tr\", \"r\", \"br\", \"bl\", \"l\", \"tl\"]
            tgGroup.addTg({
                tiles: [{
                        q: 0,
                        r: 0,
                        type: getTerrainMap(terrains),
                        set_no_flag: [plfb.flag + \"-bl\"]
                    }, {
                        q: 0,
                        r: 1,
                        type: getTerrainMap(adjacent),
                        set_no_flag: [plfb.flag + \"-tl\"]
                    }, {
                        q: -1,
                        r: 1,
                        type: getTerrainMap(adjacent),
                        set_no_flag: [plfb.flag + \"-r\"]
                    }
                ],
                images: [{
                        name: imageStem,
                        postfix: \"-bl\",
                        layer: plfb.layer,
                        center: { x: 0, y: 36 + 9 },
                        variations: [\"\"]
                    }],
                transition: getTerrainMap(adjacent),
                transitionNumber: 2,
                probability: plfb.prob,
                builder: plfb.builder
            });
            // 4 [\"tr\", \"r\", \"br\", \"bl\", \"l\", \"tl\"]
            tgGroup.addTg({
                tiles: [{
                        q: 0,
                        r: 0,
                        type: getTerrainMap(terrains),
                        set_no_flag: [plfb.flag + \"-l\"]
                    }, {
                        q: -1,
                        r: 1,
                        type: getTerrainMap(adjacent),
                        set_no_flag: [plfb.flag + \"-tr\"]
                    }, {
                        q: -1,
                        r: 0,
                        type: getTerrainMap(adjacent),
                        set_no_flag: [plfb.flag + \"-br\"]
                    }
                ],
                images: [{
                        name: imageStem,
                        postfix: \"-l\",
                        layer: plfb.layer,
                        center: { x: 0, y: 27 },
                        variations: [\"\"]
                    }],
                transition: getTerrainMap(adjacent),
                transitionNumber: 2,
                probability: plfb.prob,
                builder: plfb.builder
            });
            // 5 [\"tr\", \"r\", \"br\", \"bl\", \"l\", \"tl\"]
            tgGroup.addTg({
                tiles: [{
                        q: 0,
                        r: 0,
                        type: getTerrainMap(terrains),
                        set_no_flag: [plfb.flag + \"-tl\"]
                    }, {
                        q: -1,
                        r: 0,
                        type: getTerrainMap(adjacent),
                        set_no_flag: [plfb.flag + \"-r\"]
                    }, {
                        q: 0,
                        r: -1,
                        type: getTerrainMap(adjacent),
                        set_no_flag: [plfb.flag + \"-bl\"]
                    }
                ],
                images: [{
                        name: imageStem,
                        postfix: \"-tl\",
                        layer: plfb.layer,
                        center: { x: 9, y: -18 },
                        variations: [\"\"]
                    }],
                transition: getTerrainMap(adjacent),
                transitionNumber: 2,
                probability: plfb.prob,
                builder: plfb.builder
            });
        };
        const CORNER_PLFB_CONCAVE = (tgGroup, terrains, adjacent, imageStem, plfb) => {
            // 0 [\"tr\", \"r\", \"br\", \"bl\", \"l\", \"tl\"]
            tgGroup.addTg({
                tiles: [{
                        q: 0,
                        r: 0,
                        type: getTerrainMap(terrains),
                        set_no_flag: [plfb.flag + \"-tr\"]
                    }, {
                        q: 0,
                        r: -1,
                        type: getTerrainMap(adjacent),
                        set_no_flag: [plfb.flag + \"-br\"]
                    }, {
                        q: 1,
                        r: -1,
                        type: getTerrainMap(adjacent),
                        set_no_flag: [plfb.flag + \"-l\"]
                    }
                ],
                images: [{
                        name: imageStem,
                        postfix: \"-tr\",
                        layer: plfb.layer,
                        center: { x: 72 - 9, y: 0 },
                        variations: [\"\"]
                    }],
                transition: getTerrainMap(adjacent),
                transitionNumber: 2,
                probability: plfb.prob,
                builder: plfb.builder
            });
            // 1 [\"tr\", \"r\", \"br\", \"bl\", \"l\", \"tl\"]
            tgGroup.addTg({
                tiles: [{
                        q: 0,
                        r: 0,
                        type: getTerrainMap(terrains),
                        set_no_flag: [plfb.flag + \"-r\"]
                    }, {
                        q: 1,
                        r: -1,
                        type: getTerrainMap(adjacent),
                        set_no_flag: [plfb.flag + \"-bl\"]
                    }, {
                        q: 1,
                        r: 0,
                        type: getTerrainMap(adjacent),
                        set_no_flag: [plfb.flag + \"-tl\"]
                    }
                ],
                images: [{
                        name: imageStem,
                        postfix: \"-r\",
                        layer: plfb.layer,
                        center: { x: 72 - 9, y: 18 },
                        variations: [\"\"]
                    }],
                transition: getTerrainMap(adjacent),
                transitionNumber: 2,
                probability: plfb.prob,
                builder: plfb.builder
            });
            // 2 [\"tr\", \"r\", \"br\", \"bl\", \"l\", \"tl\"]
            tgGroup.addTg({
                tiles: [{
                        q: 0,
                        r: 0,
                        type: getTerrainMap(terrains),
                        set_no_flag: [plfb.flag + \"-br\"]
                    }, {
                        q: 1,
                        r: 0,
                        type: getTerrainMap(adjacent),
                        set_no_flag: [plfb.flag + \"-l\"]
                    }, {
                        q: 0,
                        r: 1,
                        type: getTerrainMap(adjacent),
                        set_no_flag: [plfb.flag + \"-tr\"]
                    }
                ],
                images: [{
                        name: imageStem,
                        postfix: \"-br\",
                        layer: plfb.layer,
                        center: { x: 54 + 9, y: 54 + 9 },
                        variations: [\"\"]
                    }],
                transition: getTerrainMap(adjacent),
                transitionNumber: 2,
                probability: plfb.prob,
                builder: plfb.builder
            });
            // 3 [\"tr\", \"r\", \"br\", \"bl\", \"l\", \"tl\"]
            tgGroup.addTg({
                tiles: [{
                        q: 0,
                        r: 0,
                        type: getTerrainMap(terrains),
                        set_no_flag: [plfb.flag + \"-bl\"]
                    }, {
                        q: 0,
                        r: 1,
                        type: getTerrainMap(adjacent),
                        set_no_flag: [plfb.flag + \"-tl\"]
                    }, {
                        q: -1,
                        r: 1,
                        type: getTerrainMap(adjacent),
                        set_no_flag: [plfb.flag + \"-r\"]
                    }
                ],
                images: [{
                        name: imageStem,
                        postfix: \"-bl\",
                        layer: plfb.layer,
                        center: { x: 9, y: 36 + 9 },
                        variations: [\"\"]
                    }],
                transition: getTerrainMap(adjacent),
                transitionNumber: 2,
                probability: plfb.prob,
                builder: plfb.builder
            });
            // 4 [\"tr\", \"r\", \"br\", \"bl\", \"l\", \"tl\"]
            tgGroup.addTg({
                tiles: [{
                        q: 0,
                        r: 0,
                        type: getTerrainMap(terrains),
                        set_no_flag: [plfb.flag + \"-l\"]
                    }, {
                        q: -1,
                        r: 1,
                        type: getTerrainMap(adjacent),
                        set_no_flag: [plfb.flag + \"-tr\"]
                    }, {
                        q: -1,
                        r: 0,
                        type: getTerrainMap(adjacent),
                        set_no_flag: [plfb.flag + \"-br\"]
                    }
                ],
                images: [{
                        name: imageStem,
                        postfix: \"-l\",
                        layer: plfb.layer,
                        center: { x: 9, y: 36 },
                        variations: [\"\"]
                    }],
                transition: getTerrainMap(adjacent),
                transitionNumber: 2,
                probability: plfb.prob,
                builder: plfb.builder
            });
            // 5 [\"tr\", \"r\", \"br\", \"bl\", \"l\", \"tl\"]
            tgGroup.addTg({
                tiles: [{
                        q: 0,
                        r: 0,
                        type: getTerrainMap(terrains),
                        set_no_flag: [plfb.flag + \"-tl\"]
                    }, {
                        q: -1,
                        r: 0,
                        type: getTerrainMap(adjacent),
                        set_no_flag: [plfb.flag + \"-r\"]
                    }, {
                        q: 0,
                        r: -1,
                        type: getTerrainMap(adjacent),
                        set_no_flag: [plfb.flag + \"-bl\"]
                    }
                ],
                images: [{
                        name: imageStem,
                        postfix: \"-tl\",
                        layer: plfb.layer,
                        center: { x: 9, y: -18 },
                        variations: [\"\"]
                    }],
                transition: getTerrainMap(adjacent),
                transitionNumber: 2,
                probability: plfb.prob,
                builder: plfb.builder
            });
        };
        Worker.WALL_TRANSITION_PLFB = (tgGroup, terrains, adjacent, imageStem, plfb) => {
            if (plfb.layer === undefined)
                plfb.layer = 0;
            if (plfb.flag === undefined)
                plfb.flag = \"overlay\";
            if (plfb.builder === undefined)
                plfb.builder = Worker.IB_IMAGE_SINGLE;
            if (plfb.prob === undefined)
                plfb.prob = 100;
            CORNER_PLFB_CONVEX(tgGroup, terrains, adjacent, imageStem + \"-convex\", plfb);
            CORNER_PLFB_CONCAVE(tgGroup, adjacent, terrains, imageStem + \"-concave\", plfb);
        };
        Worker.NEW_FOREST = (tgGroup, terrains, overlays, adjacent, imageStem) => {
            tgGroup.addTg({
                tiles: [{
                        q: 0,
                        r: 0,
                        overlay: getTerrainMap(overlays),
                        type: getTerrainMap(terrains),
                        set_no_flag: [\"overlay\"]
                    }, {
                        q: 0,
                        r: -1,
                        type: getTerrainMap(adjacent)
                    }
                ],
                images: [{
                        name: imageStem + \"-small@V\",
                        postfix: \"\",
                        layer: 0,
                        center: { x: 36, y: 36 },
                        base: { x: 36, y: 36 },
                        variations: [\"\", \"2\", \"3\", \"4\", \"5\", \"6\", \"7\", \"8\", \"9\", \"10\", \"11\"],
                    }],
                probability: 100,
                rotations: [\"n\", \"ne\", \"se\", \"s\", \"sw\", \"nw\"],
                builder: Worker.IB_IMAGE_SINGLE
            });
            tgGroup.addTg({
                tiles: [{
                        q: 0,
                        r: 0,
                        overlay: getTerrainMap(overlays),
                        type: getTerrainMap(terrains),
                        set_no_flag: [\"overlay\"]
                    }],
                images: [{
                        name: imageStem + \"@V\",
                        postfix: \"\",
                        layer: 0,
                        center: { x: 36, y: 36 },
                        base: { x: 36, y: 36 },
                        variations: [\"\", \"2\", \"3\", \"4\", \"5\", \"6\", \"7\", \"8\", \"9\", \"10\", \"11\"],
                    }],
                probability: 100,
                builder: Worker.IB_IMAGE_SINGLE
            });
        };
        Worker.NEW_VILLAGE = (tgGroup, terrains, overlays, imageStem) => {
            tgGroup.addTg({
                tiles: [{
                        q: 0,
                        r: 0,
                        overlay: getTerrainMap(overlays),
                        type: getTerrainMap(terrains),
                        set_no_flag: [\"village\"]
                    }],
                images: [{
                        name: imageStem + \"@V\",
                        postfix: \"\",
                        layer: 0,
                        center: { x: 36, y: 36 },
                        base: { x: 36, y: 36 },
                        variations: [\"\", \"2\", \"3\", \"4\"],
                    }],
                probability: 100,
                builder: Worker.IB_IMAGE_SINGLE
            });
        };
        Worker.OVERLAY_RESTRICTED_PLFB = (tgGroup, overlays, adjacent, imageStem, plfb) => {
            GENERIC_RESTRICTED_PLFB(tgGroup, undefined, overlays, adjacent, undefined, imageStem, {
                layer: plfb.layer === undefined ? 0 : plfb.layer,
                flag: plfb.flag === undefined ? \"overlay\" : plfb.flag,
                prob: plfb.prob === undefined ? 100 : plfb.prob,
                builder: plfb.builder === undefined ? Worker.IB_IMAGE_SINGLE : plfb.builder,
            }, \"\");
        };
    })(Worker = WesnothTiles.Worker || (WesnothTiles.Worker = {}));
})(WesnothTiles || (WesnothTiles = {}));
var WesnothTiles;
(function (WesnothTiles) {
    var Worker;
    (function (Worker) {
        'use strict';
        function swapTerrains(terrains) {
            const terrainList = [];
            for (let i = 0; i < WesnothTiles.ETerrain.VOID; i++) {
                if (terrains.indexOf(i) === -1)
                    terrainList.push(i);
            }
            return terrainList;
        }
        Worker.swapTerrains = swapTerrains;
        const addSparseForestMacro = (tgGroup, overlay, imagestem) => {
            Worker.NEW_FOREST(tgGroup, [WesnothTiles.ETerrain.HILLS_DRY, WesnothTiles.ETerrain.HILLS_DESERT, WesnothTiles.ETerrain.HILLS_REGULAR, WesnothTiles.ETerrain.HILLS_SNOW,
                WesnothTiles.ETerrain.MOUNTAIN_SNOW, WesnothTiles.ETerrain.MOUNTAIN_DRY, WesnothTiles.ETerrain.MOUNTAIN_BASIC], [overlay], [WesnothTiles.ETerrain.ABYSS, WesnothTiles.ETerrain.WATER_OCEAN, WesnothTiles.ETerrain.WATER_COAST_TROPICAL, WesnothTiles.ETerrain.FROZEN_ICE,
                WesnothTiles.ETerrain.MOUNTAIN_BASIC, WesnothTiles.ETerrain.MOUNTAIN_DRY, WesnothTiles.ETerrain.MOUNTAIN_SNOW, WesnothTiles.ETerrain.MOUNTAIN_VOLCANO], imagestem);
        };
        const addForestMacro = (tgGroup, overlay, imagestem) => {
            Worker.NEW_FOREST(tgGroup, undefined, [overlay], [WesnothTiles.ETerrain.ABYSS, WesnothTiles.ETerrain.WATER_OCEAN, WesnothTiles.ETerrain.WATER_COAST_TROPICAL, WesnothTiles.ETerrain.FROZEN_ICE,
                WesnothTiles.ETerrain.MOUNTAIN_BASIC, WesnothTiles.ETerrain.MOUNTAIN_DRY, WesnothTiles.ETerrain.MOUNTAIN_SNOW, WesnothTiles.ETerrain.MOUNTAIN_VOLCANO], imagestem);
        };
        // Group of terrain graphics elements
        class TgGroup {
            constructor() {
                this.tgs = [];
                this.populateTgs();
            }
            // add terrain graphics
            addTg(tg) {
                const tile = tg.tiles[0];
                if (tile.q !== 0 || tile.r !== 0) {
                    console.error(\"One of the macros has improper first tile!\", tg);
                    return;
                }
                tg.hexes = new Map();
                this.tgs.push(tg);
            }
            populateTgs() {
                Worker.OVERLAY_COMPLETE_LFB(this, [WesnothTiles.ETerrain.SWAMP_WATER], [WesnothTiles.ETerrain.HILLS_DESERT, WesnothTiles.ETerrain.HILLS_DRY, WesnothTiles.ETerrain.HILLS_REGULAR, WesnothTiles.ETerrain.HILLS_SNOW,
                    WesnothTiles.ETerrain.MOUNTAIN_DRY, WesnothTiles.ETerrain.MOUNTAIN_DRY, WesnothTiles.ETerrain.MOUNTAIN_SNOW,
                    WesnothTiles.ETerrain.FROZEN_ICE, WesnothTiles.ETerrain.FROZEN_SNOW, WesnothTiles.ETerrain.ABYSS], \"swamp/reed\", { layer: -85, flag: \"base2\" });
                addSparseForestMacro(this, WesnothTiles.EOverlay.WOODS_PINE, \"forest/pine-sparse\");
                addForestMacro(this, WesnothTiles.EOverlay.WOODS_PINE, \"forest/pine\");
                addSparseForestMacro(this, WesnothTiles.EOverlay.SNOW_FOREST, \"forest/snow-forest-sparse\");
                addForestMacro(this, WesnothTiles.EOverlay.SNOW_FOREST, \"forest/snow-forest\");
                addSparseForestMacro(this, WesnothTiles.EOverlay.JUNGLE, \"forest/tropical/jungle-sparse\");
                addForestMacro(this, WesnothTiles.EOverlay.JUNGLE, \"forest/tropical/jungle\");
                addSparseForestMacro(this, WesnothTiles.EOverlay.PALM_DESERT, \"forest/tropical/palm-desert-sparse\");
                addForestMacro(this, WesnothTiles.EOverlay.PALM_DESERT, \"forest/tropical/palm-desert\");
                addSparseForestMacro(this, WesnothTiles.EOverlay.PALM_DESERT, \"forest/tropical/palm-desert-sparse\");
                addForestMacro(this, WesnothTiles.EOverlay.PALM_DESERT, \"forest/tropical/palm-desert\");
                addForestMacro(this, WesnothTiles.EOverlay.RAINFOREST, \"forest/tropical/rainforest\");
                addSparseForestMacro(this, WesnothTiles.EOverlay.SAVANNA, \"forest/tropical/savanna-sparse\");
                addForestMacro(this, WesnothTiles.EOverlay.SAVANNA, \"forest/tropical/savanna\");
                addSparseForestMacro(this, WesnothTiles.EOverlay.DECIDUOUS_SUMMER, \"forest/deciduous-summer-sparse\");
                addForestMacro(this, WesnothTiles.EOverlay.DECIDUOUS_SUMMER, \"forest/deciduous-summer\");
                addSparseForestMacro(this, WesnothTiles.EOverlay.DECIDUOUS_FALL, \"forest/deciduous-fall-sparse\");
                addForestMacro(this, WesnothTiles.EOverlay.DECIDUOUS_FALL, \"forest/deciduous-fall\");
                addSparseForestMacro(this, WesnothTiles.EOverlay.DECIDUOUS_WINTER, \"forest/deciduous-winter-sparse\");
                addForestMacro(this, WesnothTiles.EOverlay.DECIDUOUS_WINTER, \"forest/deciduous-winter\");
                addSparseForestMacro(this, WesnothTiles.EOverlay.DECIDUOUS_WINTER_SNOW, \"forest/deciduous-winter-snow-sparse\");
                addForestMacro(this, WesnothTiles.EOverlay.DECIDUOUS_WINTER_SNOW, \"forest/deciduous-winter-snow\");
                addSparseForestMacro(this, WesnothTiles.EOverlay.MIXED_SUMMER, \"forest/mixed-summer-sparse\");
                addForestMacro(this, WesnothTiles.EOverlay.MIXED_SUMMER, \"forest/mixed-summer\");
                addSparseForestMacro(this, WesnothTiles.EOverlay.MIXED_FALL, \"forest/mixed-fall-sparse\");
                addForestMacro(this, WesnothTiles.EOverlay.MIXED_FALL, \"forest/mixed-fall\");
                addSparseForestMacro(this, WesnothTiles.EOverlay.MIXED_WINTER, \"forest/mixed-winter-sparse\");
                addForestMacro(this, WesnothTiles.EOverlay.MIXED_WINTER, \"forest/mixed-winter\");
                addSparseForestMacro(this, WesnothTiles.EOverlay.MIXED_WINTER_SNOW, \"forest/mixed-winter-snow-sparse\");
                addForestMacro(this, WesnothTiles.EOverlay.MIXED_WINTER_SNOW, \"forest/mixed-winter-snow\");
                addForestMacro(this, WesnothTiles.EOverlay.MUSHROOMS, \"forest/mushrooms\");
                Worker.OVERLAY_PLFB(this, undefined, [WesnothTiles.EOverlay.OASIS], undefined, \"village/desert-oasis-1\", { prob: 30 });
                Worker.OVERLAY_PLFB(this, undefined, [WesnothTiles.EOverlay.OASIS], undefined, \"village/desert-oasis-2\", { prob: 43 });
                Worker.OVERLAY_PLFB(this, undefined, [WesnothTiles.EOverlay.OASIS], undefined, \"village/desert-oasis-3\", { prob: 100 });
                Worker.OVERLAY_RANDOM_LFB(this, undefined, [WesnothTiles.EOverlay.DETRITUS], undefined, \"misc/detritus/detritusA\", {});
                Worker.OVERLAY_RANDOM_LFB(this, undefined, [WesnothTiles.EOverlay.TRASH], undefined, \"misc/detritus/trashA\", {});
                Worker.OVERLAY_RANDOM_LFB(this, undefined, [WesnothTiles.EOverlay.LITER], undefined, \"misc/detritus/liter\", {});
                Worker.VOLCANO_2x2(this, [WesnothTiles.ETerrain.MOUNTAIN_VOLCANO], [WesnothTiles.ETerrain.MOUNTAIN_BASIC, WesnothTiles.ETerrain.MOUNTAIN_DRY], \"mountains/volcano6\", \"base2\");
                Worker.OVERLAY_RESTRICTED3_PLFB(this, [WesnothTiles.ETerrain.MOUNTAIN_BASIC], [WesnothTiles.ETerrain.WATER_OCEAN, WesnothTiles.ETerrain.WATER_COAST_TROPICAL, WesnothTiles.ETerrain.ABYSS], \"mountains/basic-castle-n\", { flag: \"base2\" });
                Worker.OVERLAY_ROTATION_RESTRICTED2_PLFB(this, [WesnothTiles.ETerrain.MOUNTAIN_BASIC], [WesnothTiles.ETerrain.WATER_OCEAN, WesnothTiles.ETerrain.WATER_COAST_TROPICAL, WesnothTiles.ETerrain.ABYSS], \"mountains/basic-castle\", { flag: \"base2\" });
                Worker.OVERLAY_RESTRICTED2_PLFB(this, [WesnothTiles.ETerrain.MOUNTAIN_BASIC], [WesnothTiles.ETerrain.ABYSS], \"mountains/basic-castle-n\", { flag: \"base2\" });
                Worker.OVERLAY_ROTATION_RESTRICTED_PLFB(this, [WesnothTiles.ETerrain.MOUNTAIN_BASIC], [WesnothTiles.ETerrain.WATER_OCEAN, WesnothTiles.ETerrain.WATER_COAST_TROPICAL, WesnothTiles.ETerrain.ABYSS], \"mountains/basic-castle\", { flag: \"base2\" });
                Worker.MOUNTAINS_2x4_NW_SE(this, [WesnothTiles.ETerrain.MOUNTAIN_BASIC], \"mountains/basic_range3\", \"base2\", 18); // Mm    
                Worker.MOUNTAINS_2x4_SW_NE(this, [WesnothTiles.ETerrain.MOUNTAIN_BASIC], \"mountains/basic_range4\", \"base2\", 26); // Mm    
                Worker.MOUNTAINS_1x3_NW_SE(this, [WesnothTiles.ETerrain.MOUNTAIN_BASIC], \"mountains/basic_range1\", \"base2\", 20); // Mm    
                Worker.MOUNTAINS_1x3_SW_NE(this, [WesnothTiles.ETerrain.MOUNTAIN_BASIC], \"mountains/basic_range2\", \"base2\", 20); // Mm    
                Worker.MOUNTAINS_2x2(this, [WesnothTiles.ETerrain.MOUNTAIN_BASIC], \"mountains/basic5\", \"base2\", 40); // Mm    
                Worker.MOUNTAINS_2x2(this, [WesnothTiles.ETerrain.MOUNTAIN_BASIC], \"mountains/basic6\", \"base2\", 30); // Mm    
                Worker.MOUNTAIN_SINGLE_RANDOM(this, [WesnothTiles.ETerrain.MOUNTAIN_BASIC], \"mountains/basic\", \"base2\"); // Mm
                Worker.OVERLAY_RESTRICTED3_PLFB(this, [WesnothTiles.ETerrain.MOUNTAIN_DRY], [WesnothTiles.ETerrain.WATER_OCEAN, WesnothTiles.ETerrain.WATER_COAST_TROPICAL, WesnothTiles.ETerrain.ABYSS], \"mountains/dry-castle-n\", { flag: \"base2\" });
                Worker.OVERLAY_ROTATION_RESTRICTED2_PLFB(this, [WesnothTiles.ETerrain.MOUNTAIN_DRY], [WesnothTiles.ETerrain.WATER_OCEAN, WesnothTiles.ETerrain.WATER_COAST_TROPICAL, WesnothTiles.ETerrain.ABYSS], \"mountains/dry-castle\", { flag: \"base2\" });
                Worker.OVERLAY_RESTRICTED2_PLFB(this, [WesnothTiles.ETerrain.MOUNTAIN_DRY], [WesnothTiles.ETerrain.ABYSS], \"mountains/dry-castle-n\", { flag: \"base2\" });
                Worker.OVERLAY_ROTATION_RESTRICTED_PLFB(this, [WesnothTiles.ETerrain.MOUNTAIN_DRY], [WesnothTiles.ETerrain.WATER_OCEAN, WesnothTiles.ETerrain.WATER_COAST_TROPICAL, WesnothTiles.ETerrain.ABYSS], \"mountains/dry-castle\", { flag: \"base2\" });
                Worker.MOUNTAINS_2x4_NW_SE(this, [WesnothTiles.ETerrain.MOUNTAIN_DRY], \"mountains/dry_range3\", \"base2\", 18); // Md    
                Worker.MOUNTAINS_2x4_SW_NE(this, [WesnothTiles.ETerrain.MOUNTAIN_DRY], \"mountains/dry_range4\", \"base2\", 26); // Md    
                Worker.MOUNTAINS_1x3_NW_SE(this, [WesnothTiles.ETerrain.MOUNTAIN_DRY], \"mountains/dry_range1\", \"base2\", 20); // Md
                Worker.MOUNTAINS_1x3_SW_NE(this, [WesnothTiles.ETerrain.MOUNTAIN_DRY], \"mountains/dry_range2\", \"base2\", 20); // Md       
                Worker.MOUNTAINS_2x2(this, [WesnothTiles.ETerrain.MOUNTAIN_DRY], \"mountains/dry5\", \"base2\", 40); // Md
                Worker.MOUNTAINS_2x2(this, [WesnothTiles.ETerrain.MOUNTAIN_DRY], \"mountains/dry6\", \"base2\", 30); // Md
                Worker.MOUNTAIN_SINGLE_RANDOM(this, [WesnothTiles.ETerrain.MOUNTAIN_DRY], \"mountains/dry\", \"base2\"); // Md
                Worker.OVERLAY_COMPLETE_LFB(this, [WesnothTiles.ETerrain.MOUNTAIN_VOLCANO], [WesnothTiles.ETerrain.ABYSS], \"mountains/volcano\", { flag: \"base2\" }); // Mv
                Worker.MOUNTAINS_2x2(this, [WesnothTiles.ETerrain.MOUNTAIN_SNOW], \"mountains/snow5\", \"base2\", 15); // Ms
                Worker.MOUNTAINS_2x2(this, [WesnothTiles.ETerrain.MOUNTAIN_SNOW], \"mountains/snow6\", \"base2\", 20); // Ms
                Worker.MOUNTAIN_SINGLE_RANDOM(this, [WesnothTiles.ETerrain.MOUNTAIN_SNOW], \"mountains/snow\", \"base2\"); // Ms
                // villages
                Worker.NEW_VILLAGE(this, [WesnothTiles.ETerrain.HILLS_DRY, WesnothTiles.ETerrain.HILLS_REGULAR], [WesnothTiles.EOverlay.VILLAGE_HUMAN], \"village/human-hills\");
                Worker.NEW_VILLAGE(this, [WesnothTiles.ETerrain.HILLS_SNOW], [WesnothTiles.EOverlay.VILLAGE_HUMAN], \"village/human-snow-hills\");
                Worker.NEW_VILLAGE(this, [WesnothTiles.ETerrain.HILLS_DRY, WesnothTiles.ETerrain.HILLS_REGULAR], [WesnothTiles.EOverlay.VILLAGE_HUMAN_RUIN], \"village/human-hills-ruin\");
                Worker.NEW_VILLAGE(this, [WesnothTiles.ETerrain.FROZEN_SNOW, WesnothTiles.ETerrain.FROZEN_ICE], [WesnothTiles.EOverlay.VILLAGE_HUMAN], \"village/human-snow\");
                Worker.NEW_VILLAGE(this, undefined, [WesnothTiles.EOverlay.VILLAGE_HUMAN], \"village/human\");
                Worker.NEW_VILLAGE(this, undefined, [WesnothTiles.EOverlay.VILLAGE_HUMAN_RUIN], \"village/human-cottage-ruin\");
                Worker.NEW_VILLAGE(this, undefined, [WesnothTiles.EOverlay.VILLAGE_HUMAN_CITY], \"village/human-city\");
                Worker.NEW_VILLAGE(this, [WesnothTiles.ETerrain.FROZEN_SNOW, WesnothTiles.ETerrain.FROZEN_ICE, WesnothTiles.ETerrain.HILLS_SNOW], [WesnothTiles.EOverlay.VILLAGE_HUMAN_CITY], \"village/human-city-snow\");
                Worker.NEW_VILLAGE(this, undefined, [WesnothTiles.EOverlay.VILLAGE_HUMAN_CITY_RUIN], \"village/human-city-ruin\");
                Worker.NEW_VILLAGE(this, undefined, [WesnothTiles.EOverlay.VILLAGE_TROPICAL], \"village/tropical-forest\");
                Worker.NEW_VILLAGE(this, [WesnothTiles.ETerrain.FROZEN_SNOW, WesnothTiles.ETerrain.FROZEN_ICE, WesnothTiles.ETerrain.HILLS_SNOW], [WesnothTiles.EOverlay.VILLAGE_HUT], \"village/hut-snow\");
                Worker.NEW_VILLAGE(this, undefined, [WesnothTiles.EOverlay.VILLAGE_LOG_CABIN], \"village/log-cabin\");
                Worker.NEW_VILLAGE(this, undefined, [WesnothTiles.EOverlay.VILLAGE_CAMP], \"village/camp\");
                Worker.NEW_VILLAGE(this, undefined, [WesnothTiles.EOverlay.VILLAGE_IGLOO], \"village/igloo\");
                Worker.NEW_VILLAGE(this, undefined, [WesnothTiles.EOverlay.VILLAGE_ORC], \"village/orc\");
                Worker.NEW_VILLAGE(this, [WesnothTiles.ETerrain.FROZEN_SNOW, WesnothTiles.ETerrain.FROZEN_ICE, WesnothTiles.ETerrain.HILLS_SNOW], [WesnothTiles.EOverlay.VILLAGE_ELVEN], \"village/elven-snow\");
                Worker.NEW_VILLAGE(this, undefined, [WesnothTiles.EOverlay.VILLAGE_ELVEN], \"village/elven\");
                Worker.NEW_VILLAGE(this, undefined, [WesnothTiles.EOverlay.VILLAGE_DESERT], \"village/desert\");
                Worker.NEW_VILLAGE(this, undefined, [WesnothTiles.EOverlay.VILLAGE_DESERT_CAMP], \"village/desert-camp\");
                Worker.NEW_VILLAGE(this, undefined, [WesnothTiles.EOverlay.VILLAGE_DWARVEN], \"village/dwarven\");
                Worker.NEW_VILLAGE(this, undefined, [WesnothTiles.EOverlay.VILLAGE_SWAMP], \"village/swampwater\");
                Worker.NEW_VILLAGE(this, undefined, [WesnothTiles.EOverlay.VILLAGE_COAST], \"village/coast\");
                Worker.OVERLAY_RANDOM_LFB(this, undefined, [WesnothTiles.EOverlay.FARM_VEGS], undefined, \"embellishments/farm-veg-spring\", { layer: -81 });
                Worker.OVERLAY_RANDOM_LFB(this, undefined, [WesnothTiles.EOverlay.FLOWERS_MIXED], undefined, \"embellishments/flowers-mixed\", { layer: -500 });
                Worker.OVERLAY_RANDOM_LFB(this, undefined, [WesnothTiles.EOverlay.RUBBLE], undefined, \"misc/rubble\", { layer: -1 });
                Worker.OVERLAY_RANDOM_LFB(this, undefined, [WesnothTiles.EOverlay.STONES_SMALL], undefined, \"embellishments/stones-small\", {});
                // fillers for mountains
                Worker.TERRAIN_BASE_RANDOM_LFB(this, [WesnothTiles.ETerrain.MOUNTAIN_BASIC], \"hills/regular\", {});
                Worker.TERRAIN_BASE_RANDOM_LFB(this, [WesnothTiles.ETerrain.MOUNTAIN_DRY], \"hills/dry\", {});
                Worker.TERRAIN_BASE_RANDOM_LFB(this, [WesnothTiles.ETerrain.MOUNTAIN_SNOW], \"hills/snow\", {});
                Worker.TERRAIN_BASE_PLFB(this, [WesnothTiles.ETerrain.GRASS_GREEN], \"grass/green\", { prob: 20 });
                Worker.TERRAIN_BASE_RANDOM_LFB(this, [WesnothTiles.ETerrain.GRASS_GREEN], \"grass/green\", {});
                Worker.TERRAIN_BASE_PLFB(this, [WesnothTiles.ETerrain.GRASS_DRY], \"grass/dry\", { prob: 25 });
                Worker.TERRAIN_BASE_RANDOM_LFB(this, [WesnothTiles.ETerrain.GRASS_DRY], \"grass/dry\", {});
                Worker.TERRAIN_BASE_PLFB(this, [WesnothTiles.ETerrain.GRASS_SEMI_DRY], \"grass/semi-dry\", { prob: 25 });
                Worker.TERRAIN_BASE_RANDOM_LFB(this, [WesnothTiles.ETerrain.GRASS_SEMI_DRY], \"grass/semi-dry\", {});
                Worker.TERRAIN_BASE_RANDOM_LFB(this, [WesnothTiles.ETerrain.GRASS_LEAF_LITTER], \"grass/leaf-litter\", {});
                Worker.TERRAIN_BASE_RANDOM_LFB(this, [WesnothTiles.ETerrain.HILLS_REGULAR], \"hills/regular\", {}); // Hh
                Worker.TERRAIN_BASE_RANDOM_LFB(this, [WesnothTiles.ETerrain.HILLS_DRY], \"hills/dry\", {}); // Hhd
                Worker.TERRAIN_BASE_RANDOM_LFB(this, [WesnothTiles.ETerrain.HILLS_DESERT], \"hills/desert\", {}); // Hd
                Worker.OVERLAY_RESTRICTED_PLFB(this, [WesnothTiles.EOverlay.DESERT_PLANTS], [WesnothTiles.ETerrain.ABYSS], \"embellishments/desert-plant\", { prob: 33 });
                Worker.OVERLAY_RESTRICTED_PLFB(this, [WesnothTiles.EOverlay.DESERT_PLANTS], [WesnothTiles.ETerrain.ABYSS], \"embellishments/desert-plant1\", { prob: 50 });
                Worker.OVERLAY_RESTRICTED_PLFB(this, [WesnothTiles.EOverlay.DESERT_PLANTS], [WesnothTiles.ETerrain.ABYSS], \"embellishments/desert-plant2\", { prob: 100 });
                Worker.OVERLAY_RANDOM_LFB(this, undefined, [WesnothTiles.EOverlay.DESERT_PLANTS], undefined, \"embellishments/desert-plant\", {});
                Worker.TERRAIN_BASE_RANDOM_LFB(this, [WesnothTiles.ETerrain.HILLS_SNOW], \"hills/snow\", {}); // Ha
                Worker.TERRAIN_BASE_RANDOM_LFB(this, [WesnothTiles.ETerrain.ABYSS], \"chasm/abyss\", {}); // Ha
                Worker.TERRAIN_BASE_RANDOM_LFB(this, [WesnothTiles.ETerrain.SAND_DESERT], \"sand/desert\", {}); // Hhd
                Worker.TERRAIN_BASE_RANDOM_LFB(this, [WesnothTiles.ETerrain.SAND_BEACH], \"sand/beach\", {}); // Hhd
                Worker.TERRAIN_BASE_RANDOM_LFB(this, [WesnothTiles.ETerrain.FROZEN_SNOW], \"frozen/snow\", {}); // Aa
                Worker.TERRAIN_BASE_PLFB(this, [WesnothTiles.ETerrain.FROZEN_ICE], \"frozen/ice2\", { prob: 10 }); // Ai
                Worker.TERRAIN_BASE_PLFB(this, [WesnothTiles.ETerrain.FROZEN_ICE], \"frozen/ice3\", { prob: 11 }); // Ai
                Worker.TERRAIN_BASE_PLFB(this, [WesnothTiles.ETerrain.FROZEN_ICE], \"frozen/ice5\", { prob: 13 }); // Ai
                Worker.TERRAIN_BASE_PLFB(this, [WesnothTiles.ETerrain.FROZEN_ICE], \"frozen/ice6\", { prob: 14 }); // Ai
                Worker.TERRAIN_BASE_PLFB(this, [WesnothTiles.ETerrain.FROZEN_ICE], \"frozen/ice4\", { prob: 42 }); // Ai
                Worker.TERRAIN_BASE_PLFB(this, [WesnothTiles.ETerrain.FROZEN_ICE], \"frozen/ice\", {}); // Hhd
                Worker.TERRAIN_BASE_RANDOM_LFB(this, [WesnothTiles.ETerrain.SWAMP_MUD], \"swamp/mud\", {}); // Sm
                Worker.TERRAIN_BASE_PLFB(this, [WesnothTiles.ETerrain.SWAMP_WATER], \"swamp/water-plant@V\", { prob: 33 }); // Sm
                Worker.TERRAIN_BASE_RANDOM_LFB(this, [WesnothTiles.ETerrain.SWAMP_WATER], \"swamp/water\", {}); // Sm
                Worker.TERRAIN_BASE_PLFB(this, [WesnothTiles.ETerrain.VOID], \"void/void\", { layer: 1000 });
                Worker.TERRAIN_BASE_SINGLEHEX_PLFB(this, [WesnothTiles.ETerrain.WATER_OCEAN], \"water/ocean\", {
                    builder: Worker.IB_ANIMATION_15_SLOW
                }); // Wo
                Worker.TERRAIN_BASE_SINGLEHEX_PLFB(this, [WesnothTiles.ETerrain.WATER_COAST_TROPICAL], \"water/coast-tropical\", {
                    builder: Worker.IB_ANIMATION_15
                }); // Wwt
                Worker.OVERLAY_RANDOM_LFB(this, undefined, undefined, true, \"fog/fog\", { layer: 999, flag: \"fog\" });
                Worker.FOG_TRANSITION_LFB(this, true, false, \"fog/fog\", { layer: 999, flag: \"fog\" }, [6, 4, 3, 2, 1]);
                // chasms transitions
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.ABYSS], [WesnothTiles.ETerrain.MOUNTAIN_DRY, WesnothTiles.ETerrain.MOUNTAIN_BASIC, WesnothTiles.ETerrain.MOUNTAIN_SNOW, WesnothTiles.ETerrain.MOUNTAIN_VOLCANO], \"mountains/blend-from-chasm\", { layer: 2, flag: \"transition3\" }, [1]);
                Worker.WALL_TRANSITION_PLFB(this, [WesnothTiles.ETerrain.ABYSS], [WesnothTiles.ETerrain.FROZEN_ICE, WesnothTiles.ETerrain.FROZEN_SNOW, WesnothTiles.ETerrain.MOUNTAIN_SNOW, WesnothTiles.ETerrain.HILLS_SNOW], \"chasm/regular-snow\", { layer: -90, flag: \"ground\" });
                Worker.WALL_TRANSITION_PLFB(this, [WesnothTiles.ETerrain.ABYSS], [WesnothTiles.ETerrain.WATER_OCEAN, WesnothTiles.ETerrain.WATER_COAST_TROPICAL, WesnothTiles.ETerrain.SWAMP_WATER, WesnothTiles.ETerrain.SWAMP_MUD], \"chasm/water\", { layer: -90, flag: \"ground\" });
                Worker.WALL_TRANSITION_PLFB(this, [WesnothTiles.ETerrain.ABYSS], swapTerrains([WesnothTiles.ETerrain.ABYSS]), \"chasm/regular\", { layer: -90, flag: \"ground\" });
                // transitions --------------------------
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.MOUNTAIN_DRY, WesnothTiles.ETerrain.MOUNTAIN_VOLCANO], swapTerrains([WesnothTiles.ETerrain.MOUNTAIN_DRY, WesnothTiles.ETerrain.HILLS_DRY, WesnothTiles.ETerrain.MOUNTAIN_VOLCANO,
                    WesnothTiles.ETerrain.WATER_OCEAN, WesnothTiles.ETerrain.WATER_COAST_TROPICAL, WesnothTiles.ETerrain.SWAMP_WATER, WesnothTiles.ETerrain.SWAMP_MUD, WesnothTiles.ETerrain.ABYSS]), \"mountains/dry\", { layer: -166 }, [1]);
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.HILLS_DRY, WesnothTiles.ETerrain.HILLS_DESERT, WesnothTiles.ETerrain.GRASS_DRY, WesnothTiles.ETerrain.HILLS_SNOW,
                    WesnothTiles.ETerrain.SAND_DESERT, WesnothTiles.ETerrain.SAND_BEACH, WesnothTiles.ETerrain.FROZEN_ICE, WesnothTiles.ETerrain.FROZEN_SNOW], [WesnothTiles.ETerrain.MOUNTAIN_BASIC], \"mountains/blend-from-dry\", { layer: 0, flag: \"inside\" }, [1]);
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.HILLS_DRY, WesnothTiles.ETerrain.HILLS_DESERT, WesnothTiles.ETerrain.GRASS_DRY,
                    WesnothTiles.ETerrain.SAND_DESERT, WesnothTiles.ETerrain.SAND_BEACH], [WesnothTiles.ETerrain.MOUNTAIN_SNOW], \"mountains/blend-from-dry\", { layer: 0, flag: \"inside\" }, [1]);
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.MOUNTAIN_BASIC], [WesnothTiles.ETerrain.HILLS_DRY, WesnothTiles.ETerrain.HILLS_DESERT, WesnothTiles.ETerrain.GRASS_DRY, WesnothTiles.ETerrain.HILLS_SNOW,
                    WesnothTiles.ETerrain.SAND_DESERT, WesnothTiles.ETerrain.SAND_BEACH, WesnothTiles.ETerrain.FROZEN_ICE, WesnothTiles.ETerrain.FROZEN_SNOW], \"hills/dry\", { layer: -166 }, [2, 1]);
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.MOUNTAIN_SNOW], [WesnothTiles.ETerrain.HILLS_DRY, WesnothTiles.ETerrain.HILLS_DESERT, WesnothTiles.ETerrain.GRASS_DRY,
                    WesnothTiles.ETerrain.SAND_DESERT, WesnothTiles.ETerrain.SAND_BEACH], \"hills/dry\", { layer: -166 }, [2, 1]);
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.HILLS_SNOW, WesnothTiles.ETerrain.MOUNTAIN_SNOW], [WesnothTiles.ETerrain.HILLS_DRY, WesnothTiles.ETerrain.HILLS_REGULAR], \"hills/snow-to-hills\", { layer: -170 }, [2, 1]);
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.HILLS_SNOW, WesnothTiles.ETerrain.MOUNTAIN_SNOW], [WesnothTiles.ETerrain.WATER_OCEAN, WesnothTiles.ETerrain.WATER_COAST_TROPICAL, WesnothTiles.ETerrain.SWAMP_WATER, WesnothTiles.ETerrain.SWAMP_MUD], \"hills/snow-to-water\", { layer: -171 }, [2, 1]);
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.HILLS_SNOW, WesnothTiles.ETerrain.MOUNTAIN_SNOW], [WesnothTiles.ETerrain.HILLS_DESERT, WesnothTiles.ETerrain.GRASS_DRY, WesnothTiles.ETerrain.GRASS_SEMI_DRY, WesnothTiles.ETerrain.GRASS_GREEN, WesnothTiles.ETerrain.GRASS_LEAF_LITTER,
                    WesnothTiles.ETerrain.SAND_DESERT, WesnothTiles.ETerrain.SAND_BEACH, WesnothTiles.ETerrain.FROZEN_ICE, WesnothTiles.ETerrain.FROZEN_SNOW], \"hills/snow\", { layer: -172 }, [2, 1]);
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.HILLS_REGULAR, WesnothTiles.ETerrain.MOUNTAIN_BASIC], swapTerrains([WesnothTiles.ETerrain.HILLS_REGULAR, WesnothTiles.ETerrain.WATER_OCEAN, WesnothTiles.ETerrain.WATER_COAST_TROPICAL,
                    WesnothTiles.ETerrain.SWAMP_MUD, WesnothTiles.ETerrain.SWAMP_WATER, WesnothTiles.ETerrain.ABYSS, WesnothTiles.ETerrain.MOUNTAIN_BASIC,
                    WesnothTiles.ETerrain.MOUNTAIN_VOLCANO, WesnothTiles.ETerrain.MOUNTAIN_DRY]), \"hills/regular\", { layer: -180 }, [2, 1]);
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.HILLS_DRY], swapTerrains([WesnothTiles.ETerrain.HILLS_DRY, WesnothTiles.ETerrain.WATER_OCEAN, WesnothTiles.ETerrain.WATER_COAST_TROPICAL,
                    WesnothTiles.ETerrain.SWAMP_MUD, WesnothTiles.ETerrain.SWAMP_WATER, WesnothTiles.ETerrain.MOUNTAIN_SNOW,
                    WesnothTiles.ETerrain.MOUNTAIN_BASIC, WesnothTiles.ETerrain.HILLS_REGULAR, WesnothTiles.ETerrain.HILLS_SNOW]), \"hills/dry\", { layer: -183 }, [2, 1]);
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.HILLS_DESERT], swapTerrains([WesnothTiles.ETerrain.HILLS_DESERT, WesnothTiles.ETerrain.WATER_OCEAN, WesnothTiles.ETerrain.WATER_COAST_TROPICAL, WesnothTiles.ETerrain.ABYSS,
                    WesnothTiles.ETerrain.MOUNTAIN_SNOW, WesnothTiles.ETerrain.MOUNTAIN_BASIC, WesnothTiles.ETerrain.HILLS_SNOW, WesnothTiles.ETerrain.HILLS_REGULAR, WesnothTiles.ETerrain.HILLS_DRY]), \"hills/desert\", { layer: -184 }, [2, 1]);
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.SWAMP_WATER], swapTerrains([WesnothTiles.ETerrain.SWAMP_WATER,
                    WesnothTiles.ETerrain.HILLS_DESERT, WesnothTiles.ETerrain.HILLS_DRY, WesnothTiles.ETerrain.HILLS_REGULAR, WesnothTiles.ETerrain.HILLS_SNOW,
                    WesnothTiles.ETerrain.MOUNTAIN_SNOW, WesnothTiles.ETerrain.MOUNTAIN_BASIC, WesnothTiles.ETerrain.MOUNTAIN_DRY,
                    WesnothTiles.ETerrain.FROZEN_SNOW, WesnothTiles.ETerrain.FROZEN_ICE, WesnothTiles.ETerrain.ABYSS]), \"swamp/water\", { layer: -230 }, [3, 2, 1]);
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.GRASS_SEMI_DRY], [WesnothTiles.ETerrain.GRASS_GREEN, WesnothTiles.ETerrain.GRASS_DRY, WesnothTiles.ETerrain.GRASS_LEAF_LITTER], \"grass/semi-dry-long\", { flag: \"inside\", layer: -250 }, [1]);
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.GRASS_GREEN], [WesnothTiles.ETerrain.GRASS_SEMI_DRY, WesnothTiles.ETerrain.GRASS_DRY, WesnothTiles.ETerrain.GRASS_LEAF_LITTER], \"grass/green-long\", { flag: \"inside\", layer: -251 }, [1]);
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.GRASS_DRY], [WesnothTiles.ETerrain.GRASS_GREEN, WesnothTiles.ETerrain.GRASS_SEMI_DRY, WesnothTiles.ETerrain.GRASS_LEAF_LITTER], \"grass/dry-long\", { flag: \"inside\", layer: -252 }, [1]);
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.GRASS_LEAF_LITTER], [WesnothTiles.ETerrain.GRASS_GREEN, WesnothTiles.ETerrain.GRASS_SEMI_DRY, WesnothTiles.ETerrain.GRASS_DRY], \"grass/leaf-litter-long\", { flag: \"inside\", layer: -253 }, [1]);
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.GRASS_LEAF_LITTER], [WesnothTiles.ETerrain.GRASS_GREEN, WesnothTiles.ETerrain.GRASS_SEMI_DRY, WesnothTiles.ETerrain.GRASS_DRY], \"grass/leaf-litter-long\", { layer: -254 }, [1]);
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.GRASS_DRY], [WesnothTiles.ETerrain.GRASS_GREEN, WesnothTiles.ETerrain.GRASS_SEMI_DRY], \"grass/dry-long\", { layer: -255 }, [1]);
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.GRASS_GREEN], [WesnothTiles.ETerrain.GRASS_SEMI_DRY], \"grass/green-long\", { layer: -256 }, [1]);
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.GRASS_SEMI_DRY], [WesnothTiles.ETerrain.SAND_DESERT, WesnothTiles.ETerrain.SAND_BEACH, WesnothTiles.ETerrain.FROZEN_SNOW], \"grass/semi-dry-medium\", { layer: -260 }, [1]);
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.GRASS_GREEN], [WesnothTiles.ETerrain.SAND_DESERT, WesnothTiles.ETerrain.SAND_BEACH, WesnothTiles.ETerrain.FROZEN_SNOW], \"grass/green-medium\", { layer: -261 }, [1]);
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.GRASS_DRY], [WesnothTiles.ETerrain.SAND_DESERT, WesnothTiles.ETerrain.SAND_BEACH, WesnothTiles.ETerrain.FROZEN_SNOW], \"grass/dry-medium\", { layer: -262 }, [1]);
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.GRASS_LEAF_LITTER], [WesnothTiles.ETerrain.SWAMP_MUD,
                    WesnothTiles.ETerrain.SAND_DESERT, WesnothTiles.ETerrain.SAND_BEACH, WesnothTiles.ETerrain.FROZEN_SNOW], \"grass/leaf-litter\", { layer: -270 }, [3, 2, 1]);
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.GRASS_GREEN], [WesnothTiles.ETerrain.WATER_OCEAN, WesnothTiles.ETerrain.WATER_COAST_TROPICAL, WesnothTiles.ETerrain.FROZEN_ICE, WesnothTiles.ETerrain.SWAMP_MUD], \"grass/green-abrupt\", { layer: -271 }, [1]);
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.GRASS_SEMI_DRY], [WesnothTiles.ETerrain.WATER_COAST_TROPICAL, WesnothTiles.ETerrain.WATER_OCEAN, WesnothTiles.ETerrain.FROZEN_ICE, WesnothTiles.ETerrain.SWAMP_MUD], \"grass/semi-dry-abrupt\", { layer: -272 }, [1]);
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.GRASS_DRY], [WesnothTiles.ETerrain.WATER_COAST_TROPICAL, WesnothTiles.ETerrain.WATER_OCEAN, WesnothTiles.ETerrain.FROZEN_ICE, WesnothTiles.ETerrain.SWAMP_MUD], \"grass/dry-abrupt\", { layer: -273 }, [1]);
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.FROZEN_SNOW], [WesnothTiles.ETerrain.WATER_COAST_TROPICAL, WesnothTiles.ETerrain.WATER_OCEAN, WesnothTiles.ETerrain.SWAMP_WATER], \"frozen/snow-to-water\", { layer: -280 }, [4, 3, 2, 1]);
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.FROZEN_SNOW], swapTerrains([WesnothTiles.ETerrain.FROZEN_SNOW, WesnothTiles.ETerrain.ABYSS,
                    WesnothTiles.ETerrain.FROZEN_SNOW, WesnothTiles.ETerrain.ABYSS, WesnothTiles.ETerrain.MOUNTAIN_DRY, WesnothTiles.ETerrain.HILLS_DRY, WesnothTiles.ETerrain.HILLS_REGULAR,
                    WesnothTiles.ETerrain.GRASS_GREEN, WesnothTiles.ETerrain.GRASS_LEAF_LITTER, WesnothTiles.ETerrain.GRASS_SEMI_DRY,
                    WesnothTiles.ETerrain.SWAMP_WATER, WesnothTiles.ETerrain.MOUNTAIN_BASIC, WesnothTiles.ETerrain.HILLS_SNOW, WesnothTiles.ETerrain.MOUNTAIN_SNOW,
                    WesnothTiles.ETerrain.HILLS_DESERT, WesnothTiles.ETerrain.WATER_COAST_TROPICAL, WesnothTiles.ETerrain.WATER_OCEAN, WesnothTiles.ETerrain.MOUNTAIN_VOLCANO]), \"frozen/snow\", { layer: -281 }, [4, 3, 2, 1]);
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.WATER_OCEAN, WesnothTiles.ETerrain.WATER_COAST_TROPICAL, WesnothTiles.ETerrain.FROZEN_ICE], [WesnothTiles.ETerrain.GRASS_LEAF_LITTER], \"flat/bank\", { layer: -300 }, [1]);
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.SWAMP_MUD], [WesnothTiles.ETerrain.SAND_BEACH, WesnothTiles.ETerrain.SAND_DESERT], \"swamp/mud-to-land\", { layer: -310 }, [1]);
                Worker.NEW_WAVES(this, [WesnothTiles.ETerrain.HILLS_DESERT, WesnothTiles.ETerrain.SAND_DESERT, WesnothTiles.ETerrain.SAND_BEACH], [WesnothTiles.ETerrain.WATER_OCEAN, WesnothTiles.ETerrain.WATER_COAST_TROPICAL], -499, \"water/waves\");
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.SAND_BEACH], swapTerrains([WesnothTiles.ETerrain.SAND_BEACH, WesnothTiles.ETerrain.HILLS_DRY,
                    WesnothTiles.ETerrain.WATER_OCEAN, WesnothTiles.ETerrain.WATER_COAST_TROPICAL, WesnothTiles.ETerrain.FROZEN_ICE,
                    WesnothTiles.ETerrain.SWAMP_MUD, WesnothTiles.ETerrain.SWAMP_WATER, WesnothTiles.ETerrain.ABYSS, WesnothTiles.ETerrain.HILLS_DESERT,
                    WesnothTiles.ETerrain.GRASS_LEAF_LITTER, WesnothTiles.ETerrain.GRASS_SEMI_DRY, WesnothTiles.ETerrain.GRASS_DRY, WesnothTiles.ETerrain.GRASS_GREEN,
                    WesnothTiles.ETerrain.MOUNTAIN_BASIC, WesnothTiles.ETerrain.MOUNTAIN_SNOW, WesnothTiles.ETerrain.HILLS_SNOW, WesnothTiles.ETerrain.HILLS_REGULAR, WesnothTiles.ETerrain.MOUNTAIN_BASIC,
                    WesnothTiles.ETerrain.FROZEN_SNOW, WesnothTiles.ETerrain.SWAMP_MUD]), \"sand/beach\", { layer: -510 }, [6, 4, 3, 2, 1]);
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.SAND_DESERT], swapTerrains([WesnothTiles.ETerrain.SAND_DESERT,
                    WesnothTiles.ETerrain.WATER_OCEAN, WesnothTiles.ETerrain.WATER_COAST_TROPICAL, WesnothTiles.ETerrain.FROZEN_ICE, WesnothTiles.ETerrain.FROZEN_SNOW,
                    WesnothTiles.ETerrain.SWAMP_MUD, WesnothTiles.ETerrain.SWAMP_WATER, WesnothTiles.ETerrain.ABYSS,
                    WesnothTiles.ETerrain.MOUNTAIN_BASIC, WesnothTiles.ETerrain.MOUNTAIN_SNOW, WesnothTiles.ETerrain.HILLS_SNOW,
                    WesnothTiles.ETerrain.HILLS_REGULAR, WesnothTiles.ETerrain.HILLS_DRY, WesnothTiles.ETerrain.HILLS_DESERT,
                    WesnothTiles.ETerrain.GRASS_SEMI_DRY, WesnothTiles.ETerrain.GRASS_DRY, WesnothTiles.ETerrain.GRASS_GREEN, WesnothTiles.ETerrain.GRASS_LEAF_LITTER,
                    WesnothTiles.ETerrain.SWAMP_MUD, WesnothTiles.ETerrain.SAND_BEACH]), \"sand/desert\", { layer: -510 }, [6, 4, 3, 2, 1]);
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.HILLS_REGULAR, WesnothTiles.ETerrain.MOUNTAIN_BASIC], [WesnothTiles.ETerrain.WATER_OCEAN, WesnothTiles.ETerrain.WATER_COAST_TROPICAL, WesnothTiles.ETerrain.FROZEN_ICE,
                    WesnothTiles.ETerrain.SWAMP_MUD, WesnothTiles.ETerrain.SWAMP_WATER], \"hills/regular-to-water\", { layer: -482, flag: \"non_submerged\" }, [2, 1]);
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.HILLS_DRY, WesnothTiles.ETerrain.MOUNTAIN_DRY, WesnothTiles.ETerrain.MOUNTAIN_VOLCANO], [WesnothTiles.ETerrain.WATER_OCEAN, WesnothTiles.ETerrain.WATER_COAST_TROPICAL, WesnothTiles.ETerrain.FROZEN_ICE,
                    WesnothTiles.ETerrain.SWAMP_MUD, WesnothTiles.ETerrain.SWAMP_WATER], \"hills/dry-to-water\", { layer: -482, flag: \"non_submerged\" }, [2, 1]);
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.GRASS_DRY, WesnothTiles.ETerrain.GRASS_GREEN, WesnothTiles.ETerrain.GRASS_LEAF_LITTER, WesnothTiles.ETerrain.GRASS_SEMI_DRY], [WesnothTiles.ETerrain.WATER_OCEAN, WesnothTiles.ETerrain.WATER_COAST_TROPICAL, WesnothTiles.ETerrain.FROZEN_ICE], \"flat/bank-to-ice\", { layer: -483, flag: \"non_submerged\" }, [2, 1]);
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.FROZEN_ICE, WesnothTiles.ETerrain.FROZEN_SNOW], [WesnothTiles.ETerrain.SAND_DESERT, WesnothTiles.ETerrain.SAND_BEACH], \"frozen/ice\", { layer: -485, flag: \"non_submerged\" }, [4, 3, 2, 1]);
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.HILLS_SNOW, WesnothTiles.ETerrain.MOUNTAIN_SNOW, WesnothTiles.ETerrain.FROZEN_ICE, WesnothTiles.ETerrain.FROZEN_SNOW], [WesnothTiles.ETerrain.WATER_OCEAN, WesnothTiles.ETerrain.WATER_COAST_TROPICAL, WesnothTiles.ETerrain.SWAMP_MUD, WesnothTiles.ETerrain.SWAMP_WATER], \"frozen/ice\", { layer: -485, flag: \"non_submerged\" }, [4, 3, 2, 1]);
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.HILLS_SNOW, WesnothTiles.ETerrain.MOUNTAIN_SNOW, WesnothTiles.ETerrain.FROZEN_ICE, WesnothTiles.ETerrain.FROZEN_SNOW], [WesnothTiles.ETerrain.WATER_OCEAN, WesnothTiles.ETerrain.WATER_COAST_TROPICAL, WesnothTiles.ETerrain.SWAMP_MUD, WesnothTiles.ETerrain.SWAMP_WATER], \"frozen/ice-to-water\", { layer: -505, flag: \"submerged\" }, [4, 3, 2, 1]);
                // invisible transition
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.FROZEN_ICE], [WesnothTiles.ETerrain.WATER_OCEAN, WesnothTiles.ETerrain.WATER_COAST_TROPICAL, WesnothTiles.ETerrain.SWAMP_WATER], \"frozen/ice-to-water\", { layer: -1001 }, [4, 3, 2, 1]);
                Worker.NEW_BEACH(this, [WesnothTiles.ETerrain.HILLS_DESERT, WesnothTiles.ETerrain.SAND_DESERT, WesnothTiles.ETerrain.SAND_BEACH], [WesnothTiles.ETerrain.WATER_OCEAN, WesnothTiles.ETerrain.WATER_COAST_TROPICAL], \"sand/shore\");
                Worker.NEW_BEACH(this, [WesnothTiles.ETerrain.GRASS_GREEN, WesnothTiles.ETerrain.GRASS_SEMI_DRY, WesnothTiles.ETerrain.GRASS_DRY, WesnothTiles.ETerrain.GRASS_LEAF_LITTER,
                    WesnothTiles.ETerrain.HILLS_DESERT, WesnothTiles.ETerrain.HILLS_DRY, WesnothTiles.ETerrain.HILLS_REGULAR, WesnothTiles.ETerrain.HILLS_SNOW,
                    WesnothTiles.ETerrain.MOUNTAIN_SNOW, WesnothTiles.ETerrain.MOUNTAIN_BASIC, WesnothTiles.ETerrain.MOUNTAIN_DRY, WesnothTiles.ETerrain.MOUNTAIN_VOLCANO, WesnothTiles.ETerrain.VOID], [WesnothTiles.ETerrain.WATER_OCEAN, WesnothTiles.ETerrain.WATER_COAST_TROPICAL], \"flat/shore\");
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.SWAMP_MUD], [WesnothTiles.ETerrain.WATER_OCEAN, WesnothTiles.ETerrain.WATER_COAST_TROPICAL, WesnothTiles.ETerrain.SWAMP_WATER], \"swamp/mud-long\", { layer: -556, flag: \"transition3\" }, [1]);
                Worker.ANIMATED_WATER_15_TRANSITION(this, [WesnothTiles.ETerrain.WATER_OCEAN], [WesnothTiles.ETerrain.WATER_COAST_TROPICAL, WesnothTiles.ETerrain.SWAMP_MUD], \"water/ocean-blend\", -550);
                Worker.ANIMATED_WATER_15_TRANSITION(this, [WesnothTiles.ETerrain.WATER_COAST_TROPICAL], [WesnothTiles.ETerrain.WATER_OCEAN, WesnothTiles.ETerrain.SWAMP_MUD], \"water/coast-tropical-long\", -555);
                Worker.TRANSITION_COMPLETE_LFB(this, [WesnothTiles.ETerrain.VOID], swapTerrains([]), \"void/void\", { layer: 1000 }, [3, 2, 1]);
            }
        }
        Worker.TgGroup = TgGroup;
    })(Worker = WesnothTiles.Worker || (WesnothTiles.Worker = {}));
})(WesnothTiles || (WesnothTiles = {}));
var WesnothTiles;
(function (WesnothTiles) {
    var Worker;
    (function (Worker) {
        'use strict';
        /**
         * JS Implementation of MurmurHash3 (r136) (as of May 20, 2011)
         *
         * @author <a href=\"mailto:gary.court@gmail.com\">Gary Court</a>
         * @see http://github.com/garycourt/murmurhash-js
         * @author <a href=\"mailto:aappleby@gmail.com\">Austin Appleby</a>
         * @see http://sites.google.com/site/murmurhash/
         *
         * @param {string} key ASCII only
         * @param {number} seed Positive integer only
         * @return {number} 32-bit positive integer hash
         */
        function murmurhash3(key, seed) {
            let remainder, bytes, h1, h1b, c1, c1b, c2, c2b, k1, i;
            remainder = key.length & 3; // key.length % 4
            bytes = key.length - remainder;
            h1 = seed;
            c1 = 0xcc9e2d51;
            c2 = 0x1b873593;
            i = 0;
            while (i < bytes) {
                k1 =
                    ((key.charCodeAt(i) & 0xff)) |
                        ((key.charCodeAt(++i) & 0xff) << 8) |
                        ((key.charCodeAt(++i) & 0xff) << 16) |
                        ((key.charCodeAt(++i) & 0xff) << 24);
                ++i;
                k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
                k1 = (k1 << 15) | (k1 >>> 17);
                k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;
                h1 ^= k1;
                h1 = (h1 << 13) | (h1 >>> 19);
                h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
                h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
            }
            k1 = 0;
            switch (remainder) {
                case 3: k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
                case 2: k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
                case 1:
                    k1 ^= (key.charCodeAt(i) & 0xff);
                    k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
                    k1 = (k1 << 15) | (k1 >>> 17);
                    k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
                    h1 ^= k1;
            }
            h1 ^= key.length;
            h1 ^= h1 >>> 16;
            h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
            h1 ^= h1 >>> 13;
            h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
            h1 ^= h1 >>> 16;
            return h1 >>> 0;
        }
        Worker.murmurhash3 = murmurhash3;
        Worker.swapTerrainTypes = (types) => {
            const swapped = new Map();
            // We skip the void
            for (let i = 0; i < WesnothTiles.ETerrain.VOID; i++) {
                if (!types.has(i))
                    swapped.set(i, true);
            }
            return swapped;
        };
    })(Worker = WesnothTiles.Worker || (WesnothTiles.Worker = {}));
})(WesnothTiles || (WesnothTiles = {}));
// Worker. Meant to be run on another thread.
var WesnothTiles;
(function (WesnothTiles) {
    var Worker;
    (function (Worker_1) {
        'use strict';
        Worker_1.spriteNames = new Set();
        const hexMaps = new Map();
        const ensureMap = (mapId) => {
            let map = hexMaps.get(mapId);
            if (map === undefined) {
                map = new Worker_1.HexMap();
                hexMaps.set(mapId, map);
            }
            return map;
        };
        const sortFunc = (a, b) => {
            if (a.layer === b.layer) {
                if (a.base !== undefined && b.base !== undefined) {
                    return a.base.y - b.base.y;
                }
                if (b.base !== undefined) {
                    return a.layer < 0 ? -1 : 1;
                }
                else if (a.base !== undefined) {
                    return b.layer < 0 ? 1 : -1;
                }
                return 0;
            }
            return a.layer - b.layer;
        };
        const sortFuncForChecksum = (a, b) => {
            if (a.layer === b.layer) {
                if (a.base !== undefined && b.base !== undefined) {
                    if (a.base.y === b.base.y) {
                        return a.toString() < b.toString() ? -1 : 1;
                    }
                    return a.base.y - b.base.y;
                }
                if (b.base !== undefined) {
                    return a.layer < 0 ? -1 : 1;
                }
                else if (a.base !== undefined) {
                    return b.layer < 0 ? 1 : -1;
                }
                return a.toString() < b.toString() ? -1 : 1;
            }
            return a.layer - b.layer;
        };
        class Worker {
            constructor() {
                this.setTiles = (bundle) => {
                    const map = ensureMap(bundle.mapId);
                    if (bundle.loadingMode)
                        map.setLoadingMode();
                    bundle.tileChanges.forEach(change => {
                        if (change.terrain === undefined || change.terrain === null) {
                            map.removeTerrain(change.q, change.r);
                        }
                        map.setTerrain(change.q, change.r, change.terrain, change.overlay, change.fog);
                    });
                    map.unsetLoadingMode();
                };
                this.init = (definitions) => {
                    definitions.forEach(spriteName => Worker_1.spriteNames.add(spriteName));
                };
                this.rebuild = (mapId) => {
                    const map = ensureMap(mapId);
                    map.unsetLoadingMode();
                    const drawables = Worker_1.rebuild(map);
                    drawables.sort(sortFunc);
                    return drawables;
                };
                this.getChecksum = (mapId) => {
                    const map = ensureMap(mapId);
                    const drawables = this.rebuild(mapId);
                    let checksum = 0;
                    drawables.sort(sortFuncForChecksum);
                    drawables.forEach(drawable => {
                        checksum = Worker_1.murmurhash3(drawable.toString(), checksum);
                    });
                    return checksum.toString();
                };
                this.clear = (mapId) => {
                    ensureMap(mapId).clear();
                };
                onmessage = (oEvent) => {
                    const order = oEvent.data;
                    const func = this[order.func];
                    const result = func(order.data);
                    const response = {
                        id: order.id,
                        data: result,
                    };
                    postMessage(response);
                };
            }
        }
        Worker_1.Worker = Worker;
    })(Worker = WesnothTiles.Worker || (WesnothTiles.Worker = {}));
})(WesnothTiles || (WesnothTiles = {}));
const worker = new WesnothTiles.Worker.Worker();
var WesnothTiles;
(function (WesnothTiles) {
    (function (ETerrain) {
        ETerrain[ETerrain[\"GRASS_GREEN\"] = 0] = \"GRASS_GREEN\";
        ETerrain[ETerrain[\"GRASS_SEMI_DRY\"] = 1] = \"GRASS_SEMI_DRY\";
        ETerrain[ETerrain[\"GRASS_DRY\"] = 2] = \"GRASS_DRY\";
        ETerrain[ETerrain[\"GRASS_LEAF_LITTER\"] = 3] = \"GRASS_LEAF_LITTER\";
        ETerrain[ETerrain[\"HILLS_REGULAR\"] = 4] = \"HILLS_REGULAR\";
        ETerrain[ETerrain[\"HILLS_DRY\"] = 5] = \"HILLS_DRY\";
        ETerrain[ETerrain[\"HILLS_DESERT\"] = 6] = \"HILLS_DESERT\";
        ETerrain[ETerrain[\"HILLS_SNOW\"] = 7] = \"HILLS_SNOW\";
        ETerrain[ETerrain[\"MOUNTAIN_BASIC\"] = 8] = \"MOUNTAIN_BASIC\";
        ETerrain[ETerrain[\"MOUNTAIN_DRY\"] = 9] = \"MOUNTAIN_DRY\";
        ETerrain[ETerrain[\"MOUNTAIN_SNOW\"] = 10] = \"MOUNTAIN_SNOW\";
        ETerrain[ETerrain[\"MOUNTAIN_VOLCANO\"] = 11] = \"MOUNTAIN_VOLCANO\";
        ETerrain[ETerrain[\"FROZEN_SNOW\"] = 12] = \"FROZEN_SNOW\";
        ETerrain[ETerrain[\"FROZEN_ICE\"] = 13] = \"FROZEN_ICE\";
        ETerrain[ETerrain[\"SAND_BEACH\"] = 14] = \"SAND_BEACH\";
        ETerrain[ETerrain[\"SAND_DESERT\"] = 15] = \"SAND_DESERT\";
        ETerrain[ETerrain[\"SWAMP_MUD\"] = 16] = \"SWAMP_MUD\";
        ETerrain[ETerrain[\"SWAMP_WATER\"] = 17] = \"SWAMP_WATER\";
        ETerrain[ETerrain[\"WATER_OCEAN\"] = 18] = \"WATER_OCEAN\";
        ETerrain[ETerrain[\"WATER_COAST_TROPICAL\"] = 19] = \"WATER_COAST_TROPICAL\";
        ETerrain[ETerrain[\"ABYSS\"] = 20] = \"ABYSS\";
        ETerrain[ETerrain[\"VOID\"] = 21] = \"VOID\"; // Xv 21
    })(WesnothTiles.ETerrain || (WesnothTiles.ETerrain = {}));
    var ETerrain = WesnothTiles.ETerrain;
    (function (EOverlay) {
        EOverlay[EOverlay[\"WOODS_PINE\"] = 22] = \"WOODS_PINE\";
        EOverlay[EOverlay[\"SNOW_FOREST\"] = 23] = \"SNOW_FOREST\";
        EOverlay[EOverlay[\"JUNGLE\"] = 24] = \"JUNGLE\";
        EOverlay[EOverlay[\"PALM_DESERT\"] = 25] = \"PALM_DESERT\";
        EOverlay[EOverlay[\"RAINFOREST\"] = 26] = \"RAINFOREST\";
        EOverlay[EOverlay[\"SAVANNA\"] = 27] = \"SAVANNA\";
        EOverlay[EOverlay[\"DECIDUOUS_SUMMER\"] = 28] = \"DECIDUOUS_SUMMER\";
        EOverlay[EOverlay[\"DECIDUOUS_FALL\"] = 29] = \"DECIDUOUS_FALL\";
        EOverlay[EOverlay[\"DECIDUOUS_WINTER\"] = 30] = \"DECIDUOUS_WINTER\";
        EOverlay[EOverlay[\"DECIDUOUS_WINTER_SNOW\"] = 31] = \"DECIDUOUS_WINTER_SNOW\";
        EOverlay[EOverlay[\"MIXED_SUMMER\"] = 32] = \"MIXED_SUMMER\";
        EOverlay[EOverlay[\"MIXED_FALL\"] = 33] = \"MIXED_FALL\";
        EOverlay[EOverlay[\"MIXED_WINTER\"] = 34] = \"MIXED_WINTER\";
        EOverlay[EOverlay[\"MIXED_WINTER_SNOW\"] = 35] = \"MIXED_WINTER_SNOW\";
        EOverlay[EOverlay[\"MUSHROOMS\"] = 36] = \"MUSHROOMS\";
        EOverlay[EOverlay[\"FARM_VEGS\"] = 37] = \"FARM_VEGS\";
        EOverlay[EOverlay[\"FLOWERS_MIXED\"] = 38] = \"FLOWERS_MIXED\";
        EOverlay[EOverlay[\"RUBBLE\"] = 39] = \"RUBBLE\";
        EOverlay[EOverlay[\"STONES_SMALL\"] = 40] = \"STONES_SMALL\";
        EOverlay[EOverlay[\"OASIS\"] = 41] = \"OASIS\";
        EOverlay[EOverlay[\"DETRITUS\"] = 42] = \"DETRITUS\";
        EOverlay[EOverlay[\"LITER\"] = 43] = \"LITER\";
        EOverlay[EOverlay[\"TRASH\"] = 44] = \"TRASH\";
        EOverlay[EOverlay[\"VILLAGE_HUMAN\"] = 45] = \"VILLAGE_HUMAN\";
        EOverlay[EOverlay[\"VILLAGE_HUMAN_RUIN\"] = 46] = \"VILLAGE_HUMAN_RUIN\";
        EOverlay[EOverlay[\"VILLAGE_HUMAN_CITY\"] = 47] = \"VILLAGE_HUMAN_CITY\";
        EOverlay[EOverlay[\"VILLAGE_HUMAN_CITY_RUIN\"] = 48] = \"VILLAGE_HUMAN_CITY_RUIN\";
        EOverlay[EOverlay[\"VILLAGE_TROPICAL\"] = 49] = \"VILLAGE_TROPICAL\";
        EOverlay[EOverlay[\"VILLAGE_HUT\"] = 50] = \"VILLAGE_HUT\";
        EOverlay[EOverlay[\"VILLAGE_LOG_CABIN\"] = 51] = \"VILLAGE_LOG_CABIN\";
        EOverlay[EOverlay[\"VILLAGE_CAMP\"] = 52] = \"VILLAGE_CAMP\";
        EOverlay[EOverlay[\"VILLAGE_IGLOO\"] = 53] = \"VILLAGE_IGLOO\";
        EOverlay[EOverlay[\"VILLAGE_ORC\"] = 54] = \"VILLAGE_ORC\";
        EOverlay[EOverlay[\"VILLAGE_ELVEN\"] = 55] = \"VILLAGE_ELVEN\";
        EOverlay[EOverlay[\"VILLAGE_DESERT\"] = 56] = \"VILLAGE_DESERT\";
        EOverlay[EOverlay[\"VILLAGE_DESERT_CAMP\"] = 57] = \"VILLAGE_DESERT_CAMP\";
        EOverlay[EOverlay[\"VILLAGE_DWARVEN\"] = 58] = \"VILLAGE_DWARVEN\";
        EOverlay[EOverlay[\"VILLAGE_SWAMP\"] = 59] = \"VILLAGE_SWAMP\";
        EOverlay[EOverlay[\"VILLAGE_COAST\"] = 60] = \"VILLAGE_COAST\";
        EOverlay[EOverlay[\"DESERT_PLANTS\"] = 61] = \"DESERT_PLANTS\";
        EOverlay[EOverlay[\"NONE\"] = 62] = \"NONE\";
    })(WesnothTiles.EOverlay || (WesnothTiles.EOverlay = {}));
    var EOverlay = WesnothTiles.EOverlay;
})(WesnothTiles || (WesnothTiles = {}));
var WesnothTiles;
(function (WesnothTiles) {
    var Internal;
    (function (Internal) {
        'use strict';
        class DrawableData {
            constructor(x, y, name, layer, base, frames, duration) {
                this.x = x;
                this.y = y;
                this.name = name;
                this.layer = layer;
                this.base = base;
                this.frames = frames;
                this.duration = duration;
            }
            toString() {
                if (this.duration === undefined)
                    return this.name + this.layer + ',' + this.x + ',' + this.y;
                else
                    return this.name + this.duration + this.layer + ',' + this.x + ',' + this.y;
            }
        }
        Internal.DrawableData = DrawableData;
    })(Internal = WesnothTiles.Internal || (WesnothTiles.Internal = {}));
})(WesnothTiles || (WesnothTiles = {}));
/// <reference path=\"../common/interfaces.ts\"/>
/// <reference path=\"../../node_modules/typescript/lib/lib.core.es6.d.ts\"/>
/// <reference path=\"definitions/lib.webworker.d.ts\"/>
/// <reference path=\"Hex.ts\"/>
/// <reference path=\"HexMap.ts\"/>
/// <reference path=\"Macros.ts\"/>
/// <reference path=\"TgGroup.ts\"/>
/// <reference path=\"Algorithm.ts\"/>
/// <reference path=\"Algorithm.ts\"/>
/// <reference path=\"Worker.ts\"/> 
`;
    })(Internal = WesnothTiles.Internal || (WesnothTiles.Internal = {}));
})(WesnothTiles || (WesnothTiles = {}));




// var WesnothTiles;!function(a){var b;!function(a){"use strict";a.workerString="

// "}(b=a.Internal||(a.Internal={}))}(WesnothTiles||(WesnothTiles={}));