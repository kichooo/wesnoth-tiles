declare module WesnothTiles {
    interface IBuilder {
        toDrawable(imageStem: string, postfix: string, pos: IVector, layer: number, base: IVector): IDrawable;
        toString(imageStem: string, postfix?: string): string;
    }
    var IB_IMAGE_SINGLE: IBuilder;
    var IB_ANIMATION_15_SLOW: IBuilder;
    var IB_ANIMATION_15: IBuilder;
    var IB_ANIMATION_06: IBuilder;
    interface WMLImage {
        name: string;
        layer: number;
        variations: string[];
        postfix?: string;
        base?: IVector;
        center?: IVector;
    }
    interface WMLTile {
        set_no_flag?: string[];
        q: number;
        r: number;
        type?: Map<ETerrain, boolean>;
        overlay?: Map<EOverlay, boolean>;
        fog?: boolean;
        images?: WMLImage[];
        anchor?: number;
    }
    interface WMLTerrainGraphics {
        tiles: WMLTile[];
        set_no_flag?: string[];
        images?: WMLImage[];
        probability?: number;
        hexes?: Map<string, Hex>;
        rotations?: string[];
        builder: IBuilder;
    }
    interface PLFB extends LFB {
        prob?: number;
    }
    interface LFB {
        layer?: number;
        flag?: string;
        builder?: IBuilder;
    }
    var TERRAIN_BASE_PLFB: (tgGroup: TgGroup, terrainList: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB) => void;
    var OVERLAY_RANDOM_LFB: (tgGroup: TgGroup, terrainList: Map<ETerrain, boolean>, overlayList: Map<EOverlay, boolean>, fog: boolean, imageStem: string, lfb: LFB) => void;
    var TERRAIN_BASE_RANDOM_LFB: (tgGroup: TgGroup, terrainList: Map<ETerrain, boolean>, imageStem: string, lfb: LFB) => void;
    var transitionsOptimizer: Map<ETerrain, Map<ETerrain, boolean>>;
    var addToTransitionsTable: (terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, stem: string) => void;
    var TRANSITION_COMPLETE_LFB: (tgGroup: TgGroup, terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, lfb: LFB, grades?: number) => void;
    var FOG_TRANSITION_LFB: (tgGroup: TgGroup, fog: boolean, fogAdjacent: boolean, imageStem: string, lfb: LFB, grades?: number) => void;
    var TERRAIN_BASE_SINGLEHEX_PLFB: (tgGroup: TgGroup, terrainList: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB) => void;
    var ANIMATED_WATER_15_TRANSITION: (tgGroup: TgGroup, terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, layer: number) => void;
    var NEW_BEACH: (tgGroup: TgGroup, terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string) => void;
    var NEW_WAVES: (tgGroup: TgGroup, terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, layer: number, imageStem: string) => void;
    var MOUNTAIN_SINGLE: (tgGroup: TgGroup, terrainList: Map<ETerrain, boolean>, imageStem: string, prob: number, flag: string) => void;
    var OVERLAY_COMPLETE_LFB: (tgGroup: TgGroup, terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, lfb: LFB) => void;
    var MOUNTAIN_SINGLE_RANDOM: (tgGroup: TgGroup, terrainList: Map<ETerrain, boolean>, imageStem: string, flag: string) => void;
    var OVERLAY_RESTRICTED2_PLFB: (tgGroup: TgGroup, terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB) => void;
    var OVERLAY_RESTRICTED3_PLFB: (tgGroup: TgGroup, terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB) => void;
    var OVERLAY_PLFB: (tgGroup: TgGroup, terrainList: Map<ETerrain, boolean>, overlayList: Map<EOverlay, boolean>, fog: boolean, imageStem: string, plfb: PLFB) => void;
    var OVERLAY_ROTATION_RESTRICTED2_PLFB: (tgGroup: TgGroup, terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB) => void;
    var OVERLAY_ROTATION_RESTRICTED_PLFB: (tgGroup: TgGroup, terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB) => void;
    var MOUNTAINS_2x4_NW_SE: (tgGroup: TgGroup, terrainList: Map<ETerrain, boolean>, imageStem: string, flag: string, prob: number) => void;
    var MOUNTAINS_1x3_NW_SE: (tgGroup: TgGroup, terrainList: Map<ETerrain, boolean>, imageStem: string, flag: string, prob: number) => void;
    var MOUNTAINS_2x4_SW_NE: (tgGroup: TgGroup, terrainList: Map<ETerrain, boolean>, imageStem: string, flag: string, prob: number) => void;
    var MOUNTAINS_1x3_SW_NE: (tgGroup: TgGroup, terrainList: Map<ETerrain, boolean>, imageStem: string, flag: string, prob: number) => void;
    var MOUNTAINS_2x2: (tgGroup: TgGroup, terrainList: Map<ETerrain, boolean>, imageStem: string, flag: string, prob: number) => void;
    var VOLCANO_2x2: (tgGroup: TgGroup, volcano: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, flag: string) => void;
    var CORNER_PLFB_CONVEX: (tgGroup: TgGroup, terrainList1: Map<ETerrain, boolean>, adjacent1: Map<ETerrain, boolean>, adjacent2: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB) => void;
    var CORNER_PLFB_CONCAVE: (tgGroup: TgGroup, terrainList1: Map<ETerrain, boolean>, adjacent1: Map<ETerrain, boolean>, adjacent2: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB) => void;
    var WALL_TRANSITION_PLFB: (tgGroup: TgGroup, terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB) => void;
    var NEW_FOREST: (tgGroup: TgGroup, terrainList: Map<ETerrain, boolean>, overlayList: Map<EOverlay, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string) => void;
    var NEW_VILLAGE: (tgGroup: TgGroup, terrainList: Map<ETerrain, boolean>, overlayList: Map<EOverlay, boolean>, imageStem: string) => void;
    var OVERLAY_RESTRICTED_PLFB: (tgGroup: TgGroup, overlayList: Map<EOverlay, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB) => void;
}

/// <reference path="Macros.d.ts" />
declare module WesnothTiles {
    var rebuild: (hexMap: HexMap) => IDrawable[];
}

declare module WesnothTiles {
    class HexPos {
        q: number;
        r: number;
        constructor(q: number, r: number);
        toString(): string;
        static toString(q: number, r: number): string;
    }
}

/// <reference path="HexPos.d.ts" />
declare module WesnothTiles {
    enum ETerrain {
        GRASS_GREEN = 0,
        GRASS_SEMI_DRY = 1,
        GRASS_DRY = 2,
        GRASS_LEAF_LITTER = 3,
        HILLS_REGULAR = 4,
        HILLS_DRY = 5,
        HILLS_DESERT = 6,
        HILLS_SNOW = 7,
        MOUNTAIN_BASIC = 8,
        MOUNTAIN_DRY = 9,
        MOUNTAIN_SNOW = 10,
        MOUNTAIN_VOLCANO = 11,
        FROZEN_SNOW = 12,
        FROZEN_ICE = 13,
        SAND_BEACH = 14,
        SAND_DESERT = 15,
        SWAMP_MUD = 16,
        SWAMP_WATER = 17,
        WATER_OCEAN = 18,
        WATER_COAST_TROPICAL = 19,
        ABYSS = 20,
        VOID = 21,
    }
    enum EOverlay {
        WOODS_PINE = 22,
        SNOW_FOREST = 23,
        JUNGLE = 24,
        PALM_DESERT = 25,
        RAINFOREST = 26,
        SAVANNA = 27,
        DECIDUOUS_SUMMER = 28,
        DECIDUOUS_FALL = 29,
        DECIDUOUS_WINTER = 30,
        DECIDUOUS_WINTER_SNOW = 31,
        MIXED_SUMMER = 32,
        MIXED_FALL = 33,
        MIXED_WINTER = 34,
        MIXED_WINTER_SNOW = 35,
        MUSHROOMS = 36,
        FARM_VEGS = 37,
        FLOWERS_MIXED = 38,
        RUBBLE = 39,
        STONES_SMALL = 40,
        OASIS = 41,
        DETRITUS = 42,
        LITER = 43,
        TRASH = 44,
        VILLAGE_HUMAN = 45,
        VILLAGE_HUMAN_RUIN = 46,
        VILLAGE_HUMAN_CITY = 47,
        VILLAGE_HUMAN_CITY_RUIN = 48,
        VILLAGE_TROPICAL = 49,
        VILLAGE_HUT = 50,
        VILLAGE_LOG_CABIN = 51,
        VILLAGE_CAMP = 52,
        VILLAGE_IGLOO = 53,
        VILLAGE_ORC = 54,
        VILLAGE_ELVEN = 55,
        VILLAGE_DESERT = 56,
        VILLAGE_DESERT_CAMP = 57,
        VILLAGE_DWARVEN = 58,
        VILLAGE_SWAMP = 59,
        VILLAGE_COAST = 60,
        DESERT_PLANTS = 61,
        NONE = 62,
    }
    var swapTerrainTypes: (types: Map<ETerrain, boolean>) => Map<ETerrain, boolean>;
    var iterateTerrains: (callback: (ETerrain: any) => void) => void;
    var iterateTerrainsAndOverlays: (callback: (ETerrain: any) => void) => void;
    var sumTerrainMaps: (map1: Map<ETerrain, boolean>, map2: Map<ETerrain, boolean>) => Map<ETerrain, boolean>;
    class Hex extends HexPos {
        terrain: ETerrain;
        overlay: EOverlay;
        fog: boolean;
        private hashesTaken;
        constructor(q: number, r: number, terrain: ETerrain, overlay?: EOverlay, fog?: boolean);
        getRandom(from?: number, to?: number): number;
    }
}

declare module WesnothTiles {
    class HexMap {
        tgGroup: TgGroup;
        hexes: Map<string, Hex>;
        constructor();
        getHex(pos: HexPos): Hex;
        getHexP(q: number, r: number): Hex;
        addHex(hex: Hex): void;
        private setToVoidIfEmpty(q, r);
        private addHexToTgs(hex);
        iterate(func: (hex: Hex) => void): void;
        clear(): void;
    }
}

declare module WesnothTiles {
    interface IVector {
        x: number;
        y: number;
    }
    interface IDrawable {
        draw(pos: IVector, ctx: CanvasRenderingContext2D, timePassed: number): any;
        layer?: number;
        base?: IVector;
    }
    class StaticImage implements IDrawable {
        private x;
        private y;
        private name;
        layer: number;
        base: IVector;
        constructor(x: number, y: number, name: string, layer: number, base: IVector);
        draw(pos: IVector, ctx: CanvasRenderingContext2D, timePassed: number): void;
    }
    class AnimatedImage implements IDrawable {
        private x;
        private y;
        private name;
        layer: number;
        base: IVector;
        private frames;
        private duration;
        private animTime;
        constructor(x: number, y: number, name: string, layer: number, base: IVector, frames: number, duration: number);
        draw(pos: IVector, ctx: CanvasRenderingContext2D, timePassed: number): void;
    }
    class Renderer<HexType extends Hex> {
        private canvas;
        private ctx;
        private drawables;
        private lastDraw;
        constructor(canvas: HTMLCanvasElement);
        rebuild(hexMap: HexMap): void;
        redraw(hexMap: HexMap): void;
        Resize(width: number, height: number): void;
        load(): Promise<void>;
    }
}

declare module WesnothTiles.Resources {
    var definitions: Map<string, SpriteDefinition>;
    var loadResources: () => Promise<void>;
    interface IXY {
        x: number;
        y: number;
    }
}

declare module WesnothTiles.Resources {
    interface IFrame {
        point: IVector;
        size: IVector;
    }
    class SpriteDefinition {
        private frame;
        private spriteSource;
        private sourceSize;
        private atlas;
        constructor(frame: IFrame, spriteSource: IFrame, sourceSize: IVector, atlas: HTMLElement);
        draw(pos: IVector, ctx: CanvasRenderingContext2D): void;
    }
}

declare module WesnothTiles {
    class TgGroup {
        tgs: WMLTerrainGraphics[];
        constructor();
        addTg(tg: WMLTerrainGraphics): void;
        private populateTgs();
    }
}

declare module WesnothTiles {
    /**
     * JS Implementation of MurmurHash3 (r136) (as of May 20, 2011)
     *
     * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
     * @see http://github.com/garycourt/murmurhash-js
     * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
     * @see http://sites.google.com/site/murmurhash/
     *
     * @param {string} key ASCII only
     * @param {number} seed Positive integer only
     * @return {number} 32-bit positive integer hash
     */
    var murmurhash3: (key: string, seed: number) => number;
}

/// <reference path="Utils.d.ts" />
/// <reference path="Hex.d.ts" />
/// <reference path="HexMap.d.ts" />
/// <reference path="Renderer.d.ts" />
/// <reference path="SpriteDefinition.d.ts" />
/// <reference path="Resources.d.ts" />
/// <reference path="Algorithm.d.ts" />
/// <reference path="TgGroup.d.ts" />
