/// <reference path="HexPos.ts"/>

// Drawing algoritm. Pretty complicated, although much simplified compared to Wesnoth (which is much more powerful).

module WesnothTiles {
  'use strict';

  export interface HexToDraw {
    q: number;
    r: number;
    tiles: ImageToDraw[];
    flags: Map<string, boolean>;
  };

  export interface ImageToDraw {
    sprite: SpriteDefinition;
    point: IXY;
    layer: number;
  };


  export interface Macro {
    execute: (hexMap: HexMap, imagesMap: Map<string, HexToDraw>, q: number, r: number) => void;
  }

  export class TerrainMacro implements Macro {
    constructor(private terrain: ETerrain, private appendix: string, private versions: number) {

    }
    execute (hexMap: HexMap, imagesMap: Map<string, HexToDraw>, q: number, r: number): void {
      if (this.terrain !== hexMap.getHexP(q, r).terrain)
        return;
      var htd = ensureGet(imagesMap, q, r);
      var hr = hexResources.get(this.appendix);

      var sprite = hr.bases[(q + r) * (q + r) % hr.bases.length];
      htd.tiles.push({
        sprite: sprite, 
        point: { x: 0, y: 0},
        layer: -500
      });
    }
  }

  export class TransitionMacro implements Macro {
    constructor(private terrain: ETerrain, private appendix: string, private versions: number, private layer: number) {

    }
    execute (hexMap: HexMap, imagesMap: Map<string, HexToDraw>, q: number, r: number): void {
      if (this.terrain === hexMap.getHexP(q, r).terrain)
        return;
      var hexFrom = ensureGet(imagesMap, q, r);
      iterateRotations((rotation, qDiff, rDiff) => {
        var hex = hexMap.getHexP(q + qDiff, r + rDiff);
        if (!hex || hex.terrain !== this.terrain)
          return;
        if (hexFrom.flags.has(rotationToString(rotation)))
          return;
        var htd = ensureGet(imagesMap, q + qDiff, r + rDiff);        
        if (htd.flags.has(rotationToString((rotation + 3)%6)))
          return;
        hexFrom.flags.set(rotationToString(rotation), true);
        htd.flags.set(rotationToString((rotation + 3)%6), true);

        var htd = ensureGet(imagesMap, q, r);
        var hr = hexResources.get(this.appendix + "-" + rotationToString(rotation));

        var sprite = hr.bases[(q + r) * (q + r) % hr.bases.length];

        hexFrom.tiles.push({
          sprite: sprite, 
          point: { x: 0, y: 0},
          layer: this.layer
        })
      });
    }
  }

  var macros: Macro[] = [];
  macros.push(new TerrainMacro(ETerrain.HILLS_SNOW, "hills/snow", 3));
  macros.push(new TerrainMacro(ETerrain.HILLS_REGULAR, "hills/regular", 3));
  macros.push(new TerrainMacro(ETerrain.HILLS_DRY, "hills/dry", 3));
  macros.push(new TerrainMacro(ETerrain.HILLS_DESERT, "hills/desert", 3));

  macros.push(new TransitionMacro(ETerrain.HILLS_SNOW, "hills/snow", 3, -172));
  macros.push(new TransitionMacro(ETerrain.HILLS_REGULAR, "hills/regular", 3, -180));
  macros.push(new TransitionMacro(ETerrain.HILLS_DRY, "hills/dry", 3, -183));
  macros.push(new TransitionMacro(ETerrain.HILLS_DESERT, "hills/desert", 3, -184));

  export var rebuild = (hexMap: HexMap) => {
    var drawMap = new Map<string,  HexToDraw>();

    macros.forEach(macro => {
      hexMap.iterate(hex => {
        macro.execute(hexMap, drawMap, hex.q, hex.r);
      });
    });

    return drawMap;
  }

  export var ensureGet = (drawMap: Map<string, HexToDraw>, q: number, r: number) => {
    var key = HexPos.toString(q, r)
    if (!drawMap.has(key))
      drawMap.set(key, {
        q: q,
        r: r,
        flags: new Map<string, boolean>(),
        tiles: []
      });
    return drawMap.get(key);          
  }

  export var iterateRotations = (callback: (rotation: number, q: number, r: number) => void) => {
    callback(0, 0 , 1);
    callback(1, -1 , 1);
    callback(2, -1 , 0);
    callback(3, 0 , -1);
    callback(4, 1 , -1);
    callback(5, 1 , 0);    
  }

  export interface Rotation {
    q: number;
    r: number;
  }

  var tv: Rotation[] = [
    new HexPos(0, 1), 
    new HexPos(-1, 1), 
    new HexPos(-1, 0),
    new HexPos(0, -1),
    new HexPos(1, -1),
    new HexPos(1, 0),
  ]

  export var iterateTransitions = (callback: (rotations: Rotation[], appendix: string) => void) => {
    callback(tv, "s-sw-nw-n-ne-se");

    callback([tv[0], tv[1], tv[2], tv[3], tv[4]], "s-sw-nw-n-ne");
    callback([tv[1], tv[2], tv[3], tv[4], tv[5]], "sw-nw-n-ne-se");
    callback([tv[2], tv[3], tv[4], tv[5], tv[0]], "nw-n-ne-se-s");
    callback([tv[3], tv[4], tv[5], tv[0], tv[1]], "n-ne-se-s-sw");
    callback([tv[4], tv[5], tv[0], tv[1], tv[2]], "ne-se-s-sw-nw");
    callback([tv[5], tv[0], tv[1], tv[2], tv[3]], "se-s-sw-nw-n");
  }

  export var rotationToString = (rotation: number): string => {
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


} 
