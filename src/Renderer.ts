module WesnothTiles {
  'use strict';

  export class Renderer<HexType extends Hex> {
    private ctx: CanvasRenderingContext2D;
    private hexMap = new HexMap();
    private resources = new Resources();

    constructor(private canvas: HTMLCanvasElement) {
      this.ctx = this.canvas.getContext('2d');
    }

    getHex(pos: HexPos): HexType {
      return <HexType>this.hexMap.getHex(pos);
    }

    redraw(): void {
      console.log("Redraw.");
      this.ctx.beginPath();
      this.ctx.rect(10, 10, 72, 72);
      this.ctx.fillStyle = 'yellow';
      this.ctx.fill();
      this.ctx.lineWidth = 4;
      this.ctx.strokeStyle = 'gray';
      this.ctx.stroke();

      this.hexMap.iterate((hex: Hex) => {
        this.resources.drawSprite("hills/regular.png", {x: 300 + (36 * 1.5) * hex.q, y: 300 + 36 * (2 * hex.r + hex.q)}, this.ctx);        
      });
      // this.resources.drawSprite("hills/regular.png", {x: 300, y: 336}, this.ctx);

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
} 
