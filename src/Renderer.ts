module WesnothTiles {
  'use strict';



  export class Renderer<HexType extends Hex> {
    private ctx: CanvasRenderingContext2D;
    private resources = new Resources();


    constructor(private canvas: HTMLCanvasElement) {
      this.ctx = this.canvas.getContext('2d');
    }

    redraw(hexMap: HexMap): void {
      console.log("Redraw.");
      this.ctx.beginPath();
      this.ctx.rect(0, this.canvas.height / 2 - 5, this.canvas.width, 10);
      this.ctx.fillStyle = 'yellow';
      this.ctx.fill();
      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = 'gray';
      this.ctx.stroke();

      // var drawMap = drawTiles(hexMap);
      var drawMap = rebuild(hexMap);
// console.log(this.canvas.width, this.canvas.height);
      drawMap.forEach(hex => {
        hex.tiles.sort((a: ImageToDraw, b: ImageToDraw) => {
          return a.layer - b.layer;
        });
        for (var i = 0; i < hex.tiles.length; i++) {
          this.resources.drawSprite(hex.tiles[i].name, {                        
            x: hex.tiles[i].point.x + Math.floor((this.canvas.width) / 2) + (36 * 1.5) * hex.q - 36,
            y: hex.tiles[i].point.y + Math.floor((this.canvas.height) / 2) + 36 * (2 * hex.r + hex.q) - 36
          }, this.ctx);
        }
      });
    }

    Resize(width: number, height: number): void {    
      this.canvas.width = width;
      this.canvas.height = height;
    }


    load(): Promise {
      return this.resources.loadResources();
    }

  }

  class ImageToDraw {
    constructor(public name: string, public point: IXY, public layer: number) {
    }
  };
} 
