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
    constructor(private terrain: ETerrain, private base: string) {

    }
    execute (hexMap: HexMap, imagesMap: Map<string, HexToDraw>, q: number, r: number): void {
      if (this.terrain !== hexMap.getHexP(q, r).terrain)
        return;
      var htd = ensureGet(imagesMap, q, r);
      var hr = hexResources.get(this.base);

      var sprite = hr.bases[Math.abs((q + r) * (q)) % hr.bases.length];
      // console.log("Drawing", Math.abs((q + r) * (q)) % hr.bases.length);
      htd.tiles.push({
        sprite: sprite, 
        point: { x: 0, y: 0},
        layer: -500
      });
    }
  }

  export class TransitionMacro implements Macro {
    private toMap: Map<string, boolean> = new Map<string, boolean>();
    constructor(private terrain: ETerrain, 
      private base: string, 
      private layer: number, 
      private double: boolean, 
      to: ETerrain[], 
      private reverse: boolean) {

      to.forEach((t: ETerrain) => {
        this.toMap.set(t.toString(), true);
      })
    }
    execute (hexMap: HexMap, imagesMap: Map<string, HexToDraw>, q: number, r: number): void {
      var h = hexMap.getHexP(q, r);
      if ((this.toMap.has(h.terrain.toString()) && this.reverse)
        || (!this.toMap.has(h.terrain.toString()) && !this.reverse))
        return;

      var hexFrom = ensureGet(imagesMap, q, r);
      iterateTransitions((rotations: Rotation[], app: string) => {
        var hr = hexResources.get(this.base + "-" + app);
        if (hr.bases.length === 0)
          return;
        for (var i = 0; i < rotations.length; i++) {
          var rot = rotations[i];
          var hex = hexMap.getHexP(q + rot.q, r + rot.r);
          if (!hex 
            || hex.terrain !== this.terrain
            || hexFrom.flags.has(rot.app))
            return;
          var htd = ensureGet(imagesMap, q + rot.q, r + rot.r);
          if (htd.flags.has(rot.opp) && !this.double) 
            return;          
        }

        for (var i = 0; i < rotations.length; i++) {
          hexFrom.flags.set(rot.app, true);
          var rot = rotations[i];
          if (!this.double) {
            var htd = ensureGet(imagesMap, q + rot.q, r + rot.r);
            htd.flags.set(rot.opp, true);
          }

        }
      
        var sprite = hr.bases[Math.abs((q + r) * (q)) % hr.bases.length];

        hexFrom.tiles.push({
          sprite: sprite, 
          point: { x: 0, y: 0},
          layer: this.layer
        })        
              
      });
    }
  }

  var macros: Macro[] = [];
  macros.push(new TerrainMacro(ETerrain.HILLS_SNOW, "hills/snow"));
  macros.push(new TerrainMacro(ETerrain.HILLS_REGULAR, "hills/regular"));
  macros.push(new TerrainMacro(ETerrain.HILLS_DRY, "hills/dry"));
  macros.push(new TerrainMacro(ETerrain.HILLS_DESERT, "hills/desert"));

  macros.push(new TerrainMacro(ETerrain.GRASS_GREEN, "grass/green"));
  macros.push(new TerrainMacro(ETerrain.GRASS_DRY, "grass/dry"));
  macros.push(new TerrainMacro(ETerrain.GRASS_LEAF_LITTER, "grass/leaf-litter"));
  macros.push(new TerrainMacro(ETerrain.GRASS_SEMI_DRY, "grass/semi-dry"));

  macros.push(new TerrainMacro(ETerrain.SWAMP_MUD, "swamp/mud"));
  macros.push(new TerrainMacro(ETerrain.SWAMP_WATER, "swamp/water"));


  macros.push(new TransitionMacro(ETerrain.HILLS_SNOW, "hills/snow", -172, false, [ETerrain.HILLS_SNOW], true));
  macros.push(new TransitionMacro(ETerrain.HILLS_REGULAR, "hills/regular", -180, false, [ETerrain.HILLS_REGULAR], true));
  macros.push(new TransitionMacro(ETerrain.HILLS_DRY, "hills/dry", -183, false, [ETerrain.HILLS_DRY], true));
  macros.push(new TransitionMacro(ETerrain.HILLS_DESERT, "hills/desert", -184, false, [ETerrain.HILLS_DESERT], true));

  macros.push(new TransitionMacro(ETerrain.SWAMP_WATER, "swamp/water", -230, false, [ETerrain.SWAMP_WATER], true));

  macros.push(new TransitionMacro(ETerrain.GRASS_DRY, "grass/dry-long", -250, true, [ETerrain.GRASS_GREEN, ETerrain.GRASS_SEMI_DRY, ETerrain.GRASS_LEAF_LITTER], false));
  macros.push(new TransitionMacro(ETerrain.GRASS_GREEN, "grass/green-long", -251, true, [ETerrain.GRASS_SEMI_DRY, ETerrain.GRASS_DRY, ETerrain.GRASS_LEAF_LITTER], false));
  macros.push(new TransitionMacro(ETerrain.GRASS_SEMI_DRY, "grass/semi-dry-long", -252, true, [ETerrain.GRASS_GREEN, ETerrain.GRASS_DRY, ETerrain.GRASS_LEAF_LITTER], false));
  macros.push(new TransitionMacro(ETerrain.GRASS_LEAF_LITTER, "grass/leaf-litter-long", -253, true, [ETerrain.GRASS_GREEN, ETerrain.GRASS_SEMI_DRY, ETerrain.GRASS_DRY], false));

  macros.push(new TransitionMacro(ETerrain.GRASS_DRY, "grass/dry-abrupt", -273, false, [ETerrain.HILLS_DRY], false));
  macros.push(new TransitionMacro(ETerrain.GRASS_GREEN, "grass/green-abrupt", -271, false, [ETerrain.GRASS_GREEN], false));
  macros.push(new TransitionMacro(ETerrain.GRASS_SEMI_DRY, "grass/semi-dry-abrupt", -272, false, [ETerrain.GRASS_SEMI_DRY], false));
  macros.push(new TransitionMacro(ETerrain.GRASS_LEAF_LITTER, "grass/leaf-litter", -270, false, [ETerrain.GRASS_LEAF_LITTER], false));

  macros.push(new TransitionMacro(ETerrain.SWAMP_MUD, "swamp/mud-to-land", -310, false, [ETerrain.SWAMP_MUD], true));

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
    app: string; // app
    opp: string; // Opposite to the app.
  }

  var tv: Rotation[] = [
    {q: 0, r: 1, app: "s", opp: "n"}, 
    {q: -1, r: 1, app: "sw", opp: "ne"},
    {q: -1, r: 0, app: "nw", opp: "se"},
    {q: 0, r: -1, app: "n", opp: "s"},
    {q: 1, r: -1, app: "ne", opp: "sw"},
    {q: 1, r: 0, app: "se", opp: "nw"},
  ]

  export var iterateTransitions = (callback: (rotations: Rotation[], app: string) => void) => {
    callback(tv, "s-sw-nw-n-ne-se");

    callback([tv[0], tv[1], tv[2], tv[3], tv[4]], "s-sw-nw-n-ne");
    callback([tv[1], tv[2], tv[3], tv[4], tv[5]], "sw-nw-n-ne-se");
    callback([tv[2], tv[3], tv[4], tv[5], tv[0]], "nw-n-ne-se-s");
    callback([tv[3], tv[4], tv[5], tv[0], tv[1]], "n-ne-se-s-sw");
    callback([tv[4], tv[5], tv[0], tv[1], tv[2]], "ne-se-s-sw-nw");
    callback([tv[5], tv[0], tv[1], tv[2], tv[3]], "se-s-sw-nw-n");

    callback([tv[0], tv[1], tv[2], tv[3]], "s-sw-nw-n");
    callback([tv[1], tv[2], tv[3], tv[4]], "sw-nw-n-ne");
    callback([tv[2], tv[3], tv[4], tv[5]], "nw-n-ne-se");
    callback([tv[3], tv[4], tv[5], tv[0]], "n-ne-se-s");
    callback([tv[4], tv[5], tv[0], tv[1]], "ne-se-s-sw");
    callback([tv[5], tv[0], tv[1], tv[2]], "se-s-sw-nw");

    callback([tv[0], tv[1], tv[2]], "s-sw-nw");
    callback([tv[1], tv[2], tv[3]], "sw-nw-n");
    callback([tv[2], tv[3], tv[4]], "nw-n-ne");
    callback([tv[3], tv[4], tv[5]], "n-ne-se");
    callback([tv[4], tv[5], tv[0]], "ne-se-s");
    callback([tv[5], tv[0], tv[1]], "se-s-sw");    

    callback([tv[0], tv[1]], "s-sw");
    callback([tv[1], tv[2]], "sw-nw");
    callback([tv[2], tv[3]], "nw-n");
    callback([tv[3], tv[4]], "n-ne");
    callback([tv[4], tv[5]], "ne-se");
    callback([tv[5], tv[0]], "se-s");

    callback([tv[0]], "s");
    callback([tv[1]], "sw");
    callback([tv[2]], "nw");
    callback([tv[3]], "n");
    callback([tv[4]], "ne");
    callback([tv[5]], "se");
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
