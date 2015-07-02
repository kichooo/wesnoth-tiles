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
    private ctx: CanvasRenderingContext2D;
    // private drawMap = new Map<string,  HexToDraw>();
    private drawables: Internal.AnimatedDrawable[] = [];
    private lastDraw: number = Date.now();
    // private hexMap = new Internal.HexMap();

    private worker: Worker;

    private workerId = 0;

    constructor(private canvas: HTMLCanvasElement) {
      this.ctx = <any>this.canvas.getContext('2d');
    }

    // Clears the map.
    clear(map = "default"): Promise<void> {
      return Internal.sendCommand<void>("clear", map);
    }

    // Rebuilds the map. Following calls to redraw will draw the resulting map.
    rebuild(mapName = "default"): Promise<void> {
      return Internal.sendCommand<Internal.Drawable[]>("rebuild", mapName).then(drawables => {
        this.drawables = [];
        drawables.forEach(drawable => {
          this.drawables.push(new Internal.AnimatedDrawable(
            drawable.x, drawable.y, drawable.name, drawable.layer,
            drawable.base, drawable.frames, drawable.duration));
        });
      });
    }

    // Rebuilds, then calculates the checksum. Build results are discarded.
    getCheckSum(map = "default"): Promise<string> {
      return Internal.sendCommand<string>("getChecksum", map);
    }

    // Draws map onto the canvas. Best used in Animation Frame.
    redraw(): void {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      var now = Date.now();
      var diff = now - this.lastDraw;
      this.lastDraw = now;
      this.drawables.forEach(drawable => {
        drawable.draw(
          Math.floor((this.canvas.width) / 2),
          Math.floor((this.canvas.height) / 2),
          this.ctx, diff);
      });
    }

    resize(width: number, height: number): void {
      this.canvas.width = width;
      this.canvas.height = height;
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
