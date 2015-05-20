module WesnothTiles.Internal {
  'use strict';


  // Worth noting - we use Axial coordinate system from:
  // http://www.redblobgames.com/grids/hexagons/
  // (contrary to Wesnoth, which use offset system).
  export class HexPos {

    constructor(public q: number, public r: number) {
    }

    toString(): string {
      return this.q + "," + this.r;
    }

    static toString(q: number, r: number) {
      return q + "," + r;
    }

  }
} 
