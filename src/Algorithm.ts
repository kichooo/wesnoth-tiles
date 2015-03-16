// Drawing algoritm. Pretty complicated, although much simplified compared to Wesnoth (which is much more powerful).

module WesnothTiles {
  'use strict';

  interface Flags extends Map<string,  Map<string, boolean>> {};

  // export interface IDrawable {
  //   q: number;
  //   r: number;

  //   // sprites: ISprite[];
  //   // flags: Map<string, boolean>;
  //   name: string;
  // };


  // export interface ISprite {
  //   animation: Resources.IAnimationDef;
  //   frame: number;
  //   layer: number;
  // }

  // export interface Macro {
  //   execute: (hexMap: HexMap, imagesMap: Map<string, HexToDraw>, q: number, r: number) => void;
  // }

  // var TerrainMacro = () => {

  // }


  interface WMLImage {
    name: string;
    layer: number;
  }

  interface WMLTile {
    set_flag?: string[];
    has_flag?: string[];
    no_flag?: string[];

    x: number;
    y: number;
    type: Map<number, boolean>;

    image?: WMLImage;

    anchor?: number;
  }

  interface WMLTerrainGraphics {
    tiles: WMLTile[];
    set_flag?: string[];
    has_flag?: string[];
    no_flag?: string[];

    probability?: number;

    rotations?: string[];
  }

  interface IDrawParams {
    hex: Hex;
    hexMap: HexMap;
    flags: Flags;
    drawables: IDrawable[];
  }

  interface PLFB {
    prob: number;
    layer: number;
    flag: string;
    builder: string;
  }

  var GENERIC_SINGLE_PLFB = () => {

  }

  var TERRAIN_BASE_PLFB = (terrain: string ) => {

  }

  var TERRAIN_BASE_P = (terrainGraphics: WMLTerrainGraphics[], terrainList: any, imageStem: string) => {
    
  }

  var addGrassGreen = (terrainGraphics: WMLTerrainGraphics[]) => {
    var img: WMLImage = {
      name: "grass/green",
      layer: 1000
    }

    var tile: WMLTile = {
      x: 0,
      y: 0,
      type: new Map<number, boolean>(),
      image: img

    }
    var terrainGraphic: WMLTerrainGraphics = {
      tiles: [
        tile
      ]
    }
    terrainGraphics.push(terrainGraphic);

    // if (dp.hex.terrain == ETerrain.HILLS_REGULAR) {

    //   dp.drawables.push(new StaticImage(
    //     (36 * 1.5) * dp.hex.q - 36, 
    //     36 * (2 * dp.hex.r + dp.hex.q) - 36, 
    //     "hills/regular", 100));
    // }
      


                //       x: Math.floor((this.canvas.width) / 2) + (36 * 1.5) * hex.q - 36,
                // y: Math.floor((this.canvas.height) / 2) + 36 * (2 * hex.r + hex.q) - 36
  }

  // export class TerrainMacro implements Macro {
  //   constructor(private terrain: ETerrain, private base: string) {

  //   }
  //   execute (hexMap: HexMap, imagesMap: Map<string, HexToDraw>, q: number, r: number): void {
  //     if (this.terrain !== hexMap.getHexP(q, r).terrain)
  //       return;
  //     var htd = ensureGet(imagesMap, q, r);
  //     var hr = Resources.hexResources.get(this.base);

  //     var animation = hr.variations[Math.abs((q + r) * (q)) % hr.variations.length];
  //     // console.log("Drawing", Math.abs((q + r) * (q)) % hr.bases.length);
  //     htd.sprites.push({
  //       animation: animation,
  //       layer: -1000,
  //       frame: 0
  //     });
  //   }
  // }

  // export class TransitionMacro implements Macro {
  //   private toMap: Map<string, boolean> = new Map<string, boolean>();
  //   constructor(private terrain: ETerrain, 
  //     private base: string, 
  //     private layer: number, 
  //     private double: boolean, 
  //     to: ETerrain[], 
  //     private reverse: boolean) {

  //     to.forEach((t: ETerrain) => {
  //       this.toMap.set(t.toString(), true);
  //     })
  //   }
  //   execute (hexMap: HexMap, imagesMap: Map<string, HexToDraw>, q: number, r: number): void {
  //     var h = hexMap.getHexP(q, r);
  //     if ((this.toMap.has(h.terrain.toString()) && this.reverse)
  //       || (!this.toMap.has(h.terrain.toString()) && !this.reverse))
  //       return;

  //     var hexFrom = ensureGet(imagesMap, q, r);
  //     iterateTransitions((rotations: Rotation[], app: string) => {
  //       var hr = Resources.hexResources.get(this.base + "-" + app);
  //       if (hr.variations.length === 0)
  //         return;
  //       for (var i = 0; i < rotations.length; i++) {
  //         var rot = rotations[i];
  //         var hex = hexMap.getHexP(q + rot.q, r + rot.r);
  //         if (!hex 
  //           || hex.terrain !== this.terrain
  //           || hexFrom.flags.has(rot.app))
  //           return;
  //         var htd = ensureGet(imagesMap, q + rot.q, r + rot.r);
  //         if (htd.flags.has(rot.opp) && !this.double) 
  //           return;          
  //       }

  //       for (var i = 0; i < rotations.length; i++) {
  //         hexFrom.flags.set(rot.app, true);
  //         var rot = rotations[i];
  //         if (!this.double) {
  //           var htd = ensureGet(imagesMap, q + rot.q, r + rot.r);
  //           htd.flags.set(rot.opp, true);
  //         }

  //       }


  //       var animation = hr.variations[Math.abs((q + r) * (q)) % hr.variations.length];
  //     // console.log("Drawing", Math.abs((q + r) * (q)) % hr.bases.length);
  //       hexFrom.sprites.push({
  //         animation: animation,
  //         layer: this.layer,
  //         frame: 0
  //       });
  //     });
  //   }
  // }

  // var macros: Macro[] = [];
  // macros.push(new TerrainMacro(ETerrain.HILLS_SNOW, "hills/snow"));
  // macros.push(new TerrainMacro(ETerrain.HILLS_REGULAR, "hills/regular"));
  // macros.push(new TerrainMacro(ETerrain.HILLS_DRY, "hills/dry"));
  // macros.push(new TerrainMacro(ETerrain.HILLS_DESERT, "hills/desert"));

  // macros.push(new TerrainMacro(ETerrain.GRASS_GREEN, "grass/green"));
  // macros.push(new TerrainMacro(ETerrain.GRASS_DRY, "grass/dry"));
  // macros.push(new TerrainMacro(ETerrain.GRASS_LEAF_LITTER, "grass/leaf-litter"));
  // macros.push(new TerrainMacro(ETerrain.GRASS_SEMI_DRY, "grass/semi-dry"));

  // macros.push(new TerrainMacro(ETerrain.SWAMP_MUD, "swamp/mud"));
  // macros.push(new TerrainMacro(ETerrain.SWAMP_WATER, "swamp/water"));

  // macros.push(new TerrainMacro(ETerrain.WATER_COAST_TROPICAL, "water/coast-tropical"));
  // macros.push(new TerrainMacro(ETerrain.WATER_OCEAN, "water/ocean"));

  // macros.push(new TransitionMacro(ETerrain.HILLS_SNOW, "hills/snow-to-hills", -170, false, [ETerrain.HILLS_DESERT, ETerrain.HILLS_DRY, ETerrain.HILLS_REGULAR], false));
  // macros.push(new TransitionMacro(ETerrain.HILLS_SNOW, "hills/snow-to-water", -171, false, [ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL], false));

  // macros.push(new TransitionMacro(ETerrain.HILLS_SNOW, "hills/snow", -172, false, [ETerrain.HILLS_SNOW], true));
  // macros.push(new TransitionMacro(ETerrain.HILLS_REGULAR, "hills/regular", -180, false, [ETerrain.HILLS_REGULAR, ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL], true));
  // macros.push(new TransitionMacro(ETerrain.HILLS_DRY, "hills/dry", -183, false, [ETerrain.HILLS_DRY, ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL], true));
  // macros.push(new TransitionMacro(ETerrain.HILLS_DESERT, "hills/desert", -184, false, [ETerrain.HILLS_DESERT, ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL], true));

  // macros.push(new TransitionMacro(ETerrain.SWAMP_WATER, "swamp/water", -230, false, [ETerrain.SWAMP_WATER], true));

  // macros.push(new TransitionMacro(ETerrain.GRASS_DRY, "grass/dry-long", -250, true, [ETerrain.GRASS_GREEN, ETerrain.GRASS_SEMI_DRY, ETerrain.GRASS_LEAF_LITTER], false));
  // macros.push(new TransitionMacro(ETerrain.GRASS_GREEN, "grass/green-long", -251, true, [ETerrain.GRASS_SEMI_DRY, ETerrain.GRASS_DRY, ETerrain.GRASS_LEAF_LITTER], false));
  // macros.push(new TransitionMacro(ETerrain.GRASS_SEMI_DRY, "grass/semi-dry-long", -252, true, [ETerrain.GRASS_GREEN, ETerrain.GRASS_DRY, ETerrain.GRASS_LEAF_LITTER], false));
  // macros.push(new TransitionMacro(ETerrain.GRASS_LEAF_LITTER, "grass/leaf-litter-long", -253, true, [ETerrain.GRASS_GREEN, ETerrain.GRASS_SEMI_DRY, ETerrain.GRASS_DRY], false));

  // macros.push(new TransitionMacro(ETerrain.GRASS_DRY, "grass/dry-abrupt", -273, false, [ETerrain.GRASS_DRY], true));
  // macros.push(new TransitionMacro(ETerrain.GRASS_GREEN, "grass/green-abrupt", -271, false, [ETerrain.GRASS_GREEN], true));
  // macros.push(new TransitionMacro(ETerrain.GRASS_SEMI_DRY, "grass/semi-dry-abrupt", -272, false, [ETerrain.GRASS_SEMI_DRY], true));
  // macros.push(new TransitionMacro(ETerrain.GRASS_LEAF_LITTER, "grass/leaf-litter", -270, false, [ETerrain.GRASS_LEAF_LITTER], true));

  // macros.push(new TransitionMacro(ETerrain.WATER_OCEAN, "flat/bank", -300, false, [ETerrain.GRASS_LEAF_LITTER], false));
  // macros.push(new TransitionMacro(ETerrain.WATER_COAST_TROPICAL, "flat/bank", -300, false, [ETerrain.GRASS_LEAF_LITTER], false));

  // macros.push(new TransitionMacro(ETerrain.SWAMP_MUD, "swamp/mud-to-land", -310, false, [ETerrain.SWAMP_MUD], true));

  // macros.push(new TransitionMacro(ETerrain.HILLS_REGULAR, "hills/regular-to-water", -482, false, [ETerrain.WATER_COAST_TROPICAL, ETerrain.WATER_OCEAN], false));
  // macros.push(new TransitionMacro(ETerrain.HILLS_DRY, "hills/dry-to-water", -482, false, [ETerrain.WATER_COAST_TROPICAL, ETerrain.WATER_OCEAN], false));

  // macros.push(new TransitionMacro(ETerrain.WATER_OCEAN, "water/ocean-blend", -550, true, [ETerrain.WATER_COAST_TROPICAL], false));
  // macros.push(new TransitionMacro(ETerrain.WATER_COAST_TROPICAL, "water/coast-tropical-long", -553, true, [ETerrain.WATER_OCEAN], false));

  var performTerrainGraphics = (tg: WMLTerrainGraphics, dp: IDrawParams) => {
    if (tg.tiles !== undefined) {
      for (var i = tg.tiles.length - 1; i >= 0; i--) {
        // tg.Tiles[i]
        if (true) {

          } else {
            return;
          }
      }
      for (var i = tg.tiles.length - 1; i >= 0; i--) {
        if (tg.tiles[i].image !== undefined) {
          dp.drawables.push(new StaticImage(
              (36 * 1.5) * dp.hex.q - 36, 
              36 * (2 * dp.hex.r + dp.hex.q) - 36, 
              tg.tiles[i].image.name, 100
            )
          ); 
         
        }
        
      }
    }   
    
  }

  var macros: { (terrainGraphics: WMLTerrainGraphics[]): void; } [] = [];
  macros.push(addGrassGreen);

  var TerrainGraphics: WMLTerrainGraphics[] = [];



  export var rebuild = (hexMap: HexMap) => {
    var terrainGraphics: WMLTerrainGraphics[] = [];
    macros.forEach(macro => macro(terrainGraphics));

    var flags = new Map<string,  Map<string, boolean>>();


    var drawables: IDrawable[] = [];

    var dp: IDrawParams = {
      hex: null,
      hexMap: hexMap,
      flags: flags,
      drawables: drawables
    }


    terrainGraphics.forEach(tg => {
      hexMap.iterate(hex => {
        dp.hex = hex;
        performTerrainGraphics(tg, dp);
      });
    });


    return drawables;

    // var drawMap = new Map<string,  HexToDraw>();

    // macros.forEach(macro => {
    //   hexMap.iterate(hex => {
    //     macro.execute(hexMap, drawMap, hex.q, hex.r);
    //   });
    // });

    // return drawMap;
  }

  // export var ensureGet = (drawMap: Map<string, HexToDraw>, q: number, r: number) => {
  //   var key = HexPos.toString(q, r)
  //   if (!drawMap.has(key))
  //     drawMap.set(key, {
  //       q: q,
  //       r: r,
  //       flags: new Map<string, boolean>(),
  //       sprites: [],
  //     });
  //   return drawMap.get(key);          
  // }

  // export interface Rotation {
  //   q: number;
  //   r: number;
  //   app: string; // app
  //   opp: string; // Opposite to the app.
  // }

  // var tv: Rotation[] = [
  //   {q: 0, r: 1, app: "s", opp: "n"}, 
  //   {q: -1, r: 1, app: "sw", opp: "ne"},
  //   {q: -1, r: 0, app: "nw", opp: "se"},
  //   {q: 0, r: -1, app: "n", opp: "s"},
  //   {q: 1, r: -1, app: "ne", opp: "sw"},
  //   {q: 1, r: 0, app: "se", opp: "nw"},
  // ]

  // export var iterateTransitions = (callback: (rotations: Rotation[], app: string) => void) => {
  //   callback(tv, "s-sw-nw-n-ne-se");

  //   callback([tv[0], tv[1], tv[2], tv[3], tv[4]], "s-sw-nw-n-ne");
  //   callback([tv[1], tv[2], tv[3], tv[4], tv[5]], "sw-nw-n-ne-se");
  //   callback([tv[2], tv[3], tv[4], tv[5], tv[0]], "nw-n-ne-se-s");
  //   callback([tv[3], tv[4], tv[5], tv[0], tv[1]], "n-ne-se-s-sw");
  //   callback([tv[4], tv[5], tv[0], tv[1], tv[2]], "ne-se-s-sw-nw");
  //   callback([tv[5], tv[0], tv[1], tv[2], tv[3]], "se-s-sw-nw-n");

  //   callback([tv[0], tv[1], tv[2], tv[3]], "s-sw-nw-n");
  //   callback([tv[1], tv[2], tv[3], tv[4]], "sw-nw-n-ne");
  //   callback([tv[2], tv[3], tv[4], tv[5]], "nw-n-ne-se");
  //   callback([tv[3], tv[4], tv[5], tv[0]], "n-ne-se-s");
  //   callback([tv[4], tv[5], tv[0], tv[1]], "ne-se-s-sw");
  //   callback([tv[5], tv[0], tv[1], tv[2]], "se-s-sw-nw");

  //   callback([tv[0], tv[1], tv[2]], "s-sw-nw");
  //   callback([tv[1], tv[2], tv[3]], "sw-nw-n");
  //   callback([tv[2], tv[3], tv[4]], "nw-n-ne");
  //   callback([tv[3], tv[4], tv[5]], "n-ne-se");
  //   callback([tv[4], tv[5], tv[0]], "ne-se-s");
  //   callback([tv[5], tv[0], tv[1]], "se-s-sw");    

  //   callback([tv[0], tv[1]], "s-sw");
  //   callback([tv[1], tv[2]], "sw-nw");
  //   callback([tv[2], tv[3]], "nw-n");
  //   callback([tv[3], tv[4]], "n-ne");
  //   callback([tv[4], tv[5]], "ne-se");
  //   callback([tv[5], tv[0]], "se-s");

  //   callback([tv[0]], "s");
  //   callback([tv[1]], "sw");
  //   callback([tv[2]], "nw");
  //   callback([tv[3]], "n");
  //   callback([tv[4]], "ne");
  //   callback([tv[5]], "se");
  // }

} 
