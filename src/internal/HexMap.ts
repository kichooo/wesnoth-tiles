module WesnothTiles.Internal {
  'use strict';

  export class HexMap {


    tgGroup = new Internal.TgGroup();
    hexes = new Map<string, Hex>();

    private loadingMode = false;

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

      if (!this.loadingMode) {
        this.removeHexFromTgs(hex);
        this.addHexToTgs(hex);      
        this.iterateNeighbours(hex.q, hex.r, h => {
          this.removeHexFromTgs(h);
          this.addHexToTgs(h);
        });
      }     
    }

    setLoadingMode(): void {
      this.loadingMode = true;

      // remove all currently loaded Tgs.
      this.tgGroup.tgs.forEach(tg => {
        tg.hexes.clear();
      });
    }

    unsetLoadingMode(): void {
      if (!this.loadingMode)
        return;

      this.loadingMode = false;
      this.iterate(h => {
        this.addHexToTgs(h);
      });
    }


    // This method checks if hex has some value, and sets to void otherwise.
    private setToVoidIfEmpty(q: number, r: number) {
      if (this.getHexP(q, r) === undefined) {
        var voidHex = new Hex(q, r, ETerrain.VOID);
        this.addHexToTgs(voidHex);
        this.hexes.set(voidHex.toString(), voidHex);
      }
    }

    private removeHexFromTgs(hex: Hex): void {
      if (this.hexes.has(hex.toString())) {
        var key = hex.toString();
        this.tgGroup.tgs.forEach(tg => {          
          tg.hexes.delete(key);
        });
      }      
    }

    private getNeighboursStreaksMap(hex: Hex): Map<ETerrain, number> {
      var bestStreaksMap = new Map<ETerrain, number>();
      var currentStreakMap = new Map<ETerrain, number>();

      this.iterateNeighboursDouble(hex.q, hex.r, terrain => {
        // stop current streaks.
        currentStreakMap.forEach((val, key) => {
          if (key !== terrain) {
            currentStreakMap.set(key, 0);
          }
        });
        var newValue: number;
        if (!currentStreakMap.has(hex.terrain))
          newValue = 1;
        else
          newValue = currentStreakMap.get(hex.terrain) + 1;
        currentStreakMap.set(hex.terrain, newValue);
        var currentStreak = bestStreaksMap.has(terrain) ?
          bestStreaksMap.get(terrain) : 0;
        if (newValue > currentStreak)
          bestStreaksMap.set(terrain, newValue);
      });

      return bestStreaksMap;
    }

    private addHexToTgs(hex: Hex): void {

      // for transition macros, try to catch longest sequences of the same neighbour type
      // in a row. That way we can filter out transition macros of higher grades.

      // var neighboursMap = new Map<ETerrain, number>();
      var neighboursMap = this.getNeighboursStreaksMap(hex);
      // this.iterateNeighbours(hex.q, hex.r, hex => {
      //   if (!neighboursMap.has(hex.terrain))
      //     neighboursMap.set(hex.terrain, 1);
      //   else 
      //     neighboursMap.set(hex.terrain, neighboursMap.get(hex.terrain) + 1);
      // });

      // iterate through all the macros and check which of them applies here.      
      this.tgGroup.tgs.forEach(tg => {
        var tile = tg.tiles[0];
        if (tile.type !== undefined && !tile.type.has(hex.terrain))
          return;
        if (tile.overlay !== undefined && !tile.overlay.has(hex.overlay))
          return;

        if (tile.fog !== undefined && !hex.fog)
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

    private iterateNeighbours(q: number, r: number, callback: (hex: Hex) => void) {
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

    // This function is for optimization purposes.
    private iterateNeighboursDouble(q: number, r: number, callback: (terrain: ETerrain) => void) {
      var func = (hex: Hex) => {
        if (hex !== undefined)
          callback(hex.terrain);
        else
          callback(undefined);
      }

      func(this.getHexP(q, r - 1));
      func(this.getHexP(q + 1, r - 1));
      func(this.getHexP(q + 1, r));
      func(this.getHexP(q, r + 1));
      func(this.getHexP(q - 1, r + 1));
      func(this.getHexP(q - 1, r));
      
      // We do not need to make the fifth and sixth call in the repeat round.
      // They wouldm't be needed under even most unlucky circumtances
      func(this.getHexP(q, r - 1));
      func(this.getHexP(q + 1, r - 1));
      func(this.getHexP(q + 1, r));
      func(this.getHexP(q, r + 1));
    }

    clear() {
      this.hexes.clear();
      this.tgGroup.tgs.forEach(tg => {
        tg.hexes.clear();
      });
    }

  }
} 
