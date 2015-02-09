declare class Promise {
  static all: any;
  constructor(func: (resolve: any, reject: any) => void);
  then(any): Promise;
}

module WesnothTiles {
  'use strict';

  export interface HexResource {
    bases: SpriteDefinition[];
    rotations1: SpriteDefinition[][];
  }

  // This class is responsible for loading of the graphics.
  export class Resources {
    private atlases = new Map<string, HTMLElement>();
    private definitions = new Map<string, SpriteDefinition>();
    hexResources = new Map<string, HexResource>();

    constructor() {
    }

    private toString(n: number): string {
      if (n === 0)
        return "";
      return n.toString();
    }

    group(base: string) {
      var hr: HexResource = {
        bases: [],
        rotations1: []
      }
      for (var i = 0; this.definitions.has(base + this.toString(i)); i++) {
        hr.bases.push(this.definitions.get(base + this.toString(i)));
      }

      for (var rot = 0; rot < 6; rot++) {
        for (var i = 0; this.definitions.has(base + '-' + rotationToString(rot) + this.toString(i)); i++) {
          hr.rotations1.push(this.definitions.get(base + '-' + rotationToString(rot) + this.toString(i)));
        }
      }
      this.hexResources.set(base, hr);
    }

    private provideAtlas(name: string): Promise {
      var img = new Image();
      var promises: Promise[] = [];

      promises.push(new Promise((resolve, reject) => {
        img.src = name + ".png";    
        img.onload = () => {
          if (this.atlases.has(name)) {
            console.error("That atlas was already loaded!", name);            
            return;
          }          
          this.atlases.set(name, img);
          console.log("atlas loaded!!", name);
          resolve();
        }
        img.onerror = () => {
          reject();
        };
      }));

      promises.push(new Promise((resolve, reject) => {
        var req = new XMLHttpRequest();
        req.open('GET', name + ".json", true);
        req.onreadystatechange = function (aEvt) {
          if (req.readyState == 4) {
             if(req.status == 200) {
                var frames: IFrames = JSON.parse(req.responseText);
                console.log(frames);
                resolve(frames);              
             }              
             else
              reject();
          }
        };
        req.send(null);
          

      }).then((frames: IFrames) => {
        frames.frames.forEach((d: IDefinition) => {
          var def = new WesnothTiles.SpriteDefinition({
                point: {x: d.frame.x, y: d.frame.y},
                size: {x: d.frame.w, y: d.frame.h}
              }, {
                point: {x: d.spriteSourceSize.x, y: d.spriteSourceSize.y},
                size: {x: d.spriteSourceSize.w, y: d.spriteSourceSize.h}
              }, { x: d.sourceSize.w, y: d.sourceSize.h}, img);
          if (this.definitions.has(d.filename)) {
            console.error("Frame name already included!", def);
            return;
          }
          this.definitions.set(d.filename, def);
        });
      }));


             


      return Promise.all(promises);
      // definitions.forEach((def: SpriteDefinition, key: string) => {
      //   this.definitions.set(key, def);
      // });
    }

    // pos is meant to be the center left top corner of the sprite.
    drawSprite(name: string, pos: IVector, ctx: CanvasRenderingContext2D) {
      var def = this.definitions.get(name);
      if (def === null || def === undefined) {
        console.error("Invalid sprite name!", name);
        return;
      }
      // console.log("drawing...", def.atlas, def.frame.point.x , def.frame.point.y,
        // def.frame.size.x, def.frame.size.y,
        // pos.x - def.spriteSource.point.x, pos.y - def.spriteSource.point.y,
        // def.sourceSize.x, def.sourceSize.y);

      ctx.drawImage(def.atlas, def.frame.point.x , def.frame.point.y,
        def.frame.size.x, def.frame.size.y,
        pos.x + def.spriteSource.point.x, pos.y + def.spriteSource.point.y,
        def.frame.size.x, def.frame.size.y
      );

      // var p = new Promise<string>((resolve, reject) => { 
      //   resolve('a string'); 
      // });
    }

    // Will return promise when they are supported;) (by ArcticTypescript)
    loadResources(): Promise {
      var promises: Promise[] = [];
      for (var i = 0; i < 3; i++) {
        promises.push(this.provideAtlas("hexes_" + i));
      }

      return Promise.all(promises).then(() => {
        this.group("hills/regular");
        this.group("hills/snow");
        this.group("hills/dry");
        this.group("hills/desert");
      });

    }

  }

  interface IFrames {
    frames: IDefinition[];
  }

  interface ISprite {

  }

  interface IDefinition {
    filename: string;
    rotated: boolean;
    trimmed: boolean;
    frame: IXYWH;
    spriteSourceSize: IXYWH;
    sourceSize: IWH;
    pivot: IXY;  
  }

  interface IXYWH {
    x: number;
    y: number;
    w: number;
    h: number;
  }

  export interface IXY {
    x: number;
    y: number;
  }

  interface IWH {
    w: number;
    h: number;
  }




} 


              // var def = new WesnothTiles.SpriteDefinition({
              //   point: {
              //     x: 1342,
              //     y: 660
              //   },
              //   size: {
              //     x: 72,
              //     y: 72
              //   }
              // }, {
              //   point: {
              //     x: 0,
              //     y: 0
              //   },
              //   size: {
              //     x: 72,
              //     y: 72
              //   }
              // }, {
              //   x: 72,
              //   y: 72
              // }, img);