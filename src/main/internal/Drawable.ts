/// <reference path="Resources.ts"/>

module WesnothTiles.Internal {
  'use strict';

  export class Drawable {
    constructor(public x: number,
      public y: number,
      private name: string,
      private frames: number,
      private duration: number) {
    }

    draw(x: number, y: number, ctx: CanvasRenderingContext2D, timestamp: number) {
      if (this.duration === undefined) { // sprite is static.
        var sprite = definitions.get(this.name);
        if (sprite === undefined) {
          console.error("Undefined sprite", this.name)
        }
        sprite.draw(this.x + x, this.y + y, ctx);
        return;
      }
      var frame = 1 + Math.floor(timestamp / this.duration) % this.frames;
      var frameString = "A" + (frame >= 10 ? frame.toString() : ("0" + frame.toString()));
      var sprite = definitions.get(this.name.replace("@A", frameString));
      if (sprite === undefined) {
        console.error("Undefined sprite", this.name.replace("@A", frameString))
      }
      sprite.draw(this.x + x, this.y + y, ctx);
    }
  }
}  