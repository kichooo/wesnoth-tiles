module WesnothTiles {
  'use strict';

  export class HexMap {

    private hexes = new Map<string, Hex>();
    
    constructor() {



      this.hexes
    }

    getHex(pos: HexPos): Hex {
      return this.hexes[pos.toString()];
    }

    addHex(hex: Hex) {
      this.hexes.set(hex.toString(), hex);
    }

    iterate(func: (hex: Hex) => void) {
      this.hexes.forEach(func);
    }

  }
} 
