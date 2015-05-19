module WesnothTiles {
  'use strict';

  export class HexMap {


    public tgGroup: TgGroup = new TgGroup();
    public hexes = new Map<string, Hex>();

    constructor() {

    }

    getHex(pos: HexPos): Hex {
      return this.hexes.get(pos.toString());
    }

    getHexP(q: number, r: number): Hex {
      return this.hexes.get(HexPos.toString(q, r));
    }

    removeHex(q: number, r: number): void {
      this.hexes.delete(HexPos.toString(q, r));
    }


    addHex(hex: Hex) {
      this.addHexToTgs(hex)
      this.hexes.set(hex.toString(), hex);


      // we also add 6 hexes around this hex, so that we are sure that everything is surrounded by void.
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
        this.addHexToTgs(voidHex);
        this.hexes.set(voidHex.toString(), voidHex);
      }
    }

    private addHexToTgs(hex: Hex) {
      if (this.hexes.has(hex.toString())) {
        var key = hex.toString();
        this.tgGroup.tgs.forEach(tg => {
          if (tg.hexes.has)
            tg.hexes.delete(key);
        });
      }

      // iterate through all the macros and check which of them applies here.      
      this.tgGroup.tgs.forEach(tg => {
        var tile = tg.tiles[0];
        if (tile.type !== undefined && !tile.type.has(hex.terrain))
          return;

        if (tile.overlay !== undefined && !tile.overlay.has(hex.overlay))
          return;
        // console.log("Adding hex", tg.images[0].name);
        tg.hexes.set(hex.toString(), hex);
      });
    }

    iterate(func: (hex: Hex) => void) {
      this.hexes.forEach(func);
    }

    clear() {
      this.hexes.clear();
    }

  }
} 
