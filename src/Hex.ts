/// <reference path="HexPos.ts"/>

module WesnothTiles {
  'use strict';

  export enum ETerrain {
    MOUNTAIN_BASIC, // Mm 10  
    FROZEN_SNOW, // Aa      
    SAND_BEACH, // Ds  
    FROZEN_ICE, // Ai      
    GRASS_DRY, // 6
    GRASS_GREEN, // 5
    GRASS_SEMI_DRY, // 8
    HILLS_DESERT, // 9            
    GRASS_LEAF_LITTER, // 7
    HILLS_REGULAR, // 2
    MOUNTAIN_DRY, // 11
    HILLS_DRY, // 3
    MOUNTAIN_SNOW, // 12        
    HILLS_SNOW, // 4        
    SAND_DESERT, // Dd
    MOUNTAIN_VOLCANO, // Mv
    SWAMP_MUD, // Sm
    SWAMP_WATER, // Ss
    WATER_OCEAN, // Wo 
    WATER_COAST_TROPICAL, // 1
    ABYSS, // 1
    VOID,


    WOODS_PINE,
    SNOW_FOREST,
    JUNGLE,
    PALM_DESERT,
    RAINFOREST,
    SAVANNA,
    DECIDUOUS_SUMMER,
    DECIDUOUS_FALL,
    DECIDUOUS_WINTER,
    DECIDUOUS_WINTER_SNOW,
    MIXED_SUMMER,
    MIXED_FALL,
    MIXED_WINTER,
    MIXED_WINTER_SNOW,
    MUSHROOMS,
    FARM_VEGS,
    FLOWERS_MIXED,
    RUBBLE,
    STONES_SMALL,
    OASIS,
    DETRITUS,
    LITER,
    TRASH,
    VILLAGE_HUMAN,
    VILLAGE_HUMAN_RUIN,
    VILLAGE_HUMAN_CITY,
    VILLAGE_HUMAN_CITY_RUIN,
    VILLAGE_TROPICAL,
    VILLAGE_HUT,
    VILLAGE_LOG_CABIN,
    VILLAGE_CAMP,
    VILLAGE_IGLOO,
    VILLAGE_ORC,
    VILLAGE_ELVEN,
    VILLAGE_DESERT,
    VILLAGE_DESERT_CAMP,
    VILLAGE_DWARVEN,
    VILLAGE_SWAMP,
    VILLAGE_COAST,
    DESERT_PLANTS,
    OVERLAY_NONE
  }


  export var swapTerrainTypes = (types: Map<ETerrain, boolean>) => {
    var swapped = new Map<ETerrain, boolean>();
    for (var i = 0; i < ETerrain.VOID; i++) {
      if (!types.has(i))
        swapped.set(i, true);
    }
    return swapped;
  }

  // export var swapOverlayTypes = (types: Map<ETerrain, boolean>) => {
  //   var swapped = new Map<ETerrain, boolean>();
  //   for (var i = ETerrain.VOID + 1; i <= ETerrain.DESERT_PLANTS; i++) {
  //     if (!types.has(i))
  //       swapped.set(i, true);
  //   }
  //   return swapped;
  // }

  export var iterateTerrains = (callback: (ETerrain) => void) => {

    for (var i = 0; i <= ETerrain.VOID; i++) {
      callback(i);
    }
  }

  // iterate terrains and overlays OVERLAY_NONE.
  export var iterateTerrainsAndOverlays = (callback: (ETerrain) => void) => {

    for (var i = 0; i < ETerrain.OVERLAY_NONE; i++) {
      callback(i);
    }
  }

  export var sumTerrainMaps = (map1: Map<ETerrain, boolean>, map2: Map<ETerrain, boolean>) => {
    var result = new Map<ETerrain, boolean>();
    map1.forEach((_, key) => {
      result.set(key, true);
    });
    map2.forEach((_, key) => {
      result.set(key, true);
    });
    return result;
  }

  export class Hex extends HexPos {
    private hashesTaken = 0;

    constructor(q: number, r: number, public terrain: ETerrain, 
      public overlay = ETerrain.OVERLAY_NONE, public fog = false) {
      super(q, r);
      if (q > 0) {
        this.fog = true;
      }
    }

    getRandom(from = 0, to?: number): number {
      this.hashesTaken++;
      if (to === undefined) {
        return from + murmurhash3(this.toString(), this.hashesTaken);
      }
      return from + murmurhash3(this.toString(), this.hashesTaken) % to;
    }

  }
} 
