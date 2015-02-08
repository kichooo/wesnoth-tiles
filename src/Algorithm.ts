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
    name: string;
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
      var version = (q + r) * (q + r) % this.versions;
      var name = version === 0 ? this.appendix + ".png" : this.appendix + (version + 1) + ".png"
      htd.tiles.push({
        name: name, 
        point: { x: 0, y: 0},
        layer: -500
      });
    }
  }

  var macros: Macro[] = [];
  macros.push(new TerrainMacro(ETerrain.HILLS_REGULAR, "hills/regular", 3));
  macros.push(new TerrainMacro(ETerrain.HILLS_DRY, "hills/dry", 3));
  macros.push(new TerrainMacro(ETerrain.HILLS_DESERT, "hills/desert", 3));

  export var rebuild = (hexMap: HexMap) => {
    var drawMap = new Map<string,  HexToDraw>();

    macros.forEach(macro => {
      hexMap.iterate(hex => {
        macro.execute(hexMap, drawMap, hex.q, hex.r);
      });
    });

    return drawMap;
  }

  // export var drawTiles = (hexMap: HexMap) => {
    
  //   hexMap.iterate(hex => {
  //     switch (hex.terrain) {
  //       case ETerrain.HILLS_DESERT:
  //         drawHills("hills/desert", hex, hexMap, drawMap);
  //         break;
  //       case ETerrain.HILLS_DRY:
  //         drawHills("hills/dry", hex, hexMap, drawMap);
  //         break;
  //       case ETerrain.HILLS_REGULAR:
  //         drawHills("hills/regular", hex, hexMap, drawMap);
  //         break;        
  //       default:
  //         console.debug("Unhandled terain", hex);
  //         break;
  //     }
  //   });
  //   return drawMap;
  // }

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

  export var drawHills = (base: string, hex: Hex, hexMap: HexMap, drawMap: Map<string, HexToDraw>) => {
    var key = hex.toString()

    var hexToDraw = ensureGet(drawMap, hex.q, hex.r);

    hexToDraw.tiles.push({
      name: base + ".png", 
      point: { x: 0, y: 0},
        layer: -500
    });

    iterateRotations((rotation: number, q: number, r: number) => {
      var neighbour = hexMap.getHexP(hex.q + q, hex.r + r);
      if (!neighbour)
        return;
      var drawHex = ensureGet(drawMap, hex.q + q, hex.r + r);
      if (drawHex.flags.has(rotationToString(rotation)))
        return;
      if (hex.terrain !== neighbour.terrain) {
        drawHex.tiles.push({
          name: base + "-" + rotationToString(rotation) + ".png", 
          point: { x: 0, y: 0},
            layer: -180
        });
        drawHex.flags.set(rotationToString(rotation), true);
        hexToDraw.flags.set(rotationToString((rotation + 3) % 6), true);
      } 
    });

  }

  export var iterateRotations = (callback: (rotation: number, q: number, r: number) => void) => {
    callback(0, 0 , -1);
    callback(3, 0 , 1);
    callback(2, -1 , 0);
    callback(1, -1 , 1);
    callback(4, 1 , -1);
    callback(5, 1 , 0);
  }

  export var rotationToString = (rotation: number): string => {
    switch (rotation) {
      case 0:
        return "s";
      case 3:
        return "n";
      case 2:
        return "se";                
      case 1:
        return "ne";        
      case 5:
        return "nw";
      case 4:
        return "sw";        
      default:
        console.error("Invalid rotation",rotation);
        break;
    }
  }


} 
