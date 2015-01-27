module WesnothTiles {
  'use strict';

  export class Renderer<HexType extends Hex> {
    private ctx: CanvasRenderingContext2D;
    private hexMap = new HexMap();

    constructor(private canvas: HTMLCanvasElement) {
      this.ctx = this.canvas.getContext('2d');
    }

    getHex(pos: Pos): HexType {
      return <HexType>this.hexMap.getHex(pos);
    }

    Redraw(): void {
      console.log("Redraw.");
      this.ctx.beginPath();
      this.ctx.rect(10, 10, 700, 400);
      this.ctx.fillStyle = 'yellow';
      this.ctx.fill();
      this.ctx.lineWidth = 4;
      this.ctx.strokeStyle = 'gray';
      this.ctx.stroke();

    }

    Resize(width: number, height: number): void {    
      this.canvas.width = width;
      this.canvas.height = height;
    }




  }
} 
