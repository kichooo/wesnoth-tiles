module WesnothTiles {
  'use strict';

  export class Renderer<HexType extends Hex> {
    private ctx: CanvasRenderingContext2D;
    private hexMap = new HexMap();
    private resources = new Resources();
    private imagesToDraw: ImageToDraw[] = [];


    constructor(private canvas: HTMLCanvasElement) {
      this.ctx = this.canvas.getContext('2d');
    }

    getHex(pos: HexPos): HexType {
      return <HexType>this.hexMap.getHex(pos);
    }

    redraw(): void {
      console.log("Redraw.");
      this.ctx.beginPath();
      this.ctx.rect(0, this.canvas.height / 2 - 5, this.canvas.width, 10);
      this.ctx.fillStyle = 'yellow';
      this.ctx.fill();
      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = 'gray';
      this.ctx.stroke();

      // Drawin procedure:
      // Draw hexes themselves (including multihex)
      // In second run, draw the overlays (transitions) (overlays must be drawn in order.)
      // Only in the end, draw trees and villages, campfires, etv



      this.hexMap.iterate((hex: Hex) => {
        this.drawTile(hex);
      });

      this.imagesToDraw.sort((a: ImageToDraw, b: ImageToDraw) => {
        return a.layer - b.layer;
      });
      // this.resources.drawSprite("hills/regular.png", {x: 300, y: 336}, this.ctx);
      for (var i = 0; i < this.imagesToDraw.length; i++) {
        this.resources.drawSprite(this.imagesToDraw[i].name, this.imagesToDraw[i].point, this.ctx);
      }
    }

    private drawTile(hex: Hex): void {
      // This is the most important place of the component.
      // We need to be prepared for the multihex mountaint tiles too one day. 

      if (hex.terrain === ETerrain.HILLS_REGULAR) {
        this.imagesToDraw.push(new ImageToDraw("hills/regular.png", {
        x: this.canvas.width / 2 + (36 * 1.5) * hex.q - 36, 
        y: this.canvas.height / 2 + 35 * (2 * hex.r + hex.q) - 36
      }, 500));
      }




      // this.resources.drawSprite("hills/regular.png", , this.ctx);        
    }

    Resize(width: number, height: number): void {    
      this.canvas.width = width;
      this.canvas.height = height;
    }


    load(): Promise {
      return this.resources.loadResources();
    }

    addHex(hex: Hex) {
      this.hexMap.addHex(hex)
    }


  }

  class ImageToDraw {
    constructor(public name: string, public point: IXY, public layer: number) {
    }
  };
} 
