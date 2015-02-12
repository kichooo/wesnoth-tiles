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
        hex.tiles.sort((a: ImageToDraw, b: ImageToDraw) => {
          return a.layer - b.layer;
        });
      });
    }

    redraw(hexMap: HexMap): void {
// console.log(this.canvas.width, this.canvas.height);
      this.drawMap.forEach(hex => {
        for (var i = 0; i < hex.tiles.length; i++) {

          if (hex.tiles[i].sprite === null || hex.tiles[i].sprite === undefined) {
            console.error("Invalid sprite!", name);
            return;
          }
          hex.tiles[i].sprite.draw({                        
            x: Math.floor((this.canvas.width) / 2) + (36 * 1.5) * hex.q - 36,
            y: Math.floor((this.canvas.height) / 2) + 36 * (2 * hex.r + hex.q) - 36
          }, this.ctx);
        }
      });
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
