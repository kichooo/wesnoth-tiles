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
            // console.log("Name",imgName, img.name, translatedPostfix);
            if (imgName === undefined)
              return;
            var pos = {
              x: (36 * 1.5) * hexPos.q, 
              y: 36 * (2 * hexPos.r + hexPos.q)
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
            // console.log("Name",imgName, img.name, translatedPostfix);
            if (imgName === undefined)
              return;
            var hexQ = dp.hex.q;
            var hexR = dp.hex.r;
            var drawPos = {
              x: (36 * 1.5) * hexQ - 36 + img.center.x, 
              y: 36 * (2 * hexR + hexQ) - 36+ img.center.y
            }

            var newBase = img.base !== undefined ?{
              x: drawPos.x,
              y: drawPos.y
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

    OVERLAY_COMPLETE_LFB(terrainGraphics, getTerrainMap([ETerrain.SWAMP_WATER]),
      getTerrainMap([ETerrain.HILLS_DESERT, ETerrain.HILLS_DRY, ETerrain.HILLS_REGULAR, ETerrain.HILLS_SNOW,
        ETerrain.MOUNTAIN_DRY, ETerrain.MOUNTAIN_DRY, ETerrain.MOUNTAIN_SNOW,
        ETerrain.FROZEN_ICE, ETerrain.FROZEN_SNOW]),
      "swamp/reed", {layer: -85, flag: "base2"});

    VOLCANO_2x2(terrainGraphics, 
      getTerrainMap([ETerrain.MOUNTAIN_VOLCANO]),
      getTerrainMap([ETerrain.MOUNTAIN_BASIC, ETerrain.MOUNTAIN_DRY]),
    "mountains/volcano6", "base2");

    OVERLAY_RESTRICTED3_PLFB(terrainGraphics, 
      getTerrainMap([ETerrain.MOUNTAIN_BASIC]),
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL]),
    "mountains/basic-castle-n", { flag: "base2" });
    OVERLAY_ROTATION_RESTRICTED2_PLFB(terrainGraphics, 
      getTerrainMap([ETerrain.MOUNTAIN_BASIC]),
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL]),
    "mountains/basic-castle", { flag: "base2" });
    OVERLAY_ROTATION_RESTRICTED_PLFB(terrainGraphics, 
      getTerrainMap([ETerrain.MOUNTAIN_BASIC]),
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL]),
    "mountains/basic-castle", { flag: "base2" });

    MOUNTAINS_2x4_NW_SE(terrainGraphics, getTerrainMap([ETerrain.MOUNTAIN_BASIC]), "mountains/basic_range3", "base2", 18); // Mm    
    MOUNTAINS_2x4_SW_NE(terrainGraphics, getTerrainMap([ETerrain.MOUNTAIN_BASIC]), "mountains/basic_range4", "base2", 26); // Mm    
    MOUNTAINS_1x3_NW_SE(terrainGraphics, getTerrainMap([ETerrain.MOUNTAIN_BASIC]), "mountains/basic_range1", "base2", 20); // Mm    
    MOUNTAINS_1x3_SW_NE(terrainGraphics, getTerrainMap([ETerrain.MOUNTAIN_BASIC]), "mountains/basic_range2", "base2", 20); // Mm    
    MOUNTAINS_2x2(terrainGraphics, getTerrainMap([ETerrain.MOUNTAIN_BASIC]), "mountains/basic5", "base2", 40); // Mm    
    MOUNTAINS_2x2(terrainGraphics, getTerrainMap([ETerrain.MOUNTAIN_BASIC]), "mountains/basic6", "base2", 30); // Mm    

    MOUNTAIN_SINGLE_RANDOM(terrainGraphics, getTerrainMap([ETerrain.MOUNTAIN_BASIC]), "mountains/basic", "base2"); // Mm

    OVERLAY_RESTRICTED3_PLFB(terrainGraphics, 
      getTerrainMap([ETerrain.MOUNTAIN_DRY]),
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL]),
    "mountains/dry-castle-n", { flag: "base2" });
    OVERLAY_ROTATION_RESTRICTED2_PLFB(terrainGraphics, 
      getTerrainMap([ETerrain.MOUNTAIN_DRY]),
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL]),
    "mountains/dry-castle", { flag: "base2" });
    OVERLAY_ROTATION_RESTRICTED_PLFB(terrainGraphics, 
      getTerrainMap([ETerrain.MOUNTAIN_DRY]),
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL]),
    "mountains/dry-castle", { flag: "base2" });

    MOUNTAINS_2x4_NW_SE(terrainGraphics, getTerrainMap([ETerrain.MOUNTAIN_DRY]), "mountains/dry_range3", "base2", 18); // Md    
    MOUNTAINS_2x4_SW_NE(terrainGraphics, getTerrainMap([ETerrain.MOUNTAIN_DRY]), "mountains/dry_range4", "base2", 26); // Md    
    MOUNTAINS_1x3_NW_SE(terrainGraphics, getTerrainMap([ETerrain.MOUNTAIN_DRY]), "mountains/dry_range1", "base2", 20); // Md
    MOUNTAINS_1x3_SW_NE(terrainGraphics, getTerrainMap([ETerrain.MOUNTAIN_DRY]), "mountains/dry_range2", "base2", 20); // Md       
    MOUNTAINS_2x2(terrainGraphics, getTerrainMap([ETerrain.MOUNTAIN_DRY]), "mountains/dry5", "base2", 40); // Md
    MOUNTAINS_2x2(terrainGraphics, getTerrainMap([ETerrain.MOUNTAIN_DRY]), "mountains/dry6", "base2", 30); // Md

    MOUNTAIN_SINGLE_RANDOM(terrainGraphics, getTerrainMap([ETerrain.MOUNTAIN_DRY]), "mountains/dry", "base2"); // Md


    OVERLAY_COMPLETE_LFB(terrainGraphics, 
      getTerrainMap([ETerrain.MOUNTAIN_VOLCANO]),
      getTerrainMap([]), "mountains/volcano", { flag: "base2" }); // Mv

    MOUNTAINS_2x2(terrainGraphics, getTerrainMap([ETerrain.MOUNTAIN_SNOW]), "mountains/snow5", "base2", 15); // Ms
    MOUNTAINS_2x2(terrainGraphics, getTerrainMap([ETerrain.MOUNTAIN_SNOW]), "mountains/snow6", "base2", 20); // Ms
    MOUNTAIN_SINGLE_RANDOM(terrainGraphics, getTerrainMap([ETerrain.MOUNTAIN_SNOW]), "mountains/snow", "base2"); // Ms


    // fillers for mountains
    TERRAIN_BASE_RANDOM_LFB(terrainGraphics, getTerrainMap([ETerrain.MOUNTAIN_BASIC]), "hills/regular", {});
    TERRAIN_BASE_RANDOM_LFB(terrainGraphics, getTerrainMap([ETerrain.MOUNTAIN_DRY]), "hills/dry", {});
    TERRAIN_BASE_RANDOM_LFB(terrainGraphics, getTerrainMap([ETerrain.MOUNTAIN_SNOW]), "hills/snow", {});


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

    TERRAIN_BASE_RANDOM_LFB(terrainGraphics, getTerrainMap([ETerrain.SAND_DESERT]), "sand/desert", {}); // Hhd
    TERRAIN_BASE_RANDOM_LFB(terrainGraphics, getTerrainMap([ETerrain.SAND_BEACH]), "sand/beach", {}); // Hhd

    TERRAIN_BASE_RANDOM_LFB(terrainGraphics, getTerrainMap([ETerrain.FROZEN_SNOW]), "frozen/snow", {}); // Aa

    TERRAIN_BASE_RANDOM_LFB(terrainGraphics, getTerrainMap([ETerrain.FROZEN_ICE]), "frozen/ice2", { prob: 10 }); // Ai
    TERRAIN_BASE_RANDOM_LFB(terrainGraphics, getTerrainMap([ETerrain.FROZEN_ICE]), "frozen/ice3", { prob: 11 }); // Ai
    TERRAIN_BASE_RANDOM_LFB(terrainGraphics, getTerrainMap([ETerrain.FROZEN_ICE]), "frozen/ice5", { prob: 13 }); // Ai
    TERRAIN_BASE_RANDOM_LFB(terrainGraphics, getTerrainMap([ETerrain.FROZEN_ICE]), "frozen/ice6", { prob: 14 }); // Ai
    TERRAIN_BASE_RANDOM_LFB(terrainGraphics, getTerrainMap([ETerrain.FROZEN_ICE]), "frozen/ice6", { prob: 42 }); // Ai
    TERRAIN_BASE_PLFB(terrainGraphics, getTerrainMap([ETerrain.FROZEN_ICE]), "frozen/ice5", {}); // Hhd

    TERRAIN_BASE_RANDOM_LFB(terrainGraphics, getTerrainMap([ETerrain.SWAMP_MUD]), "swamp/mud", {}); // Sm
    TERRAIN_BASE_PLFB(terrainGraphics, getTerrainMap([ETerrain.SWAMP_WATER]), "swamp/water-plant@V", { prob: 33}); // Sm
    TERRAIN_BASE_RANDOM_LFB(terrainGraphics, getTerrainMap([ETerrain.SWAMP_WATER]), "swamp/water", {}); // Sm

    TERRAIN_BASE_SINGLEHEX_PLFB(terrainGraphics, getTerrainMap([ETerrain.WATER_OCEAN]), "water/ocean", {
      builder: IB_ANIMATION_15_SLOW
    }); // Wo

    TERRAIN_BASE_SINGLEHEX_PLFB(terrainGraphics, getTerrainMap([ETerrain.WATER_COAST_TROPICAL]), "water/coast-tropical", {
      builder: IB_ANIMATION_15
    }); // Wwt

    // transitions --------------------------

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.MOUNTAIN_DRY, ETerrain.MOUNTAIN_VOLCANO]), 
      swapTerrainTypes(getTerrainMap([ETerrain.MOUNTAIN_DRY, ETerrain.HILLS_DRY, ETerrain.MOUNTAIN_VOLCANO, 
        ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.SWAMP_WATER, ETerrain. SWAMP_MUD])),
      "mountains/dry", { layer: -166 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.HILLS_DRY, ETerrain.HILLS_DESERT, ETerrain.GRASS_DRY, ETerrain.HILLS_SNOW,
        ETerrain.SAND_DESERT, ETerrain.SAND_BEACH, ETerrain.FROZEN_ICE, ETerrain.FROZEN_SNOW]), 
      getTerrainMap([ETerrain.MOUNTAIN_BASIC]), 
      "mountains/blend-from-dry", { layer: 0, flag: "inside" });    

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.HILLS_DRY, ETerrain.HILLS_DESERT, ETerrain.GRASS_DRY,
        ETerrain.SAND_DESERT, ETerrain.SAND_BEACH]), 
      getTerrainMap([ETerrain.MOUNTAIN_SNOW]), 
      "mountains/blend-from-dry", { layer: 0, flag: "inside" });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.MOUNTAIN_BASIC]), 
      getTerrainMap([ETerrain.HILLS_DRY, ETerrain.HILLS_DESERT, ETerrain.GRASS_DRY, ETerrain.HILLS_SNOW,
        ETerrain.SAND_DESERT, ETerrain.SAND_BEACH, ETerrain.FROZEN_ICE, ETerrain.FROZEN_SNOW]), 
      "hills/dry", { layer: -166 })

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.MOUNTAIN_SNOW]), 
      getTerrainMap([ETerrain.HILLS_DRY, ETerrain.HILLS_DESERT, ETerrain.GRASS_DRY, ETerrain.SAND_DESERT, ETerrain.SAND_BEACH]), 
      "hills/dry", { layer: -166 })

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.HILLS_SNOW, ETerrain.MOUNTAIN_SNOW]), getTerrainMap([ETerrain.HILLS_DRY, ETerrain.HILLS_REGULAR]), 
      "hills/snow-to-hills", { layer: -170 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.HILLS_SNOW, ETerrain.MOUNTAIN_SNOW]), 
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.SWAMP_WATER, ETerrain.SWAMP_MUD]), 
      "hills/snow-to-water", { layer: -171 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.HILLS_SNOW, ETerrain.MOUNTAIN_SNOW]), getTerrainMap([
        ETerrain.HILLS_DESERT, ETerrain.GRASS_DRY, ETerrain.GRASS_SEMI_DRY, ETerrain.GRASS_GREEN, ETerrain.GRASS_LEAF_LITTER,
        ETerrain.SAND_DESERT, ETerrain.SAND_BEACH, ETerrain.FROZEN_ICE, ETerrain.FROZEN_SNOW, ETerrain.MOUNTAIN_VOLCANO]), 
      "hills/snow", { layer: -172 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.HILLS_REGULAR, ETerrain.MOUNTAIN_BASIC]), 
      swapTerrainTypes(getTerrainMap([ETerrain.HILLS_REGULAR, ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL,
        ETerrain.SWAMP_MUD, ETerrain.SWAMP_WATER])),      
      "hills/regular", {layer: -180 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.HILLS_DRY]), 
      swapTerrainTypes(getTerrainMap([ETerrain.HILLS_DRY, ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL,
        ETerrain.SWAMP_MUD, ETerrain.SWAMP_WATER])),      
      "hills/dry", {layer: -183 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.HILLS_DESERT]), 
      swapTerrainTypes(getTerrainMap([ETerrain.HILLS_DESERT, ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL])),      
      "hills/desert", {layer: -184 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.SWAMP_WATER]), 
      swapTerrainTypes(getTerrainMap([ETerrain.SWAMP_WATER, 
        ETerrain.HILLS_DESERT, ETerrain.HILLS_DRY, ETerrain.HILLS_REGULAR, ETerrain.HILLS_SNOW, 
        ETerrain.MOUNTAIN_SNOW, ETerrain.MOUNTAIN_BASIC, ETerrain.MOUNTAIN_DRY,
        ETerrain.FROZEN_SNOW, ETerrain.FROZEN_ICE])),      
      "swamp/water", {layer: -230 });


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
      getTerrainMap([ETerrain.GRASS_SEMI_DRY]), getTerrainMap([ETerrain.SAND_DESERT, ETerrain.SAND_BEACH, ETerrain.FROZEN_SNOW, ETerrain.FROZEN_SNOW]), 
      "grass/semi-dry-medium", { layer: -260 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.GRASS_GREEN]), getTerrainMap([ETerrain.SAND_DESERT, ETerrain.SAND_BEACH, ETerrain.FROZEN_SNOW, ETerrain.FROZEN_SNOW]), 
      "grass/green-medium", { layer: -261 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.GRASS_DRY]), getTerrainMap([ETerrain.SAND_DESERT, ETerrain.SAND_BEACH, ETerrain.FROZEN_SNOW, ETerrain.FROZEN_SNOW]), 
      "grass/dry-medium", {layer: -262 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.GRASS_LEAF_LITTER]), 
      getTerrainMap([ETerrain.MOUNTAIN_SNOW, ETerrain.MOUNTAIN_BASIC, ETerrain.MOUNTAIN_DRY,
        ETerrain.GRASS_DRY, ETerrain.GRASS_GREEN, ETerrain.GRASS_SEMI_DRY, ETerrain.SWAMP_MUD,
        ETerrain.SAND_DESERT, ETerrain.SAND_BEACH, ETerrain.FROZEN_SNOW, ETerrain.MOUNTAIN_VOLCANO]), 
      "grass/leaf-litter", {layer: -270 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.GRASS_GREEN]), 
      getTerrainMap([ETerrain.MOUNTAIN_DRY, ETerrain.WATER_COAST_TROPICAL, ETerrain.FROZEN_ICE, 
        ETerrain.WATER_OCEAN, ETerrain.MOUNTAIN_VOLCANO, ETerrain.SWAMP_MUD]), 
      "grass/green-abrupt", {layer: -271 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.GRASS_SEMI_DRY]), 
      getTerrainMap([ETerrain.WATER_COAST_TROPICAL, ETerrain.WATER_OCEAN, ETerrain.FROZEN_ICE, ETerrain.SWAMP_MUD,
        ETerrain.MOUNTAIN_SNOW, ETerrain.MOUNTAIN_BASIC, ETerrain.MOUNTAIN_DRY, ETerrain.MOUNTAIN_VOLCANO]), 
      "grass/semi-dry-abrupt", { layer: -272 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.GRASS_DRY]), 
      getTerrainMap([ETerrain.WATER_COAST_TROPICAL, ETerrain.WATER_OCEAN, ETerrain.FROZEN_ICE, ETerrain.SWAMP_MUD, 
        ETerrain.MOUNTAIN_SNOW, ETerrain.MOUNTAIN_BASIC, ETerrain.MOUNTAIN_DRY, ETerrain.MOUNTAIN_VOLCANO]), 
      "grass/dry-abrupt", { layer: -273 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.FROZEN_SNOW]), 
      getTerrainMap([ETerrain.WATER_COAST_TROPICAL, ETerrain.WATER_OCEAN, ETerrain.SWAMP_WATER]), 
      "frozen/snow-to-water", { layer: -280 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.FROZEN_SNOW]), 
      swapTerrainTypes(getTerrainMap([ETerrain.FROZEN_SNOW])), 
      "frozen/snow", { layer: -281 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.FROZEN_ICE]), 
      getTerrainMap([ETerrain.GRASS_LEAF_LITTER]), 
      "flat/bank", { layer: -300 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.SWAMP_MUD]), 
      getTerrainMap([ETerrain.SAND_BEACH, ETerrain.SAND_DESERT]), 
      "swamp/mud-to-land", { layer: -310 });

    NEW_WAVES(terrainGraphics,
      getTerrainMap([ETerrain.HILLS_DESERT, ETerrain.SAND_DESERT, ETerrain.SAND_BEACH]), 
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL]), 
      -499, "water/waves");

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.SAND_BEACH]), 
      swapTerrainTypes(getTerrainMap([ETerrain.SAND_BEACH,
        ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.FROZEN_ICE,
        ETerrain.SWAMP_MUD, ETerrain.SWAMP_WATER])), 
      "sand/beach", { layer: -510 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.SAND_DESERT]), 
      swapTerrainTypes(getTerrainMap([ETerrain.SAND_DESERT,
        ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.FROZEN_ICE,
        ETerrain.SWAMP_MUD, ETerrain.SWAMP_WATER])), 
      "sand/desert", { layer: -510 });    

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.HILLS_REGULAR, ETerrain.MOUNTAIN_BASIC]), 
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.FROZEN_ICE,
        ETerrain.SWAMP_MUD, ETerrain.SWAMP_WATER]), 
      "hills/regular-to-water", { layer: -482, flag: "non_submerged" });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.HILLS_DRY, ETerrain.MOUNTAIN_DRY, ETerrain.MOUNTAIN_VOLCANO]), 
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.FROZEN_ICE,
        ETerrain.SWAMP_MUD, ETerrain.SWAMP_WATER]), 
      "hills/dry-to-water", { layer: -482, flag: "non_submerged" });    

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.GRASS_DRY, ETerrain.GRASS_GREEN, ETerrain.GRASS_LEAF_LITTER, ETerrain.GRASS_SEMI_DRY]), 
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.FROZEN_ICE]), 
      "flat/bank-to-ice", { layer: -483, flag: "non_submerged" });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.FROZEN_ICE, ETerrain.FROZEN_SNOW]), 
      getTerrainMap([ETerrain.SAND_DESERT, ETerrain.SAND_BEACH]), 
      "frozen/ice", { layer: -485, flag: "non_submerged" }); 

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.HILLS_SNOW, ETerrain.MOUNTAIN_SNOW, ETerrain.FROZEN_ICE, ETerrain.FROZEN_SNOW]), 
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.SWAMP_MUD, ETerrain.SWAMP_WATER]), 
      "frozen/ice", { layer: -485, flag: "non_submerged" }); 

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.HILLS_SNOW, ETerrain.MOUNTAIN_SNOW, ETerrain.FROZEN_ICE, ETerrain.FROZEN_SNOW]), 
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.SWAMP_MUD, ETerrain.SWAMP_WATER]), 
      "frozen/ice-to-water", { layer: -505, flag: "submerged" }); 

    // invisible transition
    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.HILLS_SNOW, ETerrain.MOUNTAIN_SNOW, ETerrain.FROZEN_ICE, ETerrain.FROZEN_SNOW]), 
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.SWAMP_WATER]), 
      "frozen/ice-to-water", { layer: -1001}); 

    NEW_BEACH(terrainGraphics,
      getTerrainMap([ETerrain.HILLS_DESERT, ETerrain.SAND_DESERT, ETerrain.SAND_BEACH]), 
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL]), 
      "sand/shore");


    NEW_BEACH(terrainGraphics,
      getTerrainMap([ETerrain.GRASS_GREEN, ETerrain.GRASS_SEMI_DRY, ETerrain.GRASS_DRY, ETerrain.GRASS_LEAF_LITTER,
        ETerrain.HILLS_DESERT, ETerrain.HILLS_DRY, ETerrain.HILLS_REGULAR, ETerrain.HILLS_SNOW,
        ETerrain.MOUNTAIN_SNOW, ETerrain.MOUNTAIN_BASIC, ETerrain.MOUNTAIN_DRY, ETerrain.MOUNTAIN_VOLCANO]), 
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL]), 
      "flat/shore");

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.SWAMP_MUD]), 
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.SWAMP_WATER]), 
      "swamp/mud-long", { layer: -556}); 


    ANIMATED_WATER_15_TRANSITION(terrainGraphics,
      getTerrainMap([ETerrain.WATER_OCEAN]), 
      getTerrainMap([ETerrain.WATER_COAST_TROPICAL, ETerrain.SWAMP_WATER, ETerrain.SWAMP_MUD]), 
      "water/ocean-blend", -550);

    ANIMATED_WATER_15_TRANSITION(terrainGraphics,      
      getTerrainMap([ETerrain.WATER_COAST_TROPICAL]), 
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.SWAMP_WATER, ETerrain.SWAMP_MUD]), 
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

} 
