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

  var getOverlayMap = (overlays: EOverlay[]) => {
    var overlayList = new Map<EOverlay, boolean>();
    overlays.forEach(overlay => {
      overlayList.set(overlay, true);
    });
    return overlayList;
  }

  var setFlags = (rot: number, rotations: string[], hexPos: HexPos,
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
  }

  var checkFlags = (rot: number, rotations: string[], hexPos: HexPos, 
    set_no_flags: string[], set_no_flags_tg: string[],
    flags: Flags) => {

    var hexFlags = flags.get(hexPos.toString());

    var ok = true;

    // Check if all needed set_no_flags are in place      
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
    // we need to know coors of the leftmost hex.
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

        if (tile.type !== undefined && !tile.type.has(hex.terrain)) {
          return;
        }

        if (tile.overlay !== undefined && !tile.overlay.has(hex.overlay)) {
          return;
        }

        if (!checkFlags(rot, tg.rotations, hexPos,
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
        
            drawables.push(tg.builder.toDrawable(imgName, translatedPostfix, drawPos, img.layer, newBase)); 

          }
      }

      for (var i = 0; i < tg.tiles.length; i++) {
        var tile = tg.tiles[i];
        var rotHex = rotatePos(tile.q, tile.r, rot);
        var hexPos = new HexPos(dp.hex.q + rotHex.q, dp.hex.r + rotHex.r);        
        setFlags(rot, tg.rotations, hexPos,
          tile.set_no_flag, tg.set_no_flag, dp.flags);      
      }
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

  var addSparseForestMacro = (terrainGraphics: WMLTerrainGraphics[], overlay: EOverlay, imagestem: string) => {
    NEW_FOREST(terrainGraphics, 
      getTerrainMap([ETerrain.HILLS_DRY, ETerrain.HILLS_DESERT, ETerrain.HILLS_REGULAR, ETerrain.HILLS_SNOW,
      ETerrain.MOUNTAIN_SNOW, ETerrain.MOUNTAIN_DRY, ETerrain.MOUNTAIN_BASIC]),
      getOverlayMap([overlay]),
      getTerrainMap([ETerrain.ABYSS, ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.FROZEN_ICE,
        ETerrain.MOUNTAIN_BASIC, ETerrain.MOUNTAIN_DRY, ETerrain.MOUNTAIN_SNOW, ETerrain.MOUNTAIN_VOLCANO]),
      imagestem);
  }
  
  var addForestMacro = (terrainGraphics: WMLTerrainGraphics[], overlay: EOverlay, imagestem: string) => {
    NEW_FOREST(terrainGraphics, undefined,
      getOverlayMap([overlay]),
      getTerrainMap([ETerrain.ABYSS, ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.FROZEN_ICE,
        ETerrain.MOUNTAIN_BASIC, ETerrain.MOUNTAIN_DRY, ETerrain.MOUNTAIN_SNOW, ETerrain.MOUNTAIN_VOLCANO]),
      imagestem);
  }

  export var rebuild = (hexMap: HexMap) => {

    OVERLAY_COMPLETE_LFB(terrainGraphics, getTerrainMap([ETerrain.SWAMP_WATER]),
      getTerrainMap([ETerrain.HILLS_DESERT, ETerrain.HILLS_DRY, ETerrain.HILLS_REGULAR, ETerrain.HILLS_SNOW,
        ETerrain.MOUNTAIN_DRY, ETerrain.MOUNTAIN_DRY, ETerrain.MOUNTAIN_SNOW,
        ETerrain.FROZEN_ICE, ETerrain.FROZEN_SNOW]),
      "swamp/reed", {layer: -85, flag: "base2"});

    addSparseForestMacro(terrainGraphics, EOverlay.WOODS_PINE, "forest/pine-sparse");
    addForestMacro(terrainGraphics, EOverlay.WOODS_PINE, "forest/pine");

    addSparseForestMacro(terrainGraphics, EOverlay.SNOW_FOREST, "forest/snow-forest-sparse");
    addForestMacro(terrainGraphics, EOverlay.SNOW_FOREST, "forest/snow-forest");

    addSparseForestMacro(terrainGraphics, EOverlay.JUNGLE, "forest/tropical/jungle-sparse");
    addForestMacro(terrainGraphics, EOverlay.JUNGLE, "forest/tropical/jungle");

    addSparseForestMacro(terrainGraphics, EOverlay.PALM_DESERT, "forest/tropical/palm-desert-sparse");
    addForestMacro(terrainGraphics, EOverlay.PALM_DESERT, "forest/tropical/palm-desert");

    addSparseForestMacro(terrainGraphics, EOverlay.PALM_DESERT, "forest/tropical/palm-desert-sparse");
    addForestMacro(terrainGraphics, EOverlay.PALM_DESERT, "forest/tropical/palm-desert");

    addForestMacro(terrainGraphics, EOverlay.RAINFOREST, "forest/tropical/rainforest");  

    addSparseForestMacro(terrainGraphics, EOverlay.SAVANNA, "forest/tropical/savanna-sparse");
    addForestMacro(terrainGraphics, EOverlay.SAVANNA, "forest/tropical/savanna");

    addSparseForestMacro(terrainGraphics, EOverlay.DECIDUOUS_SUMMER, "forest/deciduous-summer-sparse");
    addForestMacro(terrainGraphics, EOverlay.DECIDUOUS_SUMMER, "forest/deciduous-summer");

    addSparseForestMacro(terrainGraphics, EOverlay.DECIDUOUS_FALL, "forest/deciduous-fall-sparse");
    addForestMacro(terrainGraphics, EOverlay.DECIDUOUS_FALL, "forest/deciduous-fall");

    addSparseForestMacro(terrainGraphics, EOverlay.DECIDUOUS_WINTER, "forest/deciduous-winter-sparse");
    addForestMacro(terrainGraphics, EOverlay.DECIDUOUS_WINTER, "forest/deciduous-winter");

    addSparseForestMacro(terrainGraphics, EOverlay.DECIDUOUS_WINTER_SNOW, "forest/deciduous-winter-snow-sparse");
    addForestMacro(terrainGraphics, EOverlay.DECIDUOUS_WINTER_SNOW, "forest/deciduous-winter-snow");

    addSparseForestMacro(terrainGraphics, EOverlay.MIXED_SUMMER, "forest/mixed-summer-sparse");
    addForestMacro(terrainGraphics, EOverlay.MIXED_SUMMER, "forest/mixed-summer");

    addSparseForestMacro(terrainGraphics, EOverlay.MIXED_FALL, "forest/mixed-fall-sparse");
    addForestMacro(terrainGraphics, EOverlay.MIXED_FALL, "forest/mixed-fall");

    addSparseForestMacro(terrainGraphics, EOverlay.MIXED_WINTER, "forest/mixed-winter-sparse");
    addForestMacro(terrainGraphics, EOverlay.MIXED_WINTER, "forest/mixed-winter");

    addSparseForestMacro(terrainGraphics, EOverlay.MIXED_WINTER_SNOW, "forest/mixed-winter-snow-sparse");
    addForestMacro(terrainGraphics, EOverlay.MIXED_WINTER_SNOW, "forest/mixed-winter-snow");

    addForestMacro(terrainGraphics, EOverlay.MUSHROOMS, "forest/mushrooms");

    OVERLAY_PLFB (terrainGraphics, undefined, getOverlayMap([EOverlay.OASIS]), "village/desert-oasis-1", {prob: 30});
    OVERLAY_PLFB (terrainGraphics, undefined, getOverlayMap([EOverlay.OASIS]), "village/desert-oasis-2", {prob: 43});
    OVERLAY_PLFB (terrainGraphics, undefined, getOverlayMap([EOverlay.OASIS]), "village/desert-oasis-3", {prob: 100});

    OVERLAY_RANDOM_LFB (terrainGraphics, undefined, getOverlayMap([EOverlay.DETRITUS]), "misc/detritus/detritusA", {});
    OVERLAY_RANDOM_LFB (terrainGraphics, undefined, getOverlayMap([EOverlay.TRASH]), "misc/detritus/trashA", {});
    OVERLAY_RANDOM_LFB (terrainGraphics, undefined, getOverlayMap([EOverlay.LITER]), "misc/detritus/liter", {});

    VOLCANO_2x2(terrainGraphics, 
      getTerrainMap([ETerrain.MOUNTAIN_VOLCANO]),
      getTerrainMap([ETerrain.MOUNTAIN_BASIC, ETerrain.MOUNTAIN_DRY]),
    "mountains/volcano6", "base2");

    OVERLAY_RESTRICTED3_PLFB(terrainGraphics, 
      getTerrainMap([ETerrain.MOUNTAIN_BASIC]),
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.ABYSS]),
    "mountains/basic-castle-n", { flag: "base2" });
    OVERLAY_ROTATION_RESTRICTED2_PLFB(terrainGraphics, 
      getTerrainMap([ETerrain.MOUNTAIN_BASIC]),
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.ABYSS]),
    "mountains/basic-castle", { flag: "base2" });
    OVERLAY_RESTRICTED2_PLFB(terrainGraphics, 
      getTerrainMap([ETerrain.MOUNTAIN_BASIC]),
      getTerrainMap([ETerrain.ABYSS]),
    "mountains/basic-castle-n", { flag: "base2" });    
    OVERLAY_ROTATION_RESTRICTED_PLFB(terrainGraphics, 
      getTerrainMap([ETerrain.MOUNTAIN_BASIC]),
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.ABYSS]),
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
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.ABYSS]),
    "mountains/dry-castle-n", { flag: "base2" });
    OVERLAY_ROTATION_RESTRICTED2_PLFB(terrainGraphics, 
      getTerrainMap([ETerrain.MOUNTAIN_DRY]),
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.ABYSS]),
    "mountains/dry-castle", { flag: "base2" });
    OVERLAY_RESTRICTED2_PLFB(terrainGraphics, 
      getTerrainMap([ETerrain.MOUNTAIN_DRY]),
      getTerrainMap([ETerrain.ABYSS]),
    "mountains/dry-castle-n", { flag: "base2" });     
    OVERLAY_ROTATION_RESTRICTED_PLFB(terrainGraphics, 
      getTerrainMap([ETerrain.MOUNTAIN_DRY]),
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.ABYSS]),
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
      getTerrainMap([ETerrain.ABYSS]), "mountains/volcano", { flag: "base2" }); // Mv

    MOUNTAINS_2x2(terrainGraphics, getTerrainMap([ETerrain.MOUNTAIN_SNOW]), "mountains/snow5", "base2", 15); // Ms
    MOUNTAINS_2x2(terrainGraphics, getTerrainMap([ETerrain.MOUNTAIN_SNOW]), "mountains/snow6", "base2", 20); // Ms
    MOUNTAIN_SINGLE_RANDOM(terrainGraphics, getTerrainMap([ETerrain.MOUNTAIN_SNOW]), "mountains/snow", "base2"); // Ms

    // villages

    NEW_VILLAGE(terrainGraphics, getTerrainMap([ETerrain.HILLS_DRY, ETerrain.HILLS_REGULAR]), getOverlayMap([EOverlay.VILLAGE_HUMAN]), "village/human-hills");
    NEW_VILLAGE(terrainGraphics, getTerrainMap([ETerrain.HILLS_SNOW]), getOverlayMap([EOverlay.VILLAGE_HUMAN]), "village/human-snow-hills");
    NEW_VILLAGE(terrainGraphics, getTerrainMap([ETerrain.HILLS_DRY, ETerrain.HILLS_REGULAR]), getOverlayMap([EOverlay.VILLAGE_HUMAN_RUIN]), "village/human-hills-ruin");

    NEW_VILLAGE(terrainGraphics, getTerrainMap([ETerrain.FROZEN_SNOW, ETerrain.FROZEN_ICE]), getOverlayMap([EOverlay.VILLAGE_HUMAN]), "village/human-snow");
    NEW_VILLAGE(terrainGraphics, undefined, getOverlayMap([EOverlay.VILLAGE_HUMAN]), "village/human");    
    NEW_VILLAGE(terrainGraphics, undefined, getOverlayMap([EOverlay.VILLAGE_HUMAN_RUIN]), "village/human-cottage-ruin");

    NEW_VILLAGE(terrainGraphics, undefined, getOverlayMap([EOverlay.VILLAGE_HUMAN_CITY]), "village/human-city");
    NEW_VILLAGE(terrainGraphics, getTerrainMap([ETerrain.FROZEN_SNOW, ETerrain.FROZEN_ICE, ETerrain.HILLS_SNOW]), getOverlayMap([EOverlay.VILLAGE_HUMAN_CITY]), "village/human-city-snow");
    NEW_VILLAGE(terrainGraphics, undefined, getOverlayMap([EOverlay.VILLAGE_HUMAN_CITY_RUIN]), "village/human-city-ruin");    

    NEW_VILLAGE(terrainGraphics, undefined, getOverlayMap([EOverlay.VILLAGE_TROPICAL]), "village/tropical-forest");

    NEW_VILLAGE(terrainGraphics, getTerrainMap([ETerrain.FROZEN_SNOW, ETerrain.FROZEN_ICE, ETerrain.HILLS_SNOW]), getOverlayMap([EOverlay.VILLAGE_HUT]), "village/hut-snow");
    NEW_VILLAGE(terrainGraphics, undefined, getOverlayMap([EOverlay.VILLAGE_LOG_CABIN]), "village/log-cabin");

    NEW_VILLAGE(terrainGraphics, getTerrainMap([ETerrain.FROZEN_SNOW, ETerrain.FROZEN_ICE, ETerrain.HILLS_SNOW]), getOverlayMap([EOverlay.VILLAGE_HUT]), "village/hut-snow");
    NEW_VILLAGE(terrainGraphics, undefined, getOverlayMap([EOverlay.VILLAGE_LOG_CABIN]), "village/log-cabin");

    NEW_VILLAGE(terrainGraphics, undefined, getOverlayMap([EOverlay.VILLAGE_CAMP]), "village/camp");

    NEW_VILLAGE(terrainGraphics, undefined, getOverlayMap([EOverlay.VILLAGE_IGLOO]), "village/igloo");

    NEW_VILLAGE(terrainGraphics, undefined, getOverlayMap([EOverlay.VILLAGE_ORC]), "village/orc");

    NEW_VILLAGE(terrainGraphics, getTerrainMap([ETerrain.FROZEN_SNOW, ETerrain.FROZEN_ICE, ETerrain.HILLS_SNOW]), getOverlayMap([EOverlay.VILLAGE_ELVEN]), "village/elven-snow");
    NEW_VILLAGE(terrainGraphics, undefined, getOverlayMap([EOverlay.VILLAGE_ELVEN]), "village/elven");    

    NEW_VILLAGE(terrainGraphics, undefined, getOverlayMap([EOverlay.VILLAGE_DESERT]), "village/desert");
    NEW_VILLAGE(terrainGraphics, undefined, getOverlayMap([EOverlay.VILLAGE_DESERT_CAMP]), "village/desert-camp");

    NEW_VILLAGE(terrainGraphics, undefined, getOverlayMap([EOverlay.VILLAGE_DWARVEN]), "village/dwarven");

    NEW_VILLAGE(terrainGraphics, undefined, getOverlayMap([EOverlay.VILLAGE_SWAMP]), "village/swampwater");

    NEW_VILLAGE(terrainGraphics, undefined, getOverlayMap([EOverlay.VILLAGE_COAST]), "village/coast");
    OVERLAY_RANDOM_LFB(terrainGraphics, undefined, 
      getOverlayMap([EOverlay.FARM_VEGS]), "embellishments/farm-veg-spring", {layer: -81});

    OVERLAY_RANDOM_LFB(terrainGraphics, undefined, 
      getOverlayMap([EOverlay.FLOWERS_MIXED]), "embellishments/flowers-mixed", {layer: -500});

    OVERLAY_RANDOM_LFB(terrainGraphics, undefined, 
      getOverlayMap([EOverlay.RUBBLE]), "misc/rubble", {layer: -1});

    OVERLAY_RANDOM_LFB(terrainGraphics, undefined, 
      getOverlayMap([EOverlay.STONES_SMALL]), "embellishments/stones-small", {});    

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

    TERRAIN_BASE_RANDOM_LFB(terrainGraphics, getTerrainMap([ETerrain.ABYSS]), "chasm/abyss", {}); // Ha

    TERRAIN_BASE_RANDOM_LFB(terrainGraphics, getTerrainMap([ETerrain.SAND_DESERT]), "sand/desert", {}); // Hhd
    TERRAIN_BASE_RANDOM_LFB(terrainGraphics, getTerrainMap([ETerrain.SAND_BEACH]), "sand/beach", {}); // Hhd

    TERRAIN_BASE_RANDOM_LFB(terrainGraphics, getTerrainMap([ETerrain.FROZEN_SNOW]), "frozen/snow", {}); // Aa

    TERRAIN_BASE_RANDOM_LFB(terrainGraphics, getTerrainMap([ETerrain.FROZEN_ICE]), "frozen/ice2", { prob: 10 }); // Ai
    TERRAIN_BASE_RANDOM_LFB(terrainGraphics, getTerrainMap([ETerrain.FROZEN_ICE]), "frozen/ice3", { prob: 11 }); // Ai
    TERRAIN_BASE_RANDOM_LFB(terrainGraphics, getTerrainMap([ETerrain.FROZEN_ICE]), "frozen/ice5", { prob: 13 }); // Ai
    TERRAIN_BASE_RANDOM_LFB(terrainGraphics, getTerrainMap([ETerrain.FROZEN_ICE]), "frozen/ice6", { prob: 14 }); // Ai
    TERRAIN_BASE_RANDOM_LFB(terrainGraphics, getTerrainMap([ETerrain.FROZEN_ICE]), "frozen/ice4", { prob: 42 }); // Ai
    TERRAIN_BASE_PLFB(terrainGraphics, getTerrainMap([ETerrain.FROZEN_ICE]), "frozen/ice", {}); // Hhd

    TERRAIN_BASE_RANDOM_LFB(terrainGraphics, getTerrainMap([ETerrain.SWAMP_MUD]), "swamp/mud", {}); // Sm
    TERRAIN_BASE_PLFB(terrainGraphics, getTerrainMap([ETerrain.SWAMP_WATER]), "swamp/water-plant@V", { prob: 33}); // Sm
    TERRAIN_BASE_RANDOM_LFB(terrainGraphics, getTerrainMap([ETerrain.SWAMP_WATER]), "swamp/water", {}); // Sm

    TERRAIN_BASE_SINGLEHEX_PLFB(terrainGraphics, getTerrainMap([ETerrain.WATER_OCEAN]), "water/ocean", {
      builder: IB_ANIMATION_15_SLOW
    }); // Wo

    TERRAIN_BASE_SINGLEHEX_PLFB(terrainGraphics, getTerrainMap([ETerrain.WATER_COAST_TROPICAL]), "water/coast-tropical", {
      builder: IB_ANIMATION_15
    }); // Wwt

    TERRAIN_BASE_PLFB(terrainGraphics, getTerrainMap([ETerrain.VOID]), "void/void", {layer: 1000});

    // chasms transitions

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.ABYSS]), 
      getTerrainMap([ETerrain.MOUNTAIN_DRY, ETerrain.MOUNTAIN_BASIC, ETerrain.MOUNTAIN_SNOW, ETerrain.MOUNTAIN_VOLCANO]),
      "mountains/blend-from-chasm", { layer: 2, flag: "transition3" });

    WALL_TRANSITION_PLFB(terrainGraphics,
      getTerrainMap([ETerrain.ABYSS]), 
      getTerrainMap([ETerrain.FROZEN_ICE, ETerrain.FROZEN_SNOW, ETerrain.MOUNTAIN_SNOW, ETerrain.HILLS_SNOW]),
      "chasm/regular-snow", { layer: -90, flag: "ground" });

    WALL_TRANSITION_PLFB(terrainGraphics,
      getTerrainMap([ETerrain.ABYSS]), 
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.SWAMP_WATER, ETerrain.SWAMP_MUD]),
      "chasm/water", { layer: -90, flag: "ground" });

    WALL_TRANSITION_PLFB(terrainGraphics,
      getTerrainMap([ETerrain.ABYSS]), 
      swapTerrainTypes(getTerrainMap([ETerrain.ABYSS])),
      "chasm/regular", { layer: -90, flag: "ground" });          

    // transitions --------------------------

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.MOUNTAIN_DRY, ETerrain.MOUNTAIN_VOLCANO]), 
      swapTerrainTypes(getTerrainMap([ETerrain.MOUNTAIN_DRY, ETerrain.HILLS_DRY, ETerrain.MOUNTAIN_VOLCANO, 
        ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.SWAMP_WATER, ETerrain. SWAMP_MUD, ETerrain.ABYSS])),
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
        ETerrain.SWAMP_MUD, ETerrain.SWAMP_WATER, ETerrain.ABYSS])),      
      "hills/regular", {layer: -180 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.HILLS_DRY]), 
      swapTerrainTypes(getTerrainMap([ETerrain.HILLS_DRY, ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL,
        ETerrain.SWAMP_MUD, ETerrain.SWAMP_WATER])),      
      "hills/dry", {layer: -183 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.HILLS_DESERT]), 
      swapTerrainTypes(getTerrainMap([ETerrain.HILLS_DESERT, ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.ABYSS])),      
      "hills/desert", {layer: -184 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.SWAMP_WATER]), 
      swapTerrainTypes(getTerrainMap([ETerrain.SWAMP_WATER, 
        ETerrain.HILLS_DESERT, ETerrain.HILLS_DRY, ETerrain.HILLS_REGULAR, ETerrain.HILLS_SNOW, 
        ETerrain.MOUNTAIN_SNOW, ETerrain.MOUNTAIN_BASIC, ETerrain.MOUNTAIN_DRY,
        ETerrain.FROZEN_SNOW, ETerrain.FROZEN_ICE, ETerrain.ABYSS])),      
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
      swapTerrainTypes(getTerrainMap([ETerrain.FROZEN_SNOW, ETerrain.ABYSS])), 
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
        ETerrain.SWAMP_MUD, ETerrain.SWAMP_WATER, ETerrain.ABYSS])), 
      "sand/beach", { layer: -510 });

    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.SAND_DESERT]), 
      swapTerrainTypes(getTerrainMap([ETerrain.SAND_DESERT,
        ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.FROZEN_ICE,
        ETerrain.SWAMP_MUD, ETerrain.SWAMP_WATER, ETerrain.ABYSS])), 
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


    TRANSITION_COMPLETE_LFB(terrainGraphics,
      getTerrainMap([ETerrain.VOID]), swapTerrainTypes(getTerrainMap([])),
      "void/void", { layer: 1000});

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
