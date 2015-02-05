module WesnothTiles {
  'use strict';

  export class HexMap {

    private hexes = new Map<string, Hex>();
    
    constructor() {

    }

    getHex(pos: HexPos): Hex {
      return this.hexes.get(pos.toString());
    }

    addHex(hex: Hex) {
      this.hexes.set(hex.toString(), hex);
    }

    iterate(func: (hex: Hex) => void) {
      this.hexes.forEach(func);
    }

  }
} 
