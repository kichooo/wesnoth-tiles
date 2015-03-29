// Drawing algoritm. Pretty complicated, although much simplified compared to Wesnoth (which is much more powerful).

/// <reference path="Macros.ts"/>

module WesnothTiles {
  'use strict';

  interface IDrawParams {
    hex: Hex;
    hexMap: HexMap;
    flags: Flags;
    drawables: IDrawable[];
  }

  interface Flags extends Map<string,  Map<string, boolean>> {};

  var getTerrainMap = (terrains: ETerrain[]) => {
    var terrainList = new Map<ETerrain, boolean>();
    terrains.forEach(terrain => {
      terrainList.set(terrain, true);
    });
    return terrainList;
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

  var setFlags = (rot: number, rotations: string[], hexPos: HexPos,
    set_flags: string[], set_flags_tg: string[],
    set_no_flags: string[], set_no_flags_tg: string[], flags: Flags) => {

    var hexFlags = flags.get(hexPos.toString());

    if (set_no_flags !== undefined)
      set_no_flags.forEach(flag => {
        // console.log("Setting flag", flag, replaceRotation(flag, rot, rotations), hexPos.toString());
        hexFlags.set(replaceRotation(flag, rot, rotations), true);
      });
    if (set_no_flags_tg !== undefined)
      set_no_flags_tg.forEach(flag => {
        hexFlags.set(replaceRotation(flag, rot, rotations), true);
      });

    if (set_flags !== undefined)
      set_flags.forEach(flag => {      
        hexFlags.set(replaceRotation(flag, rot, rotations), true);
      });
    if (set_flags_tg !== undefined)
      set_flags_tg.forEach(flag => {
        hexFlags.set(replaceRotation(flag, rot, rotations), true);
      });
  }

  var checkFlags = (rot: number, rotations: string[], hexPos: HexPos, 
    has_flags: string[], has_flags_tg: string[],
    no_flags: string[], no_flags_tg: string[],
    set_no_flags: string[], set_no_flags_tg: string[],
    flags: Flags) => {

    var hexFlags = flags.get(hexPos.toString());

    // 1st. Check if all needed has_flags are in place
    var ok = true;
    if (has_flags !== undefined)
      has_flags.forEach(flag => {      
        if (!hexFlags.has(replaceRotation(flag, rot, rotations))) ok = false;
      });
    if (has_flags_tg !== undefined)
      has_flags_tg.forEach(flag => {
        if (!hexFlags.has(replaceRotation(flag, rot, rotations))) ok = false;
      });
    if (!ok)
      return false;

    // 2rd. Check if all needed no_flags are in place
    if (no_flags !== undefined)
      no_flags.forEach(flag => {
        if (hexFlags.has(replaceRotation(flag, rot, rotations))) ok = false;
      });
    if (no_flags_tg !== undefined)      
      no_flags_tg.forEach(flag => {
        if (hexFlags.has(replaceRotation(flag, rot, rotations))) ok = false;
      });
    if (!ok)
      return false;

    // 3rd. Check if all needed set_no_flags are in place      
    if (set_no_flags !== undefined)
      set_no_flags.forEach(flag => {
        // console.log("Checking for flag", flag, replaceRotation(flag, rot, rotations), hexPos.toString());
        if (hexFlags.has(replaceRotation(flag, rot, rotations))) ok = false;
      });
    if (set_no_flags_tg !== undefined)
      set_no_flags_tg.forEach(flag => {
        if (hexFlags.has(replaceRotation(flag, rot, rotations))) ok = false;
      });
    return ok;    
  }

  var rotatePos = (q: number, r: number, rot: number) => {
    var result = [0, 0, 0];

    result[(6 - rot) % 3] = rot % 2 === 0 ? q : -q;
    result[(7 - rot) % 3] = rot % 2 === 0 ? r : -r;
    result[(8 - rot) % 3] = rot % 2 === 0 ? -q - r : q + r;
    return new HexPos(result[0], result[1]);
  }

  var replaceRotation = (input: string, rot: number, rotations: string[]) => {
    if (rotations === undefined)
      return input;
    return rotations === undefined ? input: input.replace("@R0", rotations[rot])
      .replace("@R1", rotations[(rot + 1) % 6])
      .replace("@R2", rotations[(rot + 2) % 6])
      .replace("@R3", rotations[(rot + 3) % 6])
      .replace("@R4", rotations[(rot + 4) % 6])
      .replace("@R5", rotations[(rot + 5) % 6])
  }


  var getImgName = (img: WMLImage, tg: WMLTerrainGraphics, rot: number, translatedPostfix: string) => {
                
    var imgName: string;
    var num = img.variations.length;
    for (;;) {
      num = Math.floor(Math.random() * num);
      var translatedName = tg.builder.toString(img.name, translatedPostfix);
      translatedName = translatedName.replace("@V", img.variations[num]);
      if (Resources.definitions.has(translatedName)) {
        imgName = img.name.replace("@V", img.variations[num]);
        break;
      }
      if (num === 0) {
        return undefined;
      }
    }
    return imgName;

  }

  var performRotatedTerrainGraphics = (tg: WMLTerrainGraphics, dp: IDrawParams, rot: number = 0) => {
    // console.log("Performing macro for rotation", dp.hex.toString(), rot);
    var chance = Math.floor(Math.random()*101);
    if (chance > tg.probability)
      return;
    if (tg.tiles !== undefined) {
      for (var i = 0; i < tg.tiles.length; i++) {
        var tile = tg.tiles[i];
        var rotHex = rotatePos(tile.q, tile.r, rot);
        var hexPos = new HexPos(dp.hex.q + rotHex.q, dp.hex.r + rotHex.r);
        var hex = dp.hexMap.getHex(hexPos);

        if (hex === undefined)
          return;


        if (!dp.flags.has(hexPos.toString()))
          dp.flags.set(hexPos.toString(), new Map<string, boolean>());
          
        if (!tile.type.has(hex.terrain)) {
          return;
        }
        if (!checkFlags(rot, tg.rotations, hexPos, tile.has_flag, tg.has_flag, 
          tile.no_flag, tg.no_flag, 
          tile.set_no_flag, tg.set_no_flag, dp.flags))
          return;          
      }

      var drawables: IDrawable[] = [];

      for (var i = 0; i < tg.tiles.length; i++) {
        var tile = tg.tiles[i];
        var rotHex = rotatePos(tile.q, tile.r, rot);
        var hexPos = new HexPos(dp.hex.q + rotHex.q, dp.hex.r + rotHex.r);        
        if (tile.images !== undefined) {
          for (var j = 0; j < tile.images.length; j++) {
            var img = tile.images[j];

            var translatedPostfix = img.postfix !== undefined ? replaceRotation(img.postfix, rot, tg.rotations): "";

            var imgName = getImgName(img, tg, rot, translatedPostfix);
            console.log("Name",imgName, img.name, translatedPostfix);
            if (imgName === undefined)
              return;
            var pos = {
              x: (36 * 1.5) * hexPos.q - 36, 
              y: 36 * (2 * hexPos.r + hexPos.q) - 36
            } 

            var newBase = img.base !== undefined ? {
              x: pos.x + img.base.x,
              y: pos.y + img.base.y
            } : undefined;            
            // console.log("Adding", imgName, img.name);

            drawables.push(tg.builder.toDrawable(imgName, translatedPostfix, pos, img.layer, newBase)); 

          }
         
        }              
      }
      if (tg.images !== undefined) {
        for (var j = 0; j < tg.images.length; j++) {
            var img = tg.images[j];

            var translatedPostfix = img.postfix !== undefined ? replaceRotation(img.postfix, rot, tg.rotations): "";

            var imgName = getImgName(img, tg, rot, translatedPostfix);
            console.log("Name",imgName, img.name, translatedPostfix);
            if (imgName === undefined)
              return;
            var hexQ = dp.hex.q;
            var hexR = dp.hex.r;
            var drawPos = {
              x: (36 * 1.5) * hexQ - 36, 
              y: 36 * (2 * hexR + hexQ) - 36
            }

            if (img.pos !== undefined) {
              drawPos.x += img.pos.x;
              drawPos.y += img.pos.y;
            }

            var newBase = img.base !== undefined ?{
              x: drawPos.x + img.base.x,
              y: drawPos.y + img.base.y
            } : undefined;

            // console.log("Adding", imgName, img.name);

            drawables.push(tg.builder.toDrawable(imgName, translatedPostfix, drawPos, img.layer, newBase)); 

          }
      }

      for (var i = 0; i < tg.tiles.length; i++) {
        var tile = tg.tiles[i];
        var rotHex = rotatePos(tile.q, tile.r, rot);
        var hexPos = new HexPos(dp.hex.q + rotHex.q, dp.hex.r + rotHex.r);        
        setFlags(rot, tg.rotations, hexPos, tile.set_flag, tg.set_flag, 
          tile.set_no_flag, tg.set_no_flag, dp.flags);      
      }
      // dp.drawables.push(drawables[0]);
      dp.drawables.push.apply(dp.drawables, drawables);
    }       
  }

  var performTerrainGraphics = (tg: WMLTerrainGraphics, dp: IDrawParams) => {
    if (tg.rotations !== undefined) {
      for (var i = 0; i < tg.rotations.length; i++) {
        performRotatedTerrainGraphics(tg, dp, i);
      }
    } else
      performRotatedTerrainGraphics(tg, dp);
  }
  

  var terrainGraphics: WMLTerrainGraphics[] = [];
  
  export var rebuild = (hexMap: HexMap) => {
    MOUNTAIN_SINGLE_RANDOM(terrainGraphics, getTerrainMap([ETerrain.MOUNTAIN_BASIC]), "mountains/basic", "base2"); // Mm
    MOUNTAIN_SINGLE_RANDOM(terrainGraphics, getTerrainMap([ETerrain.MOUNTAIN_DRY]), "mountains/dry", "base2"); // Md
    MOUNTAIN_SINGLE_RANDOM(terrainGraphics, getTerrainMap([ETerrain.MOUNTAIN_SNOW]), "mountains/snow", "base2"); // Ms


    TERRAIN_BASE_PLFB(terrainGraphics, getTerrainMap([ETerrain.GRASS_GREEN]), "grass/green", { prob: 20 });
    TERRAIN_BASE_RANDOM_LFB(terrainGraphics, getTerrainMap([ETerrain.GRASS_GREEN]), "grass/green", {});
    TERRAIN_BASE_PLFB(terrainGraphics, getTerrainMap([ETerrain.GRASS_DRY]), "grass/dry", { prob: 25 });
    TERRAIN_BASE_RANDOM_LFB(terrainGraphics, getTerrainMap([ETerrain.GRASS_DRY]), "grass/dry", {});
    TERRAIN_BASE_PLFB(terrainGraphics, getTerrainMap([ETerrain.GRASS_SEMI_DRY]), "grass/semi-dry", { prob: 25 });
    TERRAIN_BASE_RANDOM_LFB(terrainGraphics, getTerrainMap([ETerrain.GRASS_SEMI_DRY]), "grass/semi-dry", {});
    TERRAIN_BASE_RANDOM_LFB(terrainGraphics, getTerrainMap([ETerrain.GRASS_LEAF_LITTER]), "grass/leaf-litter", {});
    
    TERRAIN_BASE_RANDOM_LFB(terrainGraphics, getTerrainMap([ETerrain.HILLS_REGULAR]), "hills/regular", {}); // Hh
    TERRAIN_BASE_RANDOM_LFB(terrainGraphics, getTerrainMap([ETerrain.HILLS_DRY]), "hills/dry", {}); // Hhd
    TERRAIN_BASE_RANDOM_LFB(terrainGraphics, getTerrainMap([ETerrain.HILLS_DESERT]), "hills/desert", {}); // Hd
    TERRAIN_BASE_RANDOM_LFB(terrainGraphics, getTerrainMap([ETerrain.HILLS_SNOW]), "hills/snow", {}); // Ha

    TERRAIN_BASE_SINGLEHEX_PLFB(terrainGraphics, getTerrainMap([ETerrain.WATER_OCEAN]), "water/ocean", {
      builder: IB_ANIMATION_15_SLOW
    }); // Wo

    TERRAIN_BASE_SINGLEHEX_PLFB(terrainGraphics, getTerrainMap([ETerrain.WATER_COAST_TROPICAL]), "water/coast-tropical", {
      builder: IB_ANIMATION_15
    }); // Wwt

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.MOUNTAIN_DRY]), getTerrainMap([ETerrain.HILLS_REGULAR, ETerrain.HILLS_DESERT, ETerrain.HILLS_SNOW,
        ETerrain.GRASS_DRY, ETerrain.GRASS_GREEN, ETerrain.GRASS_LEAF_LITTER, ETerrain.GRASS_SEMI_DRY,
        ETerrain.MOUNTAIN_BASIC, ETerrain.MOUNTAIN_SNOW]), 
      "mountains/dry", { layer: -166 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.HILLS_DRY, ETerrain.HILLS_DESERT, ETerrain.GRASS_DRY, ETerrain.HILLS_SNOW]), getTerrainMap([ETerrain.MOUNTAIN_BASIC]), 
      "mountains/blend-from-dry", { layer: 0, flag: "inside" });    

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.HILLS_DRY, ETerrain.HILLS_DESERT, ETerrain.GRASS_DRY]), getTerrainMap([ETerrain.MOUNTAIN_SNOW]), 
      "mountains/blend-from-dry", { layer: 0, flag: "inside" });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.MOUNTAIN_BASIC]), getTerrainMap([ETerrain.HILLS_DRY, ETerrain.HILLS_DESERT, ETerrain.GRASS_DRY, ETerrain.HILLS_SNOW]), 
      "hills/dry", { layer: -166 })

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.MOUNTAIN_SNOW]), getTerrainMap([ETerrain.HILLS_DRY, ETerrain.HILLS_DESERT, ETerrain.GRASS_DRY]), 
      "hills/dry", { layer: -166 })

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.HILLS_SNOW, ETerrain.MOUNTAIN_SNOW]), getTerrainMap([ETerrain.HILLS_DRY, ETerrain.HILLS_REGULAR]), 
      "hills/snow-to-hills", { layer: -170 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.HILLS_SNOW, ETerrain.MOUNTAIN_SNOW]), getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL]), 
      "hills/snow-to-water", { layer: -171 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.HILLS_SNOW, ETerrain.MOUNTAIN_SNOW]), getTerrainMap([
        ETerrain.HILLS_DESERT, ETerrain.GRASS_DRY, ETerrain.GRASS_SEMI_DRY, ETerrain.GRASS_GREEN, ETerrain.GRASS_LEAF_LITTER]), 
      "hills/snow", { layer: -172 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.HILLS_REGULAR, ETerrain.MOUNTAIN_BASIC]), 
      getTerrainMap([ETerrain.GRASS_GREEN, ETerrain.GRASS_SEMI_DRY, ETerrain.GRASS_LEAF_LITTER, ETerrain.GRASS_DRY,
        ETerrain.HILLS_SNOW, ETerrain.HILLS_DRY, ETerrain.HILLS_DESERT,
        ETerrain.MOUNTAIN_SNOW, ETerrain.MOUNTAIN_DRY, ETerrain.MOUNTAIN_BASIC]), 
      "hills/regular", {layer: -180 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.HILLS_DRY]), 
      getTerrainMap([ETerrain.GRASS_GREEN, ETerrain.GRASS_SEMI_DRY, ETerrain.GRASS_LEAF_LITTER, ETerrain.GRASS_DRY,
        ETerrain.HILLS_SNOW, ETerrain.HILLS_REGULAR, ETerrain.HILLS_DESERT,
        ETerrain.MOUNTAIN_SNOW, ETerrain.MOUNTAIN_DRY, ETerrain.MOUNTAIN_BASIC]), 
      "hills/dry", {layer: -183 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.HILLS_DESERT]), 
      getTerrainMap([ETerrain.GRASS_GREEN, ETerrain.GRASS_SEMI_DRY, ETerrain.GRASS_LEAF_LITTER, ETerrain.GRASS_DRY,
        ETerrain.HILLS_SNOW, ETerrain.HILLS_REGULAR, ETerrain.HILLS_DRY,
        ETerrain.MOUNTAIN_SNOW, ETerrain.MOUNTAIN_DRY, ETerrain.MOUNTAIN_BASIC]), 
      "hills/desert", {layer: -184 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.GRASS_SEMI_DRY]), getTerrainMap([ETerrain.GRASS_GREEN, ETerrain.GRASS_DRY, ETerrain.GRASS_LEAF_LITTER]), 
      "grass/semi-dry-long", { flag: "inside", layer: -250 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.GRASS_GREEN]), getTerrainMap([ETerrain.GRASS_SEMI_DRY, ETerrain.GRASS_DRY, ETerrain.GRASS_LEAF_LITTER]), 
      "grass/green-long", { flag: "inside", layer: -251 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.GRASS_DRY]), getTerrainMap([ETerrain.GRASS_GREEN, ETerrain.GRASS_SEMI_DRY, ETerrain.GRASS_LEAF_LITTER]), 
      "grass/dry-long", { flag: "inside", layer: -252 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.GRASS_LEAF_LITTER]), getTerrainMap([ETerrain.GRASS_GREEN, ETerrain.GRASS_SEMI_DRY, ETerrain.GRASS_DRY]), 
      "grass/leaf-litter-long", { flag: "inside", layer: -253 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.GRASS_LEAF_LITTER]), getTerrainMap([ETerrain.GRASS_GREEN, ETerrain.GRASS_SEMI_DRY, ETerrain.GRASS_DRY]), 
      "grass/leaf-litter-long", { layer: -254 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.GRASS_DRY]), getTerrainMap([ETerrain.GRASS_GREEN, ETerrain.GRASS_SEMI_DRY, ETerrain.GRASS_LEAF_LITTER]), 
      "grass/dry-long", {layer: -255 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.GRASS_GREEN]), getTerrainMap([ETerrain.GRASS_SEMI_DRY, ETerrain.GRASS_DRY, ETerrain.GRASS_LEAF_LITTER]), 
      "grass/green-long", { layer: -256 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.GRASS_SEMI_DRY]), getTerrainMap([ETerrain.GRASS_GREEN, ETerrain.GRASS_DRY, ETerrain.GRASS_LEAF_LITTER]), 
      "grass/semi-dry-long", { layer: -257 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.GRASS_LEAF_LITTER]), getTerrainMap([ETerrain.MOUNTAIN_SNOW, ETerrain.MOUNTAIN_BASIC, ETerrain.MOUNTAIN_DRY,
        ETerrain.GRASS_DRY, ETerrain.GRASS_GREEN, ETerrain.GRASS_SEMI_DRY]), 
      "grass/leaf-litter", {layer: -270 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.GRASS_GREEN]), getTerrainMap([ETerrain.MOUNTAIN_DRY, ETerrain.WATER_COAST_TROPICAL, ETerrain.WATER_OCEAN]), 
      "grass/green-abrupt", {layer: -271 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.GRASS_SEMI_DRY]), getTerrainMap([ETerrain.WATER_COAST_TROPICAL, ETerrain.WATER_OCEAN,
        ETerrain.MOUNTAIN_SNOW, ETerrain.MOUNTAIN_BASIC, ETerrain.MOUNTAIN_DRY]), 
      "grass/semi-dry-abrupt", { layer: -272 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.GRASS_DRY]), getTerrainMap([ETerrain.WATER_COAST_TROPICAL, ETerrain.WATER_OCEAN,
        ETerrain.MOUNTAIN_SNOW, ETerrain.MOUNTAIN_BASIC, ETerrain.MOUNTAIN_DRY]), 
      "grass/dry-abrupt", { layer: -273 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL]), 
      getTerrainMap([ETerrain.GRASS_LEAF_LITTER]), 
      "flat/bank", { layer: -300 });

    NEW_WAVES(terrainGraphics,
      getTerrainMap([ETerrain.HILLS_DESERT]), 
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL]), 
      -499, "water/waves");

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.HILLS_REGULAR, ETerrain.MOUNTAIN_BASIC]), getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL]), 
      "hills/regular-to-water", { layer: -482, flag: "non_submerged" });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.HILLS_DRY, ETerrain.MOUNTAIN_DRY]), getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL]), 
      "hills/dry-to-water", { layer: -482, flag: "non_submerged" });    

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.GRASS_DRY, ETerrain.GRASS_GREEN, ETerrain.GRASS_LEAF_LITTER, ETerrain.GRASS_SEMI_DRY]), 
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL]), 
      "flat/bank-to-ice", { layer: -483, flag: "non_submerged" });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.HILLS_SNOW]), getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL]), 
      "frozen/ice", { layer: -485, flag: "non_submerged" }); 

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.HILLS_SNOW]), getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL]), 
      "frozen/ice-to-water", { layer: -505, flag: "submerged" }); 

    NEW_BEACH(terrainGraphics,
      getTerrainMap([ETerrain.HILLS_DESERT]), 
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL]), 
      "sand/shore");


    NEW_BEACH(terrainGraphics,
      getTerrainMap([ETerrain.GRASS_GREEN, ETerrain.GRASS_SEMI_DRY, ETerrain.GRASS_DRY, ETerrain.GRASS_LEAF_LITTER,
        ETerrain.HILLS_DESERT, ETerrain.HILLS_DRY, ETerrain.HILLS_REGULAR, ETerrain.HILLS_SNOW,
        ETerrain.MOUNTAIN_SNOW, ETerrain.MOUNTAIN_BASIC, ETerrain.MOUNTAIN_DRY]), 
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL]), 
      "flat/shore");


    ANIMATED_WATER_15_TRANSITION(terrainGraphics,
      getTerrainMap([ETerrain.WATER_OCEAN]), 
      getTerrainMap([ETerrain.WATER_COAST_TROPICAL]), 
      "water/ocean-blend", -550);

    ANIMATED_WATER_15_TRANSITION(terrainGraphics,      
      getTerrainMap([ETerrain.WATER_COAST_TROPICAL]), 
      getTerrainMap([ETerrain.WATER_OCEAN]), 
      "water/coast-tropical-long", -555);

// {TRANSITION_COMPLETE_LF     Gs              Gg,Gd,Gll,Re,Rb,Rd,Rp              -250     inside      grass/semi-dry-long}
// {TRANSITION_COMPLETE_LF     Gg              Gs,Gd,Gll,Re,Rb,Rd,Rp              -251     inside      grass/green-long}
// {TRANSITION_COMPLETE_LF     Gd              Gg,Gs,Gll,Re,Rb,Rd,Rp              -252     inside      grass/dry-long}
// {TRANSITION_COMPLETE_LF     Gll             Gg,Gs,Gd,Re,Rb,Rd,Rp               -253     inside      grass/leaf-litter-long}

// {TRANSITION_COMPLETE_L      Gll             Gg,Gs,Gd                           -254                 grass/leaf-litter-long
// {TRANSITION_COMPLETE_L      Gd              Gg,Gs,Gll                          -255                 grass/dry-long}
// {TRANSITION_COMPLETE_L      Gg              Gs,Gd,Gll                          -256                 grass/green-long}
// {TRANSITION_COMPLETE_L      Gs              Gg,Gd,Gll                          -257                 grass/semi-dry-long}

    


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
