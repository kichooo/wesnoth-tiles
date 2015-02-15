module WesnothTiles {
  'use strict';



  export class Renderer<HexType extends Hex> {
    private ctx: CanvasRenderingContext2D;
    private drawMap = new Map<string,  HexToDraw>();


    constructor(private canvas: HTMLCanvasElement) {
      this.ctx = this.canvas.getContext('2d');
    }

    rebuild(hexMap: HexMap) {
      this.drawMap = rebuild(hexMap);
      this.drawMap.forEach(hex => {
        hex.sprites.sort((a: ISprite, b: ISprite) => {
          return a.layer - b.layer;
        });
      });
    }

    redraw(hexMap: HexMap): void {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
// console.log(this.canvas.width, this.canvas.height);
      for (var q = -20; q < 20; q++) { // very temporary...
        for (var r = -20; r < 20; r++) {
          var hex = this.drawMap.get(HexPos.toString(q, r));
            for (var i = 0; i < hex.sprites.length; i++) {
              var sprite = hex.sprites[i];
              if (sprite.animation === null || sprite.animation === undefined) {
                console.error("Invalid sprite!", sprite);
                return;
              }
              sprite.animation.frames[sprite.frame].draw({                        
                x: Math.floor((this.canvas.width) / 2) + (36 * 1.5) * hex.q - 36,
                y: Math.floor((this.canvas.height) / 2) + 36 * (2 * hex.r + hex.q) - 36
              }, this.ctx);
              sprite.frame = (sprite.frame + 1) % sprite.animation.frames.length;
              // sprite.frame = Math.min(sprite.animation.frames.length - 1, 3);
            }          
        }
      }
    }

    Resize(width: number, height: number): void {    
      this.canvas.width = width;
      this.canvas.height = height;
    }


    load(): Promise {
      return Resources.loadResources();
    }

  }
} 
