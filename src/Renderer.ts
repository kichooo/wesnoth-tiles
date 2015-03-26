module WesnothTiles {
  'use strict';

  export interface IVector {
    x: number;
    y: number;
  }

  export interface IDrawable {
    draw(pos: IVector, ctx: CanvasRenderingContext2D, timePassed: number);
    layer: number;
  }

  export class StaticImage implements IDrawable {
    constructor(private x: number, private y: number, private name: string, public layer: number ) {
    }

    draw(pos: IVector, ctx: CanvasRenderingContext2D, timePassed: number) {
      var sprite = Resources.definitions.get(this.name);
      if (sprite === undefined) {
        console.error("Undefined sprite", this.name)
      }
      var pos: IVector = {
        x: this.x + pos.x,
        y: this.y + pos.y
      }
      // if (this.name == "flat/bank-n") {
      //   console.log("dupa");
      // }
      sprite.draw(pos, ctx);
    }
  }

  export class AnimatedImage implements IDrawable {
    private animTime = Date.now();
    constructor(private x: number, 
      private y: number, 
      private name: string, 
      public layer: number, 
      private frames: number, 
      private duration:  number) {
    }

    draw(pos: IVector, ctx: CanvasRenderingContext2D, timePassed: number) {
      this.animTime = (this.animTime + timePassed) % (this.frames * this.duration);
      var frame = 1 + Math.floor(this.animTime / this.duration);
      var frameString = "A" + (frame >= 10 ? frame.toString() : ("0" + frame.toString()));
      var sprite = Resources.definitions.get(this.name.replace("@A", frameString));
      if (sprite === undefined) {
        console.error("Undefined sprite", this.name.replace("@A", frameString))
      }
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
    private lastDraw: number = Date.now();



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
      var now = Date.now();
      var diff = now - this.lastDraw;
      this.lastDraw = now;
      this.drawables.forEach(drawable => {
        drawable.draw({                    
          x: Math.floor((this.canvas.width) / 2),
          y: Math.floor((this.canvas.height) / 2),          
        }, this.ctx, diff);
      });

      this.ctx.beginPath();
      this.ctx.lineWidth = 4;
      this.ctx.strokeStyle = "green";
      this.ctx.rect(this.canvas.width / 2 - 4, this.canvas.height / 2 - 4,8,8);
      this.ctx.stroke();
      
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
