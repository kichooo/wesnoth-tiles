module WesnothTiles.Internal {
  'use strict';

  export class HexMap {


    public tgGroup = new Internal.TgGroup();
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

    setTerrain(q: number, r: number, terrain: ETerrain, overlay = EOverlay.NONE, fog = false): void {
      var hex = this.getHexP(q, r);
      if (hex === undefined) {
        hex = new Hex(q, r, terrain);
        this.hexes.set(hex.toString(), hex);
      }

      hex.terrain = terrain;
      hex.overlay = overlay;
      hex.fog = fog;

      // we also add 6 hexes around this hex, so that we are sure that everything is surrounded by void.
      // this.setToVoidIfEmpty(q + 1, r);
      // this.setToVoidIfEmpty(q - 1, r);
      // this.setToVoidIfEmpty(q, r + 1);
      // this.setToVoidIfEmpty(q, r - 1);
      // this.setToVoidIfEmpty(q + 1, r - 1);
      // this.setToVoidIfEmpty(q - 1, r + 1);

      
      this.addHexToTgs(hex);      
      this.iterateNeighbours(hex.q, hex.r, h => {
        this.addHexToTgs(h);
      })
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
          tg.hexes.delete(key);
        });
      }

      var neighboursMap = new Map<ETerrain, number>();
      this.iterateNeighbours(hex.q, hex.r, hex => {
        if (!neighboursMap.has(hex.terrain))
          neighboursMap.set(hex.terrain, 1);
        else 
          neighboursMap.set(hex.terrain, neighboursMap.get(hex.terrain) + 1);
      });

      // iterate through all the macros and check which of them applies here.      
      this.tgGroup.tgs.forEach(tg => {
        var tile = tg.tiles[0];
        if (tile.type !== undefined && !tile.type.has(hex.terrain))
          return;
        if (tile.overlay !== undefined && !tile.overlay.has(hex.overlay))
          return;

        if (tg.transition !== undefined) {
          // this is a transition macro - we need to check if we have at least one proper neighbour.
          // var found = false;
          // this.iterateNeighbours(hex.q, hex.r, hex => {
          //   if (tg.transition.has(hex.terrain)) {              
          //     found = true;
          //   }
          // });
          // if (!found) {
          //   return;
          // }


          var found = false;
          neighboursMap.forEach((value: number, key: ETerrain) => {
            if (value >= tg.transitionNumber && tg.transition.has(key))
              found = true;
          });
          if (!found) {
            return;          
          }

        }
        tg.hexes.set(hex.toString(), hex);
      });




    }

    iterate(callback: (hex: Hex) => void) {
      this.hexes.forEach(callback);
    }

    iterateNeighbours(q: number, r: number, callback: (hex: Hex) => void) {
      var func = (hex: Hex) => {
        if (hex !== undefined)
          callback(hex);
      }
      func(this.getHexP(q + 1, r));
      func(this.getHexP(q - 1, r));
      func(this.getHexP(q, r + 1));
      func(this.getHexP(q, r - 1));
      func(this.getHexP(q + 1, r - 1));
      func(this.getHexP(q - 1, r + 1));
    }

    clear() {
      this.hexes.clear();
      this.tgGroup.tgs.forEach(tg => {
        tg.hexes.clear();
      });
    }

  }
} 
