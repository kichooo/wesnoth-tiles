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

  export class TilesMap {
    private drawables = new Map<string, Internal.Drawable[]>();
    private lastDraw: number = Date.now();

    private worker: Worker;

    private workerId = 0;

    constructor() {
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
    getCheckSum(map = "default"): Promise<string> {
      return Internal.sendCommand<string>("getChecksum", map);
    }

    // Draws map onto the canvas. Best used in Animation Frame.
    redraw(mapName: string, ctx: CanvasRenderingContext2D, x: number, y: number): void {
      var drawables = this.drawables.get(mapName);
      if (drawables === undefined)
        return;
      var now = Date.now();
      var diff = now - this.lastDraw;
      this.lastDraw = now;
      drawables.forEach(drawable => {
        drawable.draw(x, y, ctx, diff);
      });
    }

    // Creates instance of MapBuilder. LoadingMode argument is worth seting 
    // When you plan to load bigger chunks of tiles at once.
    getBuilder(map = "default", loadingMode = false): MapBuilder {
      return new MapBuilder(map, loadingMode);
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

  }
} 
