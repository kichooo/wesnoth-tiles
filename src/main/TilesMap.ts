module WesnothTiles {
  'use strict';

  export class TilesMap {
    private ctx: CanvasRenderingContext2D;
    // private drawMap = new Map<string,  HexToDraw>();
    private drawables: Internal.IDrawable[] = [];
    private lastDraw: number = Date.now();
    // private hexMap = new Internal.HexMap();

    private worker: Worker;

    private workerId = 0;

    constructor(private canvas: HTMLCanvasElement) {
      this.ctx = <any>this.canvas.getContext('2d');
    }

    // Goes into loading mode - setting terrains is faster. This is the prefereable
    // method of modifying terrains if more then few terrains at once are changed.
    // This mode is being unset by first call to Rebuild or UnsetLoadingMode.
    setLoadingMode(): void {
      // this.hexMap.setLoadingMode();
    }

    unsetLoadingMode(): void {
      // this.hexMap.unsetLoadingMode();
    }

    // Sets given hex to specified terrain. If not specified, overlay does not change.
    // A 'rebuild' call is needed to actually display the change.
    setTerrain(q: number, r: number, terrain: ETerrain, overlay = EOverlay.NONE, fog = false) {
      this.setTiles({
        q: q,
        r: r,
        terrain: terrain,
        overlay: overlay,
        fog: fog
      });
      // this.hexMap.setTerrain(q, r, terrain, overlay, fog);
    }

    // Unsets given hex. Overlay is cleared too.
    // It is not an equivalent of setting terrain to Void.
    // A 'rebuild' call is needed to actually display the change.
    unsetTerrain(q: number, r: number) {
      // this.hexMap.removeHex(q, r);
    }

    // Sets given hex to specified overlay. If hex does not exist,
    // an error is thrown. To clear the overlay, one needs to set it to None.
    // A 'rebuild' call is needed to actually display the change.
    // setOverlay(q: number, r: number, overlay: EOverlay) {
    //   var hex = this.hexMap.getHexP(q, r);
    //   if (hex === undefined)
    //     throw new Error("Cannot set overlay for hex (" + q + "," + r + "). No hex present.");
    //   hex.overlay = overlay;
    // }

    // Sets the fog of war - usually meant to display hex which was once seen,
    // but is no longer in the line of sight. If no hex is present, thows an error.
    // A 'rebuild' call is needed to actually display the change.    
    // setFog(q: number, r: number) {
    //   var hex = this.hexMap.getHexP(q, r);
    //   if (hex === undefined)
    //     throw new Error("Cannot set fog for hex (" + q + "," + r + "). No hex present.");
    //   hex.fog = true;
    // }

    // Removes the fog of war - usually meant to display hex which was once seen,
    // but is no longer in the line of sight. If no hex is present, thows an error.
    // A 'rebuild' call is needed to actually display the change.
    // unsetFog(q: number, r: number) {
    //   var hex = this.hexMap.getHexP(q, r);
    //   if (hex === undefined)
    //     throw new Error("Cannot unset fog for hex (" + q + "," + r + "). No hex present.");
    //   hex.fog = false;
    // }

    // Clears the map.
    clear() {
      // this.hexMap.clear();
    }

    private sortFuncForChecksum = (a: Internal.IDrawable, b: Internal.IDrawable) => {
      if (a.layer === b.layer) {
        if (a.base !== undefined && b.base !== undefined) {
          if (a.base.y === b.base.y) {
            return a.toString() < b.toString() ? -1 : 1;
          }
          return a.base.y - b.base.y;
        }
        if (b.base !== undefined) {
          return a.layer < 0 ? -1 : 1;
        } else if (a.base !== undefined) {
          return b.layer < 0 ? 1 : -1;
        }
        return a.toString() < b.toString() ? -1 : 1;
      }
      return a.layer - b.layer;
    };


    private sortFunc = (a: Internal.IDrawable, b: Internal.IDrawable) => {
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

    rebuild(): Promise<void> {
      return this.rebuildMap().then(drawables => {
        this.drawables = [];
        drawables.forEach(drawable => {
          this.drawables.push(new Internal.AnimatedDrawable(
            drawable.x, drawable.y, drawable.name, drawable.layer,
            drawable.base, drawable.frames, drawable.duration));
        });

        console.log(this.drawables);
      });
    }  

    private rebuildMap(): Promise<Internal.Drawable[]> {
      return <Promise<Internal.Drawable[]>><any>Internal.sendCommand("rebuild");
      // var p = new Promise<void>((resolve, reject) => {
      //   window.setTimeout(() => {
      //     // this.hexMap.unsetLoadingMode();
      //     // this.drawables = Internal.rebuild(this.hexMap);
      //     // this.drawables.sort(this.sortFunc);
      //     resolve();
      //   });
      // });
      // return p;   
    }

    getCheckSum(): string {
      var checksum = 0;

      // var dupa = "";
      this.drawables.sort(this.sortFuncForChecksum);
      this.drawables.forEach(drawable => {
        checksum = Internal.murmurhash3(drawable.toString(), checksum);
        // dupa = dupa + drawable.toString() + ";";
      });

      // console.log(dupa);
      return checksum.toString();
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

      // this.ctx.beginPath();
      // this.ctx.lineWidth = 4;
      // this.ctx.strokeStyle = "green";
      // this.ctx.rect(this.canvas.width / 2 - 4, this.canvas.height / 2 - 4,8,8);
      // this.ctx.stroke();
      
      // console.log(this.canvas.width, this.canvas.height);
      // for (var q = -20; q < 20; q++) { // very temporary...
      //   for (var r = -20; r < 20; r++) {
      //     var hex = this.drawMap.get(HexPos.toString(q, r));
      //       for (var i = 0; i < hex.sprites.length; i++) {
      //         var sprite = hex.sprites[i];
      //         if (sprite.animation === null || sprite.animation === undefined) {
      //           console.error("Invalid sprite!", sprite);
      //           return;
      //         }
      //         sprite.animation.frames[sprite.frame].draw(, this.ctx);
      //         sprite.frame = (sprite.frame + 1) % sprite.animation.frames.length;
      //         // sprite.frame = Math.min(sprite.animation.frames.length - 1, 3);
      //       }          
      //   }
      // }
    }

    resize(width: number, height: number): void {
      this.canvas.width = width;
      this.canvas.height = height;
    }

    setTiles(changes: Internal.ITileChange[] | Internal.ITileChange): Promise<void> {
      var tileChanges = <Internal.ITileChange[]>((changes.constructor === Array) 
        ? changes : [changes]);
      return <Promise<void>><any>Internal.sendCommand("setTiles", tileChanges);
    }

    load(): Promise<void> {
      Internal.loadWorker();
      return Internal.loadResources().then(() => {
        // console.log(Internal.definitions.);
        var keys: string[] = [];
        Internal.definitions.forEach((val, key) => {
          keys.push(key);
        }); 
        return <Promise<void>><any>Internal.sendCommand(
          "init", 
          keys
        );
      });
    }

  }
} 
