module WesnothTiles.Worker {
  'use strict';

  export interface IHexPos {
    q: number;
    r: number;
  }

  export class Hex implements IHexPos {
    public str;
    private hashesTaken = 0;
    flags = new Map<string, boolean>()

    constructor(public q: number, public r: number, public terrain: ETerrain,
      public overlay = EOverlay.NONE, public fog = false) {
      this.str = q + "," + r;
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
