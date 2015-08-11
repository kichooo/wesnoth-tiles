declare module WesnothTiles {
    interface IProjection {
        left: number;
        right: number;
        top: number;
        bottom: number;
        x: number;
        y: number;
    }
    class MapBuilder {
        private $mapId;
        private $loadingMode;
        private $tileChanges;
        constructor($mapId: number, $loadingMode: any);
        setTile(q: number, r: number, terrain?: ETerrain, overlay?: EOverlay, fog?: boolean): MapBuilder;
        unsetTile(q: number, r: number): MapBuilder;
        promise(): Promise<void>;
    }
    var pointToHexPos: (x: number, y: number) => IHexPos;
    var hexToPoint: (q: number, r: number) => IVector;
    var createMap: () => Promise<TilesMap>;
    var load: () => Promise<void>;
    class TilesMap {
        private $mapId;
        private drawables;
        private cursor;
        private worker;
        private workerId;
        constructor($mapId: number);
        clear(): Promise<void>;
        rebuild(): Promise<void>;
        getCheckSum(): Promise<string>;
        redraw(ctx: CanvasRenderingContext2D, projection: IProjection, timestamp: number): void;
        getBuilder(loadingMode?: boolean): MapBuilder;
        moveCursor(x: number, y: number): void;
        setCursorVisibility(visible: boolean): void;
    }
}
declare module WesnothTiles {
    interface IVector {
        x: number;
        y: number;
    }
    interface IHexPos {
        q: number;
        r: number;
    }
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
}
declare module WesnothTiles.Internal {
    var workerString: any;
    interface ITileChange {
        q: number;
        r: number;
        terrain?: ETerrain;
        overlay?: EOverlay;
        fog?: boolean;
    }
    interface ISetTerrainBundle {
        tileChanges: ITileChange[];
        loadingMode: boolean;
        mapId: number;
    }
    interface IWorkerOrder {
        func: string;
        id: number;
        data?: Object;
    }
    interface IWorkerResponse {
        id: number;
        data?: Object;
        error?: string;
    }
    class DrawableData {
        x: number;
        y: number;
        name: string;
        layer: number;
        base: IVector;
        frames: number;
        duration: number;
        constructor(x: number, y: number, name: string, layer: number, base: IVector, frames: number, duration: number);
        toString(): string;
    }
}
declare module WesnothTiles.Internal {
    var definitions: Map<string, SpriteDefinition>;
    var loadResources: () => Promise<void>;
    interface IXY {
        x: number;
        y: number;
    }
}
declare module WesnothTiles.Internal {
    class Drawable {
        x: number;
        y: number;
        private name;
        private frames;
        private duration;
        constructor(x: number, y: number, name: string, frames: number, duration: number);
        draw(projection: IProjection, ctx: CanvasRenderingContext2D, timestamp: number): void;
    }
}
declare module WesnothTiles.Internal {
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
        draw(x: number, y: number, ctx: CanvasRenderingContext2D): void;
        size(): IVector;
    }
}
declare module WesnothTiles.Internal {
    var loadWorker: () => void;
    var sendCommand: <T>(commandName: string, params?: Object) => Promise<T>;
}
