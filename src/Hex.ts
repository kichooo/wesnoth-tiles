/// <reference path="HexPos.ts"/>

module WesnothTiles {
  'use strict';

  export enum ETerrain {
    HILLS_DESERT, // 9        
    
    WATER_OCEAN, // 0
    WATER_COAST_TROPICAL, // 1

    GRASS_GREEN, // 5
    GRASS_SEMI_DRY, // 8
    GRASS_DRY, // 6
    GRASS_LEAF_LITTER, // 7

    HILLS_REGULAR, // 2
    MOUNTAIN_BASIC, // 10
    
    MOUNTAIN_DRY, // 11
    HILLS_DRY, // 3
    MOUNTAIN_SNOW, // 12        
    HILLS_SNOW, // 4    
    
    FROZEN_ICE, // Ai
    FROZEN_SNOW, // Aa
    
    SAND_DESERT, // Dd
    SAND_BEACH, // Ds

    // SWAMP_MUD, // 8
    // SWAMP_WATER, // 9



  }


  // TODO it could be improved...
  export var swapTerrainTypes = (types: Map<ETerrain, boolean>) => {
    var swapped = new Map<ETerrain, boolean>();
    for (var i = 0; i < Object.keys(ETerrain).length / 2; i++) {
      if (!types.has(i))
        swapped.set(i, true);
    }
    return swapped;
  }

  export var sumTerrainMaps = (map1: Map<ETerrain, boolean>, map2: Map<ETerrain, boolean>) => {
    var result = new Map<ETerrain, boolean>();
    map1.forEach((_, key) => {
      result.set(key,true);
    });
    map2.forEach((_, key) => {
      result.set(key,true);
    });
    return result;
  }

  export class Hex extends HexPos {

    constructor(q: number, r: number, public terrain: ETerrain) {
      super(q, r);
    }

    

  }
} 
