/// <reference path="HexPos.ts"/>

module WesnothTiles.Internal {
  'use strict';



  export class Hex extends HexPos {
    private hashesTaken = 0;

    constructor(q: number, r: number, public terrain: ETerrain,
      public overlay = EOverlay.NONE, public fog = false) {
      super(q, r);
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
