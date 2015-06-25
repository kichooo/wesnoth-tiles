/// <reference path="Resources.ts"/>

module WesnothTiles.Internal {
  'use strict';

  export interface IDrawable {
    draw(x: number, y: number, ctx: CanvasRenderingContext2D, timePassed: number);
    layer?: number;
    name: string;
    base?: IVector;
    toString(): string;
    x: number;
    y: number;
  }

  export class StaticDrawable implements IDrawable {
    constructor(public x: number, public y: number, public name: string, public layer: number, public base: IVector) {
    }

    draw(x: number, y: number, ctx: CanvasRenderingContext2D, timePassed: number) {
      var sprite = definitions.get(this.name);
      if (sprite === undefined) {
        console.error("Undefined sprite", this.name)
      }
      sprite.draw(this.x + x, this.y + y, ctx);
    }

    toString(): string {
      return this.name + this.layer + ',' + this.x + ',' + this.y;
    }
  }

  export class AnimatedDrawable implements IDrawable {
    private animTime = Date.now();
    constructor(public x: number,
      public y: number,
      public name: string,
      public layer: number,
      public base: IVector,
      private frames: number,
      private duration: number) {
    }

    draw(x: number, y: number, ctx: CanvasRenderingContext2D, timePassed: number) {
      if (this.duration === undefined) { // sprite is static.
        var sprite = definitions.get(this.name);
        if (sprite === undefined) {
          console.error("Undefined sprite", this.name)
        }
        sprite.draw(this.x + x, this.y + y, ctx);
        return;
      }
      this.animTime = (this.animTime + timePassed) % (this.frames * this.duration);
      var frame = 1 + Math.floor(this.animTime / this.duration);
      var frameString = "A" + (frame >= 10 ? frame.toString() : ("0" + frame.toString()));
      var sprite = definitions.get(this.name.replace("@A", frameString));
      if (sprite === undefined) {
        console.error("Undefined sprite", this.name.replace("@A", frameString))
      }
      sprite.draw(this.x + x, this.y + y, ctx);
    }

    toString(): string {
      if (this.duration === undefined)
        return this.name + this.layer + ',' + this.x + ',' + this.y;
      else 
        return this.name + this.duration + this.layer + ',' + this.x + ',' + this.y;
    }
  }
}  