declare class Promise {
  static all: any;
  constructor(func: (resolve: any, reject: any) => void);
  then(any): Promise;
}

module WesnothTiles.Resources {
  'use strict';

  export interface HexResource {
    bases: SpriteDefinition[];
  }

  var rotationToString = (rotation: number): string => {
    switch (rotation) {
      case 0:
        return "s";
      case 1:
        return "sw";        
      case 2:
        return "nw";
      case 3:
        return "n";
      case 4:
        return "ne";                
      case 5:
        return "se";

      default:
        console.error("Invalid rotation",rotation);
        break;
    }
  }


  export var hexResources = new Map<string, HexResource>();


  // This class is responsible for loading of the graphics.
    var atlases = new Map<string, HTMLElement>();
    var definitions = new Map<string, SpriteDefinition>();
    

    var toString = (n: number): string => {
      if (n === 0)
        return "";
      return (n + 1).toString();
    }

    var groupTransitions = (base: string) => {
      // for each size (1..6), for each rotation (0..5):
      for (var rot = 0; rot < 6; rot++) {
        var name = base;
        for (var size = 0; size < 6; size++) {
          var hr: HexResource = {
            bases: [],
          }
          name += "-" + rotationToString((rot + size) % 6)              
          for (var i = 0; definitions.has(name + toString(i)); i++) {
            if (i > 0)
              console.log("Jeb z lasera",name, i);
            hr.bases.push(definitions.get(name + toString(i)));
          }
          hexResources.set(name, hr);
        }  
      }

    }

    var groupBase = (base: string) => {
      var hr: HexResource = {
        bases: [],
      }
      for (var i = 0; definitions.has(base + toString(i)); i++) {
        hr.bases.push(definitions.get(base + toString(i)));
      }

      hexResources.set(base, hr);
    }

    var provideAtlas = (name: string): Promise => {
      var img = new Image();
      var promises: Promise[] = [];

      promises.push(new Promise((resolve, reject) => {
        img.src = name + ".png";    
        img.onload = () => {
          if (atlases.has(name)) {
            console.error("That atlas was already loaded!", name);            
            return;
          }          
          atlases.set(name, img);
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
          var def = new SpriteDefinition({
                point: {x: d.frame.x, y: d.frame.y},
                size: {x: d.frame.w, y: d.frame.h}
              }, {
                point: {x: d.spriteSourceSize.x, y: d.spriteSourceSize.y},
                size: {x: d.spriteSourceSize.w, y: d.spriteSourceSize.h}
              }, { x: d.sourceSize.w, y: d.sourceSize.h}, img);
          if (definitions.has(d.filename)) {
            console.error("Frame name already included!", def);
            return;
          }
          definitions.set(d.filename, def);
        });
      }));


             


      return Promise.all(promises);
      // definitions.forEach((def: SpriteDefinition, key: string) => {
      //   definitions.set(key, def);
      // });
    }

    // Will return promise when they are supported;) (by ArcticTypescript)
    export var loadResources = (): Promise => {
      var promises: Promise[] = [];
      for (var i = 0; i < 3; i++) {
        promises.push(provideAtlas("hexes_" + i));
      }

      return Promise.all(promises).then(() => {
        groupBase("hills/regular");
        groupBase("hills/snow");
        groupBase("hills/dry");
        groupBase("hills/desert");

        groupBase("grass/green");
        groupBase("grass/semi-dry");
        groupBase("grass/dry");
        groupBase("grass/leaf-litter");

        groupBase("hills/regular");
        groupBase("hills/snow");
        groupBase("hills/dry");
        groupBase("hills/desert");

        groupBase("grass/green");
        groupBase("grass/semi-dry");
        groupBase("grass/dry");
        groupBase("grass/leaf-litter");

        groupBase("swamp/mud");
        groupBase("swamp/water");

        groupTransitions("hills/regular");
        groupTransitions("hills/snow");
        groupTransitions("hills/dry");
        groupTransitions("hills/desert");

        groupTransitions("grass/green-long");
        groupTransitions("grass/dry-long");
        groupTransitions("grass/leaf-litter-long");
        groupTransitions("grass/semi-dry-long");

        groupTransitions("grass/green-abrupt");
        groupTransitions("grass/dry-abrupt");
        groupTransitions("grass/leaf-litter");
        groupTransitions("grass/semi-dry-abrupt");

        groupTransitions("swamp/mud-to-land");
        groupTransitions("swamp/water");
      });

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