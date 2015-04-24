module WesnothTiles {
  'use strict';

  export class HexMap {


    public tgGroup: TgGroup = new TgGroup();
    private hexes = new Map<string, Hex>();
    
    constructor() {

    }

    getHex(pos: HexPos): Hex {
      return this.hexes.get(pos.toString());
    }

    getHexP(q: number, r: number): Hex {
      return this.hexes.get(HexPos.toString(q, r));
    }

    addHex(hex: Hex) {
      if (this.hexes.has(hex.toString())) {
        // unlink all macros.

      }
      this.tgGroup.mappedTerrains.get(hex.terrain).forEach(tg => {
        tg.hexes.push(hex);
      });

      this.hexes.set(hex.toString(), hex);


      // we also add 6 hexes around this hex, so that we are sure that we have a good fog of war.
      this.setToVoidIfEmpty(hex.q + 1, hex.r);
      this.setToVoidIfEmpty(hex.q - 1, hex.r);
      this.setToVoidIfEmpty(hex.q, hex.r + 1);
      this.setToVoidIfEmpty(hex.q, hex.r - 1);
      this.setToVoidIfEmpty(hex.q + 1, hex.r - 1);
      this.setToVoidIfEmpty(hex.q - 1, hex.r + 1);
    }

    // This method checks if hex has some value, and sets to void otherwise.
    private setToVoidIfEmpty(q: number, r: number) {
      if (this.getHexP(q, r) === undefined) {
        var voidHex = new Hex(q, r, ETerrain.VOID);
        this.hexes.set(voidHex.toString(), voidHex);
      }
    }

    iterate(func: (hex: Hex) => void) {
      this.hexes.forEach(func);
    }

    clear() {
      this.hexes.clear();
    }

  }
} 
