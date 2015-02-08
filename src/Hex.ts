/// <reference path="HexPos.ts"/>

module WesnothTiles {
  'use strict';

  export enum ETerrain {
    HILLS_REGULAR, // 0
    HILLS_DRY, // 1    
    HILLS_DESERT, // 2
    HILLS_SNOW, // 3
  }

  export class Hex extends HexPos {

    constructor(q: number, r: number, public terrain: ETerrain) {
      super(q, r);
    }

    

  }
} 
