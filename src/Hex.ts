/// <reference path="HexPos.ts"/>

module WesnothTiles {
  'use strict';

  export enum ETerrain {
    HILLS_REGULAR, // 0
    HILLS_DRY, // 1    
    HILLS_DESERT, // 2
    HILLS_SNOW, // 3

    GRASS_GREEN, // 4
    GRASS_DRY, // 5
    GRASS_LEAF_LITTER, // 6
    GRASS_SEMI_DRY, // 7

    WATER_OCEAN, // 8
    WATER_COAST_TROPICAL, // 9


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
