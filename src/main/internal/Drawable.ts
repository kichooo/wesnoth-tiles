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

    draw(projection: IProjection, ctx: CanvasRenderingContext2D, timestamp: number) {
      let sprite: SpriteDefinition;

      if (this.duration === undefined) { // sprite is static.
        sprite = definitions.get(this.name);
        if (sprite === undefined) {
          console.error("Undefined sprite", this.name)
        }

        if (this.x > projection.right + sprite.size().x / 2 || this.y > projection.bottom + sprite.size().y / 2
          || this.x + sprite.size().x / 2 < projection.left || this.y + sprite.size().y / 2 < projection.top)
          return;

        sprite.draw(this.x + projection.x - projection.left, this.y + projection.y - projection.top, ctx);
        return;
      } else {
        const frame = 1 + Math.floor(timestamp / this.duration) % this.frames;
        const frameString = "A" + (frame >= 10 ? frame.toString() : ("0" + frame.toString()));
        sprite = definitions.get(this.name.replace("@A", frameString));
      }

      if (sprite === undefined) {
        console.error("Undefined sprite", this.name, this);
      }

      // Check if we really need to draw the sprite, maybe it is outside of the drawing area.
      if (this.x > projection.right + sprite.size().x / 2 || this.y > projection.bottom + sprite.size().y / 2
        || this.x + sprite.size().x / 2 < projection.left || this.y + sprite.size().y / 2 < projection.top)
        return;


      sprite.draw(this.x + projection.x - projection.left, this.y + projection.y - projection.top, ctx);
    }
  }
}  