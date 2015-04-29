module WesnothTiles {
  'use strict';


  var getTerrainMap = (terrains: ETerrain[]) => {
    var terrainList = new Map<ETerrain, boolean>();
    terrains.forEach(terrain => {
      terrainList.set(terrain, true);
    });
    return terrainList;
  }

  var addSparseForestMacro = (tgGroup: TgGroup, overlay: ETerrain, imagestem: string) => {
    NEW_FOREST(tgGroup, 
      getTerrainMap([ETerrain.HILLS_DRY, ETerrain.HILLS_DESERT, ETerrain.HILLS_REGULAR, ETerrain.HILLS_SNOW,
      ETerrain.MOUNTAIN_SNOW, ETerrain.MOUNTAIN_DRY, ETerrain.MOUNTAIN_BASIC]),
      getTerrainMap([overlay]),
      getTerrainMap([ETerrain.ABYSS, ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.FROZEN_ICE,
        ETerrain.MOUNTAIN_BASIC, ETerrain.MOUNTAIN_DRY, ETerrain.MOUNTAIN_SNOW, ETerrain.MOUNTAIN_VOLCANO]),
      imagestem);
  }
  
  var addForestMacro = (tgGroup: TgGroup, overlay: ETerrain, imagestem: string) => {
    NEW_FOREST(tgGroup, undefined,
      getTerrainMap([overlay]),
      getTerrainMap([ETerrain.ABYSS, ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.FROZEN_ICE,
        ETerrain.MOUNTAIN_BASIC, ETerrain.MOUNTAIN_DRY, ETerrain.MOUNTAIN_SNOW, ETerrain.MOUNTAIN_VOLCANO]),
      imagestem);
  }


  // Group of terrain graphics elements
  export class TgGroup {

    public tgs: WMLTerrainGraphics[] = [];

    constructor() {
      this.populateTgs();
    }

    // add terrain graphics
    addTg(tg: WMLTerrainGraphics) {
      var tile = tg.tiles[0];      
      if (tile.q !== 0 || tile.r !== 0) {
        console.error("One of the macros has improper first tile!", tg);        
        return;        
      }
      tg.hexes = new Map<string, Hex>();
      this.tgs.push(tg);        
    }

    private populateTgs() {
    OVERLAY_COMPLETE_LFB(this, getTerrainMap([ETerrain.SWAMP_WATER]),
      getTerrainMap([ETerrain.HILLS_DESERT, ETerrain.HILLS_DRY, ETerrain.HILLS_REGULAR, ETerrain.HILLS_SNOW,
        ETerrain.MOUNTAIN_DRY, ETerrain.MOUNTAIN_DRY, ETerrain.MOUNTAIN_SNOW,
        ETerrain.FROZEN_ICE, ETerrain.FROZEN_SNOW, ETerrain.ABYSS]),
      "swamp/reed", {layer: -85, flag: "base2"});

    addSparseForestMacro(this, ETerrain.WOODS_PINE, "forest/pine-sparse");
    addForestMacro(this, ETerrain.WOODS_PINE, "forest/pine");

    addSparseForestMacro(this, ETerrain.SNOW_FOREST, "forest/snow-forest-sparse");
    addForestMacro(this, ETerrain.SNOW_FOREST, "forest/snow-forest");

    addSparseForestMacro(this, ETerrain.JUNGLE, "forest/tropical/jungle-sparse");
    addForestMacro(this, ETerrain.JUNGLE, "forest/tropical/jungle");

    addSparseForestMacro(this, ETerrain.PALM_DESERT, "forest/tropical/palm-desert-sparse");
    addForestMacro(this, ETerrain.PALM_DESERT, "forest/tropical/palm-desert");

    addSparseForestMacro(this, ETerrain.PALM_DESERT, "forest/tropical/palm-desert-sparse");
    addForestMacro(this, ETerrain.PALM_DESERT, "forest/tropical/palm-desert");

    addForestMacro(this, ETerrain.RAINFOREST, "forest/tropical/rainforest");  

    addSparseForestMacro(this, ETerrain.SAVANNA, "forest/tropical/savanna-sparse");
    addForestMacro(this, ETerrain.SAVANNA, "forest/tropical/savanna");

    addSparseForestMacro(this, ETerrain.DECIDUOUS_SUMMER, "forest/deciduous-summer-sparse");
    addForestMacro(this, ETerrain.DECIDUOUS_SUMMER, "forest/deciduous-summer");

    addSparseForestMacro(this, ETerrain.DECIDUOUS_FALL, "forest/deciduous-fall-sparse");
    addForestMacro(this, ETerrain.DECIDUOUS_FALL, "forest/deciduous-fall");

    addSparseForestMacro(this, ETerrain.DECIDUOUS_WINTER, "forest/deciduous-winter-sparse");
    addForestMacro(this, ETerrain.DECIDUOUS_WINTER, "forest/deciduous-winter");

    addSparseForestMacro(this, ETerrain.DECIDUOUS_WINTER_SNOW, "forest/deciduous-winter-snow-sparse");
    addForestMacro(this, ETerrain.DECIDUOUS_WINTER_SNOW, "forest/deciduous-winter-snow");

    addSparseForestMacro(this, ETerrain.MIXED_SUMMER, "forest/mixed-summer-sparse");
    addForestMacro(this, ETerrain.MIXED_SUMMER, "forest/mixed-summer");

    addSparseForestMacro(this, ETerrain.MIXED_FALL, "forest/mixed-fall-sparse");
    addForestMacro(this, ETerrain.MIXED_FALL, "forest/mixed-fall");

    addSparseForestMacro(this, ETerrain.MIXED_WINTER, "forest/mixed-winter-sparse");
    addForestMacro(this, ETerrain.MIXED_WINTER, "forest/mixed-winter");

    addSparseForestMacro(this, ETerrain.MIXED_WINTER_SNOW, "forest/mixed-winter-snow-sparse");
    addForestMacro(this, ETerrain.MIXED_WINTER_SNOW, "forest/mixed-winter-snow");

    addForestMacro(this, ETerrain.MUSHROOMS, "forest/mushrooms");

    OVERLAY_PLFB (this, undefined, getTerrainMap([ETerrain.OASIS]), "village/desert-oasis-1", {prob: 30});
    OVERLAY_PLFB (this, undefined, getTerrainMap([ETerrain.OASIS]), "village/desert-oasis-2", {prob: 43});
    OVERLAY_PLFB (this, undefined, getTerrainMap([ETerrain.OASIS]), "village/desert-oasis-3", {prob: 100});

    OVERLAY_RANDOM_LFB (this, undefined, getTerrainMap([ETerrain.DETRITUS]), "misc/detritus/detritusA", {});
    OVERLAY_RANDOM_LFB (this, undefined, getTerrainMap([ETerrain.TRASH]), "misc/detritus/trashA", {});
    OVERLAY_RANDOM_LFB (this, undefined, getTerrainMap([ETerrain.LITER]), "misc/detritus/liter", {});

    VOLCANO_2x2(this, 
      getTerrainMap([ETerrain.MOUNTAIN_VOLCANO]),
      getTerrainMap([ETerrain.MOUNTAIN_BASIC, ETerrain.MOUNTAIN_DRY]),
    "mountains/volcano6", "base2");

    OVERLAY_RESTRICTED3_PLFB(this, 
      getTerrainMap([ETerrain.MOUNTAIN_BASIC]),
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.ABYSS]),
    "mountains/basic-castle-n", { flag: "base2" });
    OVERLAY_ROTATION_RESTRICTED2_PLFB(this, 
      getTerrainMap([ETerrain.MOUNTAIN_BASIC]),
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.ABYSS]),
    "mountains/basic-castle", { flag: "base2" });
    OVERLAY_RESTRICTED2_PLFB(this, 
      getTerrainMap([ETerrain.MOUNTAIN_BASIC]),
      getTerrainMap([ETerrain.ABYSS]),
    "mountains/basic-castle-n", { flag: "base2" });    
    OVERLAY_ROTATION_RESTRICTED_PLFB(this, 
      getTerrainMap([ETerrain.MOUNTAIN_BASIC]),
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.ABYSS]),
    "mountains/basic-castle", { flag: "base2" });

    MOUNTAINS_2x4_NW_SE(this, getTerrainMap([ETerrain.MOUNTAIN_BASIC]), "mountains/basic_range3", "base2", 18); // Mm    
    MOUNTAINS_2x4_SW_NE(this, getTerrainMap([ETerrain.MOUNTAIN_BASIC]), "mountains/basic_range4", "base2", 26); // Mm    
    MOUNTAINS_1x3_NW_SE(this, getTerrainMap([ETerrain.MOUNTAIN_BASIC]), "mountains/basic_range1", "base2", 20); // Mm    
    MOUNTAINS_1x3_SW_NE(this, getTerrainMap([ETerrain.MOUNTAIN_BASIC]), "mountains/basic_range2", "base2", 20); // Mm    
    MOUNTAINS_2x2(this, getTerrainMap([ETerrain.MOUNTAIN_BASIC]), "mountains/basic5", "base2", 40); // Mm    
    MOUNTAINS_2x2(this, getTerrainMap([ETerrain.MOUNTAIN_BASIC]), "mountains/basic6", "base2", 30); // Mm    

    MOUNTAIN_SINGLE_RANDOM(this, getTerrainMap([ETerrain.MOUNTAIN_BASIC]), "mountains/basic", "base2"); // Mm

    OVERLAY_RESTRICTED3_PLFB(this, 
      getTerrainMap([ETerrain.MOUNTAIN_DRY]),
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.ABYSS]),
    "mountains/dry-castle-n", { flag: "base2" });
    OVERLAY_ROTATION_RESTRICTED2_PLFB(this, 
      getTerrainMap([ETerrain.MOUNTAIN_DRY]),
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.ABYSS]),
    "mountains/dry-castle", { flag: "base2" });
    OVERLAY_RESTRICTED2_PLFB(this, 
      getTerrainMap([ETerrain.MOUNTAIN_DRY]),
      getTerrainMap([ETerrain.ABYSS]),
    "mountains/dry-castle-n", { flag: "base2" });     
    OVERLAY_ROTATION_RESTRICTED_PLFB(this, 
      getTerrainMap([ETerrain.MOUNTAIN_DRY]),
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.ABYSS]),
    "mountains/dry-castle", { flag: "base2" });

    MOUNTAINS_2x4_NW_SE(this, getTerrainMap([ETerrain.MOUNTAIN_DRY]), "mountains/dry_range3", "base2", 18); // Md    
    MOUNTAINS_2x4_SW_NE(this, getTerrainMap([ETerrain.MOUNTAIN_DRY]), "mountains/dry_range4", "base2", 26); // Md    
    MOUNTAINS_1x3_NW_SE(this, getTerrainMap([ETerrain.MOUNTAIN_DRY]), "mountains/dry_range1", "base2", 20); // Md
    MOUNTAINS_1x3_SW_NE(this, getTerrainMap([ETerrain.MOUNTAIN_DRY]), "mountains/dry_range2", "base2", 20); // Md       
    MOUNTAINS_2x2(this, getTerrainMap([ETerrain.MOUNTAIN_DRY]), "mountains/dry5", "base2", 40); // Md
    MOUNTAINS_2x2(this, getTerrainMap([ETerrain.MOUNTAIN_DRY]), "mountains/dry6", "base2", 30); // Md

    MOUNTAIN_SINGLE_RANDOM(this, getTerrainMap([ETerrain.MOUNTAIN_DRY]), "mountains/dry", "base2"); // Md


    OVERLAY_COMPLETE_LFB(this, 
      getTerrainMap([ETerrain.MOUNTAIN_VOLCANO]),
      getTerrainMap([ETerrain.ABYSS]), "mountains/volcano", { flag: "base2" }); // Mv

    MOUNTAINS_2x2(this, getTerrainMap([ETerrain.MOUNTAIN_SNOW]), "mountains/snow5", "base2", 15); // Ms
    MOUNTAINS_2x2(this, getTerrainMap([ETerrain.MOUNTAIN_SNOW]), "mountains/snow6", "base2", 20); // Ms
    MOUNTAIN_SINGLE_RANDOM(this, getTerrainMap([ETerrain.MOUNTAIN_SNOW]), "mountains/snow", "base2"); // Ms

    // villages

    NEW_VILLAGE(this, getTerrainMap([ETerrain.HILLS_DRY, ETerrain.HILLS_REGULAR]), getTerrainMap([ETerrain.VILLAGE_HUMAN]), "village/human-hills");
    NEW_VILLAGE(this, getTerrainMap([ETerrain.HILLS_SNOW]), getTerrainMap([ETerrain.VILLAGE_HUMAN]), "village/human-snow-hills");
    NEW_VILLAGE(this, getTerrainMap([ETerrain.HILLS_DRY, ETerrain.HILLS_REGULAR]), getTerrainMap([ETerrain.VILLAGE_HUMAN_RUIN]), "village/human-hills-ruin");

    NEW_VILLAGE(this, getTerrainMap([ETerrain.FROZEN_SNOW, ETerrain.FROZEN_ICE]), getTerrainMap([ETerrain.VILLAGE_HUMAN]), "village/human-snow");
    NEW_VILLAGE(this, undefined, getTerrainMap([ETerrain.VILLAGE_HUMAN]), "village/human");    
    NEW_VILLAGE(this, undefined, getTerrainMap([ETerrain.VILLAGE_HUMAN_RUIN]), "village/human-cottage-ruin");

    NEW_VILLAGE(this, undefined, getTerrainMap([ETerrain.VILLAGE_HUMAN_CITY]), "village/human-city");
    NEW_VILLAGE(this, getTerrainMap([ETerrain.FROZEN_SNOW, ETerrain.FROZEN_ICE, ETerrain.HILLS_SNOW]), getTerrainMap([ETerrain.VILLAGE_HUMAN_CITY]), "village/human-city-snow");
    NEW_VILLAGE(this, undefined, getTerrainMap([ETerrain.VILLAGE_HUMAN_CITY_RUIN]), "village/human-city-ruin");    

    NEW_VILLAGE(this, undefined, getTerrainMap([ETerrain.VILLAGE_TROPICAL]), "village/tropical-forest");

    NEW_VILLAGE(this, getTerrainMap([ETerrain.FROZEN_SNOW, ETerrain.FROZEN_ICE, ETerrain.HILLS_SNOW]), getTerrainMap([ETerrain.VILLAGE_HUT]), "village/hut-snow");
    NEW_VILLAGE(this, undefined, getTerrainMap([ETerrain.VILLAGE_LOG_CABIN]), "village/log-cabin");

    NEW_VILLAGE(this, getTerrainMap([ETerrain.FROZEN_SNOW, ETerrain.FROZEN_ICE, ETerrain.HILLS_SNOW]), getTerrainMap([ETerrain.VILLAGE_HUT]), "village/hut-snow");
    NEW_VILLAGE(this, undefined, getTerrainMap([ETerrain.VILLAGE_LOG_CABIN]), "village/log-cabin");

    NEW_VILLAGE(this, undefined, getTerrainMap([ETerrain.VILLAGE_CAMP]), "village/camp");

    NEW_VILLAGE(this, undefined, getTerrainMap([ETerrain.VILLAGE_IGLOO]), "village/igloo");

    NEW_VILLAGE(this, undefined, getTerrainMap([ETerrain.VILLAGE_ORC]), "village/orc");

    NEW_VILLAGE(this, getTerrainMap([ETerrain.FROZEN_SNOW, ETerrain.FROZEN_ICE, ETerrain.HILLS_SNOW]), getTerrainMap([ETerrain.VILLAGE_ELVEN]), "village/elven-snow");
    NEW_VILLAGE(this, undefined, getTerrainMap([ETerrain.VILLAGE_ELVEN]), "village/elven");    

    NEW_VILLAGE(this, undefined, getTerrainMap([ETerrain.VILLAGE_DESERT]), "village/desert");
    NEW_VILLAGE(this, undefined, getTerrainMap([ETerrain.VILLAGE_DESERT_CAMP]), "village/desert-camp");

    NEW_VILLAGE(this, undefined, getTerrainMap([ETerrain.VILLAGE_DWARVEN]), "village/dwarven");

    NEW_VILLAGE(this, undefined, getTerrainMap([ETerrain.VILLAGE_SWAMP]), "village/swampwater");

    NEW_VILLAGE(this, undefined, getTerrainMap([ETerrain.VILLAGE_COAST]), "village/coast");
    OVERLAY_RANDOM_LFB(this, undefined, 
      getTerrainMap([ETerrain.FARM_VEGS]), "embellishments/farm-veg-spring", {layer: -81});

    OVERLAY_RANDOM_LFB(this, undefined, 
      getTerrainMap([ETerrain.FLOWERS_MIXED]), "embellishments/flowers-mixed", {layer: -500});

    OVERLAY_RANDOM_LFB(this, undefined, 
      getTerrainMap([ETerrain.RUBBLE]), "misc/rubble", {layer: -1});

    OVERLAY_RANDOM_LFB(this, undefined, 
      getTerrainMap([ETerrain.STONES_SMALL]), "embellishments/stones-small", {});    

    // fillers for mountains
    TERRAIN_BASE_RANDOM_LFB(this, getTerrainMap([ETerrain.MOUNTAIN_BASIC]), "hills/regular", {});
    TERRAIN_BASE_RANDOM_LFB(this, getTerrainMap([ETerrain.MOUNTAIN_DRY]), "hills/dry", {});
    TERRAIN_BASE_RANDOM_LFB(this, getTerrainMap([ETerrain.MOUNTAIN_SNOW]), "hills/snow", {});


    TERRAIN_BASE_PLFB(this, getTerrainMap([ETerrain.GRASS_GREEN]), "grass/green", { prob: 20 });
    TERRAIN_BASE_RANDOM_LFB(this, getTerrainMap([ETerrain.GRASS_GREEN]), "grass/green", {});
    TERRAIN_BASE_PLFB(this, getTerrainMap([ETerrain.GRASS_DRY]), "grass/dry", { prob: 25 });
    TERRAIN_BASE_RANDOM_LFB(this, getTerrainMap([ETerrain.GRASS_DRY]), "grass/dry", {});
    TERRAIN_BASE_PLFB(this, getTerrainMap([ETerrain.GRASS_SEMI_DRY]), "grass/semi-dry", { prob: 25 });
    TERRAIN_BASE_RANDOM_LFB(this, getTerrainMap([ETerrain.GRASS_SEMI_DRY]), "grass/semi-dry", {});
    TERRAIN_BASE_RANDOM_LFB(this, getTerrainMap([ETerrain.GRASS_LEAF_LITTER]), "grass/leaf-litter", {});
    
    TERRAIN_BASE_RANDOM_LFB(this, getTerrainMap([ETerrain.HILLS_REGULAR]), "hills/regular", {}); // Hh
    TERRAIN_BASE_RANDOM_LFB(this, getTerrainMap([ETerrain.HILLS_DRY]), "hills/dry", {}); // Hhd
    TERRAIN_BASE_RANDOM_LFB(this, getTerrainMap([ETerrain.HILLS_DESERT]), "hills/desert", {}); // Hd
    TERRAIN_BASE_RANDOM_LFB(this, getTerrainMap([ETerrain.HILLS_SNOW]), "hills/snow", {}); // Ha

    TERRAIN_BASE_RANDOM_LFB(this, getTerrainMap([ETerrain.ABYSS]), "chasm/abyss", {}); // Ha

    TERRAIN_BASE_RANDOM_LFB(this, getTerrainMap([ETerrain.SAND_DESERT]), "sand/desert", {}); // Hhd
    TERRAIN_BASE_RANDOM_LFB(this, getTerrainMap([ETerrain.SAND_BEACH]), "sand/beach", {}); // Hhd

    TERRAIN_BASE_RANDOM_LFB(this, getTerrainMap([ETerrain.FROZEN_SNOW]), "frozen/snow", {}); // Aa

    TERRAIN_BASE_RANDOM_LFB(this, getTerrainMap([ETerrain.FROZEN_ICE]), "frozen/ice2", { prob: 10 }); // Ai
    TERRAIN_BASE_RANDOM_LFB(this, getTerrainMap([ETerrain.FROZEN_ICE]), "frozen/ice3", { prob: 11 }); // Ai
    TERRAIN_BASE_RANDOM_LFB(this, getTerrainMap([ETerrain.FROZEN_ICE]), "frozen/ice5", { prob: 13 }); // Ai
    TERRAIN_BASE_RANDOM_LFB(this, getTerrainMap([ETerrain.FROZEN_ICE]), "frozen/ice6", { prob: 14 }); // Ai
    TERRAIN_BASE_RANDOM_LFB(this, getTerrainMap([ETerrain.FROZEN_ICE]), "frozen/ice4", { prob: 42 }); // Ai
    TERRAIN_BASE_PLFB(this, getTerrainMap([ETerrain.FROZEN_ICE]), "frozen/ice", {}); // Hhd

    TERRAIN_BASE_RANDOM_LFB(this, getTerrainMap([ETerrain.SWAMP_MUD]), "swamp/mud", {}); // Sm
    TERRAIN_BASE_PLFB(this, getTerrainMap([ETerrain.SWAMP_WATER]), "swamp/water-plant@V", { prob: 33}); // Sm
    TERRAIN_BASE_RANDOM_LFB(this, getTerrainMap([ETerrain.SWAMP_WATER]), "swamp/water", {}); // Sm

    TERRAIN_BASE_PLFB(this, getTerrainMap([ETerrain.VOID]), "void/void", {layer: 1000});

    TERRAIN_BASE_SINGLEHEX_PLFB(this, getTerrainMap([ETerrain.WATER_OCEAN]), "water/ocean", {
      builder: IB_ANIMATION_15_SLOW
    }); // Wo

    TERRAIN_BASE_SINGLEHEX_PLFB(this, getTerrainMap([ETerrain.WATER_COAST_TROPICAL]), "water/coast-tropical", {
      builder: IB_ANIMATION_15
    }); // Wwt



    // chasms transitions

    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.ABYSS]), 
      getTerrainMap([ETerrain.MOUNTAIN_DRY, ETerrain.MOUNTAIN_BASIC, ETerrain.MOUNTAIN_SNOW, ETerrain.MOUNTAIN_VOLCANO]),
      "mountains/blend-from-chasm", { layer: 2, flag: "transition3" }, 1);

    WALL_TRANSITION_PLFB(this,
      getTerrainMap([ETerrain.ABYSS]), 
      getTerrainMap([ETerrain.FROZEN_ICE, ETerrain.FROZEN_SNOW, ETerrain.MOUNTAIN_SNOW, ETerrain.HILLS_SNOW]),
      "chasm/regular-snow", { layer: -90, flag: "ground" });

    WALL_TRANSITION_PLFB(this,
      getTerrainMap([ETerrain.ABYSS]), 
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.SWAMP_WATER, ETerrain.SWAMP_MUD]),
      "chasm/water", { layer: -90, flag: "ground" });

    WALL_TRANSITION_PLFB(this,
      getTerrainMap([ETerrain.ABYSS]), 
      swapTerrainTypes(getTerrainMap([ETerrain.ABYSS])),
      "chasm/regular", { layer: -90, flag: "ground" });          

    // transitions --------------------------

    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.MOUNTAIN_DRY, ETerrain.MOUNTAIN_VOLCANO]), 
      swapTerrainTypes(getTerrainMap([ETerrain.MOUNTAIN_DRY, ETerrain.HILLS_DRY, ETerrain.MOUNTAIN_VOLCANO, 
        ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.SWAMP_WATER, ETerrain. SWAMP_MUD, ETerrain.ABYSS])),
      "mountains/dry", { layer: -166 }, 1);

    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.HILLS_DRY, ETerrain.HILLS_DESERT, ETerrain.GRASS_DRY, ETerrain.HILLS_SNOW,
        ETerrain.SAND_DESERT, ETerrain.SAND_BEACH, ETerrain.FROZEN_ICE, ETerrain.FROZEN_SNOW]), 
      getTerrainMap([ETerrain.MOUNTAIN_BASIC]), 
      "mountains/blend-from-dry", { layer: 0, flag: "inside" }, 1);    

    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.HILLS_DRY, ETerrain.HILLS_DESERT, ETerrain.GRASS_DRY,
        ETerrain.SAND_DESERT, ETerrain.SAND_BEACH]), 
      getTerrainMap([ETerrain.MOUNTAIN_SNOW]), 
      "mountains/blend-from-dry", { layer: 0, flag: "inside" }, 1);

    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.MOUNTAIN_BASIC]), 
      getTerrainMap([ETerrain.HILLS_DRY, ETerrain.HILLS_DESERT, ETerrain.GRASS_DRY, ETerrain.HILLS_SNOW,
        ETerrain.SAND_DESERT, ETerrain.SAND_BEACH, ETerrain.FROZEN_ICE, ETerrain.FROZEN_SNOW]), 
      "hills/dry", { layer: -166 }, 2)

    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.MOUNTAIN_SNOW]), 
      getTerrainMap([ETerrain.HILLS_DRY, ETerrain.HILLS_DESERT, ETerrain.GRASS_DRY, 
        ETerrain.SAND_DESERT, ETerrain.SAND_BEACH]), 
      "hills/dry", { layer: -166 }, 2)

    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.HILLS_SNOW, ETerrain.MOUNTAIN_SNOW]), 
      getTerrainMap([ETerrain.HILLS_DRY, ETerrain.HILLS_REGULAR]), 
      "hills/snow-to-hills", { layer: -170 }, 2);

    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.HILLS_SNOW, ETerrain.MOUNTAIN_SNOW]), 
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.SWAMP_WATER, ETerrain.SWAMP_MUD]), 
      "hills/snow-to-water", { layer: -171 }, 2);

    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.HILLS_SNOW, ETerrain.MOUNTAIN_SNOW]), 
      getTerrainMap([
        ETerrain.HILLS_DESERT, ETerrain.GRASS_DRY, ETerrain.GRASS_SEMI_DRY, ETerrain.GRASS_GREEN, ETerrain.GRASS_LEAF_LITTER,
        ETerrain.SAND_DESERT, ETerrain.SAND_BEACH, ETerrain.FROZEN_ICE, ETerrain.FROZEN_SNOW, ETerrain.MOUNTAIN_VOLCANO]), 
      "hills/snow", { layer: -172 }, 2);

    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.HILLS_REGULAR, ETerrain.MOUNTAIN_BASIC]), 
      swapTerrainTypes(getTerrainMap([ETerrain.HILLS_REGULAR, ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL,
        ETerrain.SWAMP_MUD, ETerrain.SWAMP_WATER, ETerrain.ABYSS])),      
      "hills/regular", {layer: -180 }, 2);

    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.HILLS_DRY]), 
      swapTerrainTypes(getTerrainMap([ETerrain.HILLS_DRY, ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL,
        ETerrain.SWAMP_MUD, ETerrain.SWAMP_WATER, ETerrain.MOUNTAIN_SNOW])),      
      "hills/dry", {layer: -183 }, 2);

    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.HILLS_DESERT]), 
      swapTerrainTypes(getTerrainMap([ETerrain.HILLS_DESERT, ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.ABYSS,
        ETerrain.MOUNTAIN_DRY, ETerrain.MOUNTAIN_VOLCANO, ETerrain.MOUNTAIN_SNOW, ETerrain.MOUNTAIN_BASIC, ETerrain.HILLS_SNOW])),      
      "hills/desert", {layer: -184 }, 2);

    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.SWAMP_WATER]), 
      swapTerrainTypes(getTerrainMap([ETerrain.SWAMP_WATER, 
        ETerrain.HILLS_DESERT, ETerrain.HILLS_DRY, ETerrain.HILLS_REGULAR, ETerrain.HILLS_SNOW, 
        ETerrain.MOUNTAIN_SNOW, ETerrain.MOUNTAIN_BASIC, ETerrain.MOUNTAIN_DRY,
        ETerrain.FROZEN_SNOW, ETerrain.FROZEN_ICE, ETerrain.ABYSS])),      
      "swamp/water", {layer: -230 }, 3);


    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.GRASS_SEMI_DRY]), getTerrainMap([ETerrain.GRASS_GREEN, ETerrain.GRASS_DRY, ETerrain.GRASS_LEAF_LITTER]), 
      "grass/semi-dry-long", { flag: "inside", layer: -250 }, 1);

    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.GRASS_GREEN]), getTerrainMap([ETerrain.GRASS_SEMI_DRY, ETerrain.GRASS_DRY, ETerrain.GRASS_LEAF_LITTER]), 
      "grass/green-long", { flag: "inside", layer: -251 }, 1);

    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.GRASS_DRY]), getTerrainMap([ETerrain.GRASS_GREEN, ETerrain.GRASS_SEMI_DRY, ETerrain.GRASS_LEAF_LITTER]), 
      "grass/dry-long", { flag: "inside", layer: -252 }, 1);

    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.GRASS_LEAF_LITTER]), getTerrainMap([ETerrain.GRASS_GREEN, ETerrain.GRASS_SEMI_DRY, ETerrain.GRASS_DRY]), 
      "grass/leaf-litter-long", { flag: "inside", layer: -253 }, 1);

    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.GRASS_LEAF_LITTER]), 
      getTerrainMap([ETerrain.GRASS_GREEN, ETerrain.GRASS_SEMI_DRY, ETerrain.GRASS_DRY]), 
      "grass/leaf-litter-long", { layer: -254 }, 1);

    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.GRASS_DRY]), 
      getTerrainMap([ETerrain.GRASS_GREEN, ETerrain.GRASS_SEMI_DRY]), 
      "grass/dry-long", {layer: -255 }, 1);

    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.GRASS_GREEN]), 
      getTerrainMap([ETerrain.GRASS_SEMI_DRY]), 
      "grass/green-long", { layer: -256 }, 1);

    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.GRASS_SEMI_DRY]), 
      getTerrainMap([ETerrain.SAND_DESERT, ETerrain.SAND_BEACH, ETerrain.FROZEN_SNOW]), 
      "grass/semi-dry-medium", { layer: -260 }, 1);

    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.GRASS_GREEN]), 
      getTerrainMap([ETerrain.SAND_DESERT, ETerrain.SAND_BEACH, ETerrain.FROZEN_SNOW]), 
      "grass/green-medium", { layer: -261 }, 1);

    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.GRASS_DRY]), 
      getTerrainMap([ETerrain.SAND_DESERT, ETerrain.SAND_BEACH, ETerrain.FROZEN_SNOW]), 
      "grass/dry-medium", {layer: -262 }, 1);

    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.GRASS_LEAF_LITTER]), 
      getTerrainMap([ETerrain.SWAMP_MUD,
        ETerrain.SAND_DESERT, ETerrain.SAND_BEACH, ETerrain.FROZEN_SNOW]), 
      "grass/leaf-litter", {layer: -270 }, 3);

    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.GRASS_GREEN]), 
      getTerrainMap([ETerrain.MOUNTAIN_DRY, ETerrain.WATER_COAST_TROPICAL, ETerrain.FROZEN_ICE, ETerrain.SWAMP_MUD]), 
      "grass/green-abrupt", {layer: -271 }, 1);

    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.GRASS_SEMI_DRY]), 
      getTerrainMap([ETerrain.WATER_COAST_TROPICAL, ETerrain.WATER_OCEAN, ETerrain.FROZEN_ICE, ETerrain.SWAMP_MUD]), 
      "grass/semi-dry-abrupt", { layer: -272 }, 1);

    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.GRASS_DRY]), 
      getTerrainMap([ETerrain.WATER_COAST_TROPICAL, ETerrain.WATER_OCEAN, ETerrain.FROZEN_ICE, ETerrain.SWAMP_MUD]), 
      "grass/dry-abrupt", { layer: -273 }, 1);

    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.FROZEN_SNOW]), 
      getTerrainMap([ETerrain.WATER_COAST_TROPICAL, ETerrain.WATER_OCEAN, ETerrain.SWAMP_WATER]), 
      "frozen/snow-to-water", { layer: -280 }, 4);

    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.FROZEN_SNOW]), 
      swapTerrainTypes(getTerrainMap([ETerrain.FROZEN_SNOW, ETerrain.ABYSS,
        ETerrain.FROZEN_SNOW, ETerrain.ABYSS, ETerrain.MOUNTAIN_DRY, ETerrain.HILLS_DRY, ETerrain.HILLS_REGULAR,
        ETerrain.GRASS_DRY, ETerrain.GRASS_GREEN, ETerrain.GRASS_LEAF_LITTER, ETerrain.GRASS_SEMI_DRY,
        ETerrain.SWAMP_WATER, ETerrain.MOUNTAIN_BASIC, ETerrain.HILLS_SNOW, ETerrain.MOUNTAIN_SNOW,
        ETerrain.HILLS_DESERT, ETerrain.WATER_COAST_TROPICAL, ETerrain.WATER_OCEAN, ETerrain.MOUNTAIN_VOLCANO])), 
      "frozen/snow", { layer: -281 }, 4);

    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.FROZEN_ICE]), 
      getTerrainMap([ETerrain.GRASS_LEAF_LITTER]), 
      "flat/bank", { layer: -300 }, 1);

    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.SWAMP_MUD]), 
      getTerrainMap([ETerrain.SAND_BEACH, ETerrain.SAND_DESERT]), 
      "swamp/mud-to-land", { layer: -310 }, 1);

    NEW_WAVES(this,
      getTerrainMap([ETerrain.HILLS_DESERT, ETerrain.SAND_DESERT, ETerrain.SAND_BEACH]), 
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL]), 
      -499, "water/waves");

    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.SAND_BEACH]), 
      swapTerrainTypes(getTerrainMap([ETerrain.SAND_BEACH, ETerrain.HILLS_DRY,
        ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.FROZEN_ICE,
        ETerrain.SWAMP_MUD, ETerrain.SWAMP_WATER, ETerrain.ABYSS, ETerrain.HILLS_DESERT,
        ETerrain.GRASS_LEAF_LITTER, ETerrain.GRASS_SEMI_DRY, ETerrain.GRASS_DRY, ETerrain.GRASS_GREEN,
        ETerrain.MOUNTAIN_BASIC, ETerrain.MOUNTAIN_SNOW, ETerrain.HILLS_SNOW, ETerrain.HILLS_REGULAR, ETerrain.MOUNTAIN_BASIC,
        ETerrain.FROZEN_SNOW, ETerrain.SWAMP_MUD, ETerrain.MOUNTAIN_DRY, ETerrain.MOUNTAIN_VOLCANO])), 
      "sand/beach", { layer: -510 }, 6);

    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.SAND_DESERT]), 
      swapTerrainTypes(getTerrainMap([ETerrain.SAND_DESERT,
        ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.FROZEN_ICE, ETerrain.FROZEN_SNOW,
        ETerrain.SWAMP_MUD, ETerrain.SWAMP_WATER, ETerrain.ABYSS, 
        ETerrain.MOUNTAIN_BASIC, ETerrain.MOUNTAIN_SNOW, ETerrain.HILLS_SNOW, 
        ETerrain.HILLS_REGULAR, ETerrain.HILLS_DRY,ETerrain.HILLS_DESERT, 
        ETerrain.GRASS_SEMI_DRY, ETerrain.GRASS_DRY, ETerrain.GRASS_GREEN, ETerrain.GRASS_LEAF_LITTER,
        ETerrain.SWAMP_MUD, ETerrain.SAND_BEACH, ETerrain.MOUNTAIN_DRY, ETerrain.MOUNTAIN_VOLCANO])), 
      "sand/desert", { layer: -510 }, 6);    

    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.HILLS_REGULAR, ETerrain.MOUNTAIN_BASIC]), 
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.FROZEN_ICE,
        ETerrain.SWAMP_MUD, ETerrain.SWAMP_WATER]), 
      "hills/regular-to-water", { layer: -482, flag: "non_submerged" }, 2);

    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.HILLS_DRY, ETerrain.MOUNTAIN_DRY, ETerrain.MOUNTAIN_VOLCANO]), 
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.FROZEN_ICE,
        ETerrain.SWAMP_MUD, ETerrain.SWAMP_WATER]), 
      "hills/dry-to-water", { layer: -482, flag: "non_submerged" }, 2);    

    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.GRASS_DRY, ETerrain.GRASS_GREEN, ETerrain.GRASS_LEAF_LITTER, ETerrain.GRASS_SEMI_DRY]), 
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.FROZEN_ICE]), 
      "flat/bank-to-ice", { layer: -483, flag: "non_submerged" }, 2);

    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.FROZEN_ICE, ETerrain.FROZEN_SNOW]), 
      getTerrainMap([ETerrain.SAND_DESERT, ETerrain.SAND_BEACH]), 
      "frozen/ice", { layer: -485, flag: "non_submerged" }, 4); 

    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.HILLS_SNOW, ETerrain.MOUNTAIN_SNOW, ETerrain.FROZEN_ICE, ETerrain.FROZEN_SNOW]), 
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.SWAMP_MUD, ETerrain.SWAMP_WATER]), 
      "frozen/ice", { layer: -485, flag: "non_submerged" }, 4); 

    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.HILLS_SNOW, ETerrain.MOUNTAIN_SNOW, ETerrain.FROZEN_ICE, ETerrain.FROZEN_SNOW]), 
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.SWAMP_MUD, ETerrain.SWAMP_WATER]), 
      "frozen/ice-to-water", { layer: -505, flag: "submerged" }, 4); 

    // invisible transition
    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.FROZEN_ICE]), 
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.SWAMP_WATER]), 
      "frozen/ice-to-water", { layer: -1001}, 4); 

    NEW_BEACH(this,
      getTerrainMap([ETerrain.HILLS_DESERT, ETerrain.SAND_DESERT, ETerrain.SAND_BEACH]), 
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL]), 
      "sand/shore");


    NEW_BEACH(this,
      getTerrainMap([ETerrain.GRASS_GREEN, ETerrain.GRASS_SEMI_DRY, ETerrain.GRASS_DRY, ETerrain.GRASS_LEAF_LITTER,
        ETerrain.HILLS_DESERT, ETerrain.HILLS_DRY, ETerrain.HILLS_REGULAR, ETerrain.HILLS_SNOW,
        ETerrain.MOUNTAIN_SNOW, ETerrain.MOUNTAIN_BASIC, ETerrain.MOUNTAIN_DRY, ETerrain.MOUNTAIN_VOLCANO]), 
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL]), 
      "flat/shore");

    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.SWAMP_MUD]),
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL, ETerrain.SWAMP_WATER]), 
      "swamp/mud-long", { layer: -556, flag: "transition3"}, 1); 


    ANIMATED_WATER_15_TRANSITION(this,
      getTerrainMap([ETerrain.WATER_OCEAN]), 
      getTerrainMap([ETerrain.WATER_COAST_TROPICAL, ETerrain.SWAMP_MUD]), 
      "water/ocean-blend", -550);

    ANIMATED_WATER_15_TRANSITION(this,      
      getTerrainMap([ETerrain.WATER_COAST_TROPICAL]), 
      getTerrainMap([ETerrain.WATER_OCEAN, ETerrain.SWAMP_MUD]), 
      "water/coast-tropical-long", -555);

    TRANSITION_COMPLETE_LFB(this,
      getTerrainMap([ETerrain.VOID]), swapTerrainTypes(getTerrainMap([])),
      "void/void", { layer: 1000}, 3);
    return TgGroup;      
    }

  }

}