module WesnothTiles {
  'use strict';

  export interface IVector {
    x: number;
    y: number;
  }

  export interface IDrawable {
    draw(pos: IVector, ctx: CanvasRenderingContext2D);
    layer: number;
  }

  export class StaticImage implements IDrawable {
    constructor(private x: number, private y: number, private name: string, public layer: number ) {
    }

    draw(pos: IVector, ctx: CanvasRenderingContext2D) {
      var sprite = Resources.definitions.get(this.name);
      var pos: IVector = {
        x: this.x + pos.x,
        y: this.y + pos.y
      }

      sprite.draw(pos, ctx);
    }
  }


  export class Renderer<HexType extends Hex> {
    private ctx: CanvasRenderingContext2D;
    // private drawMap = new Map<string,  HexToDraw>();
    private drawables: IDrawable[];



    constructor(private canvas: HTMLCanvasElement) {
      this.ctx = this.canvas.getContext('2d');
    }

    rebuild(hexMap: HexMap) {
      this.drawables = rebuild(hexMap);
      this.drawables.sort((a: IDrawable, b: IDrawable) => {
        return a.layer - b.layer;
      });
    }

    redraw(hexMap: HexMap): void {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.drawables.forEach(drawable => {
        drawable.draw({                        
          x: Math.floor((this.canvas.width) / 2),
          y: Math.floor((this.canvas.height) / 2)
        }, this.ctx);
      });
      
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

    Resize(width: number, height: number): void {    
      this.canvas.width = width;
      this.canvas.height = height;
    }


    load(): Promise<void> {
      return Resources.loadResources();
    }

  }
} 
