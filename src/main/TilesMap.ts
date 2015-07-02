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
      // this.hexMap.clear();
    }

    private sortFunc = (a: Internal.AnimatedDrawable, b: Internal.AnimatedDrawable) => {
      if (a.layer === b.layer) {
        if (a.base !== undefined && b.base !== undefined) {
          return a.base.y - b.base.y;
        }
        if (b.base !== undefined) {
          return a.layer < 0 ? -1 : 1;
        } else if (a.base !== undefined) {
          return b.layer < 0 ? 1 : -1;
        }
        return 0;
      }
      return a.layer - b.layer;
    };

    rebuild(mapName = "default"): Promise<void> {
      return this.rebuildMap(mapName).then(drawables => {
        this.drawables = [];
        drawables.forEach(drawable => {
          this.drawables.push(new Internal.AnimatedDrawable(
            drawable.x, drawable.y, drawable.name, drawable.layer,
            drawable.base, drawable.frames, drawable.duration));
        });
      });
    }

    private rebuildMap(mapName: string): Promise<Internal.Drawable[]> {
      return Internal.sendCommand<Internal.Drawable[]>("rebuild", mapName);
    }

    // Rebuilds, then calculates the checksum. Build results are discarded.
    getCheckSum(map = "default"): Promise<string> {
      return Internal.sendCommand<string>("getChecksum", map);
    }

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

    // setTile(q: number, r: number, terrain: ETerrain = undefined, overlay = EOverlay.NONE, fog = false): MapBuilder {
    //   return new MapBuilder().setTile(q, r, terrain, overlay, fog);
    // }


    // // Unsets given hex. Overlay is cleared too.
    // // It is not an equivalent of setting terrain to Void.
    // // A 'rebuild' call is needed to actually display the change.
    // unsetTile(q: number, r: number): MapBuilder {
    //   return new MapBuilder().unsetTile(q, r);
    // }


    // Goes into loading mode - setting terrains is faster. This is the prefereable
    // method of modifying terrains if more then few terrains at once are changed.
    // This mode is being unset by first call to Rebuild or UnsetLoadingMode.
    getBuilder(map = "default", loadingMode = false): MapBuilder {
      return new MapBuilder(map, loadingMode);
    }

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
