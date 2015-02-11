module WesnothTiles {
  'use strict';

  export interface IVector {
    x: number;
    y: number;
  }

  export interface IFrame {
    point: IVector;
    size: IVector;
  }
  // This class is responsible for storing sprite data.
  export class SpriteDefinition {

    constructor(public frame: IFrame, public spriteSource: IFrame, public sourceSize: IVector, public atlas: HTMLElement) {      
    }

    draw(pos: IVector, ctx: CanvasRenderingContext2D) {
      ctx.drawImage(this.atlas, this.frame.point.x , this.frame.point.y,
        this.frame.size.x, this.frame.size.y,
        pos.x + this.spriteSource.point.x, pos.y + this.spriteSource.point.y,
        this.frame.size.x, this.frame.size.y
      );
    }
  }
} 
