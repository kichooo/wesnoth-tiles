module WesnothTiles {
  'use strict';

  // This class is responsible for loading of the graphics.
  export class Resources {
    private atlases = new Map<string, HTMLElement>();
    private definitions = new Map<string, SpriteDefinition>();


    constructor() {
    }

    // We do not load images ourselves, this must be done by parent project. 
    // (for example using promising API). We do not want to implement promising api, loading bar etc ourselves,
    // nor include a library, which will then be probably doubled by the parent project. 
    provideAtlas(name: string, atlas: HTMLElement, definitions: Map<string, SpriteDefinition>) {
      this.atlases[name] = atlas;
      definitions.forEach((def: SpriteDefinition, key: string) => {
        this.definitions.set(key, def);
      });
    }

    // pos is meant to be the center left top corner of the sprite.
    drawSprite(name: string, pos: IVector, ctx: CanvasRenderingContext2D) {
      var def = this.definitions.get(name);
      if (def === null || def === undefined) {
        console.error("Invalid sprite name!");
        return;
      }

      ctx.drawImage(def.atlas, def.spriteSource.point.x , def.spriteSource.point.y, 
        def.spriteSource.size.x, def.spriteSource.size.y, 
        pos.x, pos.y,
        def.sourceSize.x, def.sourceSize.y
        );
    }


// var imageObj = new Image();
//         imageObj.onload = () => {
//           this.hexGfx[name] = imageObj;
//           deferred.resolve();
//         };

//         imageObj.src = "images/" + name + ".png";


  }
} 
