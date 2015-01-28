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

    provideAtlas(name: string, atlas: HTMLElement, definitions: Map<string, SpriteDefinition>) {
      this.resources.provideAtlas(name, atlas, definitions);
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
