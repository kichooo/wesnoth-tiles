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
  }

  export class Hex extends HexPos {

    constructor(q: number, r: number, public terrain: ETerrain) {
      super(q, r);
    }

    

  }
} 
