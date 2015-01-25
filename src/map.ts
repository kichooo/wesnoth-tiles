module WesnothTiles {
  'use strict';

  export class Map {
   private ctx: CanvasRenderingContext2D;

   constructor(private canvas: HTMLCanvasElement) {
    this.ctx = this.canvas.getContext('2d');
  }

  Redraw(): void {
    console.log("Redraw.");
    this.ctx.beginPath();
    this.ctx.rect(10, 10, 700, 400);
    this.ctx.fillStyle = 'yellow';
    this.ctx.fill();
    this.ctx.lineWidth = 7;
    this.ctx.strokeStyle = 'gray';
    this.ctx.stroke();
  }

  Resize(width: number, height: number): void {    
    this.canvas.width = width;
    this.canvas.height = height;
  }


}


} 
