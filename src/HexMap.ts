module WesnothTiles {
  'use strict';

  export class HexMap {

    private Hexes = new Map<string, Hex>();
    
    constructor() {
      
    }

    public getHex(pos: HexPos): Hex {
      return this.Hexes[pos.toString()];
    }


  }
} 
