module WesnothTiles {
  'use strict';

  export class HexMap {

    private Hexes: Map<string, Hex> = new Map<string, Hex>();
    
    constructor() {
      
    }

    public getHex(pos: Pos): Hex {
      return this.Hexes[pos.toString()];
    }


  }
} 
