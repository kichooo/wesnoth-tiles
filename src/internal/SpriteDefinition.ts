/// <reference path="Resources.ts"/>

module WesnothTiles.Internal {
  'use strict';

  export interface IFrame {
    point: IVector;
    size: IVector;
  }

  export class SpriteDefinition {
    constructor(private frame: IFrame, private spriteSource: IFrame, private sourceSize: IVector, private atlas: HTMLElement) {
    }

    draw(x: number, y: number, ctx: CanvasRenderingContext2D) {
      ctx.drawImage(this.atlas, this.frame.point.x, this.frame.point.y,
        this.frame.size.x, this.frame.size.y,
        x + this.spriteSource.point.x - this.sourceSize.x / 2,
        y + this.spriteSource.point.y - this.sourceSize.y / 2,
        this.frame.size.x, this.frame.size.y
        );
    }
  }
} 
