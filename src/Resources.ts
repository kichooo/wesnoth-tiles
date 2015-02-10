declare class Promise {
  static all: any;
  constructor(func: (resolve: any, reject: any) => void);
  then(any): Promise;
}

module WesnothTiles {
  'use strict';

  export interface HexResource {
    bases: SpriteDefinition[];
  }

  export var hexResources = new Map<string, HexResource>();


  // This class is responsible for loading of the graphics.
  export class Resources {
    private atlases = new Map<string, HTMLElement>();
    private definitions = new Map<string, SpriteDefinition>();
    

    constructor() {
    }

    private toString2(n: number): string {
      if (n === 0)
        return "";
      return (n + 1).toString();
    }

    groupTransitions(base: string) {
      // for each size (1..6), for each rotation (0..5):
      for (var rot = 0; rot < 6; rot++) {
        var name = base;
        for (var size = 0; size < 6; size++) {
          var hr: HexResource = {
            bases: [],
          }
          name += "-" + rotationToString((rot + size) % 6)              
          for (var i = 0; this.definitions.has(name + this.toString2(i)); i++) {
            if (i > 0)
              console.log("Jeb z lasera",name, i);
            hr.bases.push(this.definitions.get(name + this.toString2(i)));
          }
          hexResources.set(name, hr);
        }  
      }

    }

    groupBase(base: string) {
      var hr: HexResource = {
        bases: [],
      }
      for (var i = 0; this.definitions.has(base + this.toString2(i)); i++) {
                    if (i > 0)
              console.log("Jeb z lasera",name, i);
        hr.bases.push(this.definitions.get(base + this.toString2(i)));
      }

      hexResources.set(base, hr);
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

    drawSprite(def: SpriteDefinition, pos: IVector, ctx: CanvasRenderingContext2D) {
      if (def === null || def === undefined) {
        console.error("Invalid sprite!", name);
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


    }

    // Will return promise when they are supported;) (by ArcticTypescript)
    loadResources(): Promise {
      var promises: Promise[] = [];
      for (var i = 0; i < 3; i++) {
        promises.push(this.provideAtlas("hexes_" + i));
      }

      return Promise.all(promises).then(() => {
        this.groupBase("hills/regular");
        this.groupBase("hills/snow");
        this.groupBase("hills/dry");
        this.groupBase("hills/desert");

        this.groupBase("grass/green");
        this.groupBase("grass/semi-dry");
        this.groupBase("grass/dry");
        this.groupBase("grass/leaf-litter");

        this.groupTransitions("hills/regular");
        this.groupTransitions("hills/snow");
        this.groupTransitions("hills/dry");
        this.groupTransitions("hills/desert");

        this.groupTransitions("grass/green-long");
        this.groupTransitions("grass/dry-long");
        this.groupTransitions("grass/leaf-litter-long");
        this.groupTransitions("grass/semi-dry-long");
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