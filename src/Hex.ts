/// <reference path="HexPos.ts"/>

module WesnothTiles {
  'use strict';

  export interface ETerrain {
    HILLS_DRY; // 0
    HILLS_GREEN; // 1
    HILLS_DESERT; // 2
  }

  export class Hex extends HexPos {

    constructor(q: number, r: number, private terrain: ETerrain) {
      super(q, r);
    }

  }
} 
