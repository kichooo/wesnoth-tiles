module WesnothTiles {
  'use strict';

  export interface IProjection {
    // Part of the map to draw
    left: number;
    right: number;
    top: number;
    bottom: number;

    // Where to draw on the canvas
    x: number;
    y: number;
  }

  export class MapBuilder {
    private $tileChanges: Internal.ITileChange[] = [];

    constructor(private $mapId: number, private $loadingMode) {
    }

    setTile(q: number, r: number, terrain: ETerrain = undefined, overlay = EOverlay.NONE, fog = false): MapBuilder {
      this.$tileChanges.push({ q: q, r: r, terrain: terrain, overlay: overlay, fog: fog })
      return this;
    }


    // Unsets given hex. Overlay is cleared too.
    // It is not an equivalent of setting terrain to Void.
    // A 'rebuild' call is needed to actually display the change.}
    unsetTile(q: number, r: number): MapBuilder {
      // We messages sent to the worker just have terrain as undefined.
      return this.setTile(q, r);
    }

    // When this promise is resolved, a rebuild call might be executed.
    promise() {
      return Internal.sendCommand<void>("setTiles", {
        loadingMode: this.$loadingMode,
        tileChanges: this.$tileChanges,
        mapId: this.$mapId
      });
    }
  }

  export var pointToHexPos = (x: number, y: number): IHexPos => {
    y = y / radius;

    var t1 = (x + halfRadius) / halfRadius;
    var t2 = Math.floor(y + t1);
    var q = Math.floor((Math.floor(t1 - y) + t2) / 3);
    var r = Math.floor((Math.floor(2 * y + 1) + t2) / 3) - q;

    return {
      q: Math.floor(q),
      r: Math.floor(r)
    }
  }

  export var hexToPoint = (q: number, r: number): IVector => {
    return {
      x: q * radius * 3 / 4,
      y: r * radius + q * halfRadius
    };
  }

  var radius = 72;
  var halfRadius = radius / 2;

  var loadingPromise: Promise<void> = undefined;

  var lastId = 0;


  var createLoadingPromise = (): void => {
    if (loadingPromise !== undefined)
      return
    loadingPromise = Internal.loadResources().then(() => {
      Internal.loadWorker();
      var keys: string[] = [];
      Internal.definitions.forEach((val, key) => {
        keys.push(key);
      });
      return keys;
    }).then(keys => Internal.sendCommand<void>("init", keys));
  }

  // Singleton creating map objects. It ensures that loading is already done before you can use a map.
  export var createMap = (): Promise<TilesMap> => {
    if (loadingPromise === undefined) {
      createLoadingPromise();
    }
    return loadingPromise.then(() => {
      var map = new TilesMap(lastId)
      lastId++;
      return map;
    });
  };

  export var load = (): Promise<void> => {
    createLoadingPromise();
    return loadingPromise;
  }

  export class TilesMap {

    private drawables: Internal.Drawable[] = [];
    private cursor: Internal.Drawable;

    private worker: Worker;

    private workerId = 0;

    constructor(private $mapId: number) {
    }

    // Clears the map.
    clear(): Promise<void> {
      return Internal.sendCommand<void>("clear", this.$mapId);
    }

    // Rebuilds the map. Following calls to redraw will draw the resulting map.
    rebuild(): Promise<void> {
      return Internal.sendCommand<Internal.DrawableData[]>("rebuild", this.$mapId).then(drawableDatas => {
        this.drawables = [];
        drawableDatas.forEach(drawableData => {
          this.drawables.push(new Internal.Drawable(
            drawableData.x, drawableData.y, drawableData.name, drawableData.frames, drawableData.duration));
        });
      });
    }

    // Rebuilds, then calculates the checksum. Build results are discarded.
    getCheckSum(): Promise<string> {
      return Internal.sendCommand<string>("getChecksum", this.$mapId);
    }

    // Draws map onto the canvas. Best used in Animation Frame.
    redraw(ctx: CanvasRenderingContext2D, projection: IProjection, timestamp: number): void {
      this.drawables.forEach(drawable => {
        drawable.draw(projection, ctx, timestamp);
      });

      if (this.cursor !== undefined) {
        this.cursor.draw(projection, ctx, timestamp);
      }

    }

    // Creates instance of MapBuilder. LoadingMode argument is worth seting 
    // When you plan to load bigger chunks of tiles at once.
    getBuilder(loadingMode = false): MapBuilder {
      return new MapBuilder(this.$mapId, loadingMode);
    }

    moveCursor(x: number, y: number): void {
      if (this.cursor === undefined)
        return;
      var hexPos = pointToHexPos(x, y);
      this.cursor.x = halfRadius * 1.5 * hexPos.q;
      this.cursor.y = halfRadius * (2 * hexPos.r + hexPos.q);

    }

    setCursorVisibility(visible: boolean) {
      if (visible && this.cursor === undefined) {
        this.cursor = new Internal.Drawable(0, 0, "hover-hex", undefined, undefined);
      } else if (!visible && this.cursor !== undefined) {
        this.cursor = undefined;
      }
    }

  }
} 
