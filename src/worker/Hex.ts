/// <reference path="HexPos.ts"/>

module WesnothTiles.Worker {
  'use strict';



  export class Hex extends HexPos {
    private hashesTaken = 0;
    flags = new Map<string, boolean>()

    constructor(q: number, r: number, public terrain: ETerrain,
      public overlay = EOverlay.NONE, public fog = false) {
      super(q, r);
    }

    getRandom(from, to: number): number {
      this.hashesTaken++;
      return from + murmurhash3(this.str, this.hashesTaken) % to;
    }

    reset(): void {
      this.flags.clear();
      this.hashesTaken = 0;
    }

  }
} 
