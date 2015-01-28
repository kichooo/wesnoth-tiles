module WesnothTiles {
  'use strict';

  // This class is responsible for loading of the graphics.
  export class Resources {
    private atlases = new Map<string, HTMLElement>();
    private definitions = new Map<string, SpriteDefinition>();


    constructor() {
    }

    // We do not load images ourselves, this must be done by parent project. 
    //  (for example using promising API).
    provideAtlas(name: string, atlas: HTMLElement, definitions: Map<string, SpriteDefinition>) {
      this.atlases[name] = atlas;
    }


// var imageObj = new Image();
//         imageObj.onload = () => {
//           this.hexGfx[name] = imageObj;
//           deferred.resolve();
//         };

//         imageObj.src = "images/" + name + ".png";


  }
} 
