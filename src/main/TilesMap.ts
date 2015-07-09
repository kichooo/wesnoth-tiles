module WesnothTiles {
  'use strict';

  export class MapBuilder {
    private tileChanges: Internal.ITileChange[] = [];

    constructor(private mapName: string, private loadingMode) {
    }

    setTile(q: number, r: number, terrain: ETerrain = undefined, overlay = EOverlay.NONE, fog = false): MapBuilder {
      this.tileChanges.push({ q: q, r: r, terrain: terrain, overlay: overlay, fog: fog })
      return this;
    }


    // // Unsets given hex. Overlay is cleared too.
    // // It is not an equivalent of setting terrain to Void.
    // // A 'rebuild' call is needed to actually display the change.}
    unsetTile(q: number, r: number): MapBuilder {
      // We messages sent to the worker just have terrain as undefined.
      return this.setTile(q, r);
    }

    promise() {
      return Internal.sendCommand<void>("setTiles", {
        loadingMode: this.loadingMode,
        tileChanges: this.tileChanges,
        mapName: this.mapName
      });
    }
  }

  var loadingPromise: Promise<void> = undefined;

  var lastId = 0;

  export var createMap = (): Promise<TilesMap> => {
      if (loadingPromise === undefined) {
          Internal.loadWorker();
          loadingPromise = Internal.loadResources().then(() => {
              // console.log(Internal.definitions.);
              var keys: string[] = [];
              Internal.definitions.forEach((val, key) => {
                  keys.push(key);
              });
              return keys;
          }).then(keys => Internal.sendCommand<void>("init", keys));
      }
      return loadingPromise.then(() => {
        var map = new TilesMap(lastId)
        lastId++;
        return map;
      });       
  };

  export class TilesMap {

    private static radius = 72;
    private static halfRadius = TilesMap.radius/2;

    private drawables = new Map<string, Internal.Drawable[]>();
    private cursors = new Map<string, Internal.Drawable>();
    private lastDraw: number = Date.now();

    private worker: Worker;

    private workerId = 0;

    constructor(id: number) {
    }

    // Clears the map.
    clear(map = "default"): Promise<void> {
      return Internal.sendCommand<void>("clear", map);
    }

    // Rebuilds the map. Following calls to redraw will draw the resulting map.
    rebuild(mapName = "default"): Promise<void> {
      return Internal.sendCommand<Internal.DrawableData[]>("rebuild", mapName).then(drawableDatas => {
        var drawables: Internal.Drawable[] = [];
        this.drawables.set(mapName, drawables);
        drawableDatas.forEach(drawableData => {
          drawables.push(new Internal.Drawable(
            drawableData.x, drawableData.y, drawableData.name, drawableData.layer,
            drawableData.base, drawableData.frames, drawableData.duration));
        });
      });
    }

    // Rebuilds, then calculates the checksum. Build results are discarded.
    getCheckSum(mapName = "default"): Promise<string> {
      return Internal.sendCommand<string>("getChecksum", mapName);
    }

    // Draws map onto the canvas. Best used in Animation Frame.
    redraw(ctx: CanvasRenderingContext2D, x: number, y: number, mapName = "default"): void {
      var drawables = this.drawables.get(mapName);
      if (drawables === undefined)
        return;
      var now = Date.now();
      var diff = now - this.lastDraw;
      this.lastDraw = now;
      drawables.forEach(drawable => {
        drawable.draw(x, y, ctx, diff);
      });
      
      var cursor = this.cursors.get(mapName);
      if (cursor !== undefined) {
        this.cursors.get(mapName).draw(x, y, ctx, diff);  
      }
      
    }

    // Creates instance of MapBuilder. LoadingMode argument is worth seting 
    // When you plan to load bigger chunks of tiles at once.
    getBuilder(loadingMode = false, mapName = "default"): MapBuilder {
      return new MapBuilder(mapName, loadingMode);
    }

    // Prepares all the data needed by the plugin to run. Make sure load() is resolved before you use 
    // anything else.
    load(): Promise<void> {
      Internal.loadWorker();
      return Internal.loadResources().then(() => {
        // console.log(Internal.definitions.);
        var keys: string[] = [];
        Internal.definitions.forEach((val, key) => {
          keys.push(key);
        });
        return Internal.sendCommand<void>("init", keys);
      });
    }

    pointToHexPos(x: number, y: number): IHexPos {
      y = y / TilesMap.radius;

      var t1 = (x +  TilesMap.halfRadius) / TilesMap.halfRadius;
      var t2 = Math.floor(y + t1);
      var q = Math.floor((Math.floor(t1 - y) + t2) / 3);
      var r = Math.floor((Math.floor(2 * y + 1) + t2) / 3) - q;      

      return {
        q: Math.floor(q),
        r: Math.floor(r)
      }
    }

    moveCursor(x: number, y: number, mapName = "default"): void {
      var cursor = this.cursors.get(mapName);
      if (cursor === undefined)
          return;
      var hexPos = this.pointToHexPos(x, y);
      cursor.x = TilesMap.halfRadius * 1.5 * hexPos.q;
      cursor.y = TilesMap.halfRadius * (2 * hexPos.r + hexPos.q);

    }

    setCursorVisibility(visible: boolean, mapName = "default") {
        this.cursors.set(mapName, visible ? new Internal.Drawable(0, 0, "hover-hex", 0, undefined, undefined, undefined) : undefined);
    }

  }
} 
