/// <reference path="HexPos.ts"/>

module WesnothTiles {
  'use strict';

  export enum ETerrain {
    HILLS_REGULAR, // 0
    HILLS_DRY, // 1    
    HILLS_SNOW, // 2

    GRASS_GREEN, // 3
    GRASS_DRY, // 4
    GRASS_LEAF_LITTER, // 5
    GRASS_SEMI_DRY, // 6

    WATER_OCEAN, // 7
    WATER_COAST_TROPICAL, // 8
    HILLS_DESERT, // 9

    // SWAMP_MUD, // 8
    // SWAMP_WATER, // 9



  }

  export var swapTerrainTypes = (types: Map<ETerrain, boolean>) => {
    var swapped = new Map<ETerrain, boolean>();
    for (var i = 0; i < 10; i++) {
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
