/// <reference path="Resources.ts"/>

module WesnothTiles.Internal {
  'use strict';

  export interface IVector {
    x: number;
    y: number;
  }

  export interface IDrawable {
    draw(x: number, y: number, ctx: CanvasRenderingContext2D, timePassed: number);
    layer?: number;
    base?: IVector;
    toString(): string;
  }

  export class StaticImage implements IDrawable {
    constructor(private x: number, private y: number, private name: string, public layer: number, public base: IVector) {
      if (name.match("fog")) {
        console.log("fog found! ", name);
      }
    }

    draw(x: number, y: number, ctx: CanvasRenderingContext2D, timePassed: number) {
      var sprite = definitions.get(this.name);
      if (sprite === undefined) {
        console.error("Undefined sprite", this.name)
      }
      var pos: IVector = {
        x: this.x + x,
        y: this.y + y
      }
      sprite.draw(pos, ctx);
    }

    toString(): string {
      return this.name + this.layer + ',' + this.x + ',' + this.y;
    }
  }

  export class AnimatedImage implements IDrawable {
    private animTime = Date.now();
    constructor(private x: number,
      private y: number,
      private name: string,
      public layer: number,
      public base: IVector,
      private frames: number,
      private duration: number) {
    }

    draw(x: number, y: number, ctx: CanvasRenderingContext2D, timePassed: number) {
      this.animTime = (this.animTime + timePassed) % (this.frames * this.duration);
      var frame = 1 + Math.floor(this.animTime / this.duration);
      // console.log("frame",frame);
      var frameString = "A" + (frame >= 10 ? frame.toString() : ("0" + frame.toString()));
      var sprite = definitions.get(this.name.replace("@A", frameString));
      if (sprite === undefined) {
        console.error("Undefined sprite", this.name.replace("@A", frameString))
      }
      var pos: IVector = {
        x: this.x + x,
        y: this.y + y
      }

      sprite.draw(pos, ctx);
    }

    toString(): string {
      return this.name + this.duration + this.layer + ',' + this.x + ',' + this.y;
    }
   }
}  