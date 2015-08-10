module WesnothTiles.Worker {
  'use strict';

  export class HexMap {


    tgGroup = new TgGroup();
    hexes = new Map<number, Map<number, Hex>>();

    private loadingMode = false;

    constructor() {

    }

    getHexP(q: number, r: number): Hex {
      var map = this.hexes.get(q);
      return (map !== undefined) ? map.get(r) : undefined;
    }

    removeHex(q: number, r: number): void {
      var map = this.hexes.get(q);
      if (map !== undefined)
        map.delete(r);
    }

    removeTerrain(q: number, r: number): void {
      var row = this.hexes.get(q);
      if (row === undefined) {
        return;
      }
      var hex = row.get(r);
      if (hex !== undefined) {
        this.removeHexFromTgs(hex);
        row.delete(r);
      }
    }

    setTerrain(q: number, r: number, terrain: ETerrain, overlay = EOverlay.NONE, fog = false): void {
      var row = this.hexes.get(q);
      if (row === undefined) {
        row = new Map<number, Hex>();
        this.hexes.set(q, row);
      }

      var hex = row.get(r);
      if (hex === undefined) {
        hex = new Hex(q, r, terrain);
        row.set(r, hex);
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

    private removeHexFromTgs(hex: Hex): void {
      var key = hex.str;
      this.tgGroup.tgs.forEach(tg => {
        tg.hexes.delete(key);
      });
    }

    private calculateStreaks(hex: Hex, bestStreaksMap: Map<ETerrain, number>): number {
      var currentStreakMap = new Map<ETerrain, number>();
      var bestFogStreak = 0;
      var currentFogStreak = 0;

      this.iterateNeighboursDouble(hex.q, hex.r,(terrain, fog) => {
        // stop current streaks.
        currentStreakMap.forEach((val, key) => {
          if (key !== terrain) {
            currentStreakMap.set(key, 0);
          }
        });
        if (!fog)
          currentFogStreak = 0;
        if (terrain === undefined)
          return;
        var newValue: number;
        if (!currentStreakMap.has(terrain))
          newValue = 1;
        else
          newValue = (currentStreakMap.get(terrain) + 1) % 7;

        currentStreakMap.set(terrain, newValue);
        var bestStreak = bestStreaksMap.has(terrain) ?
          bestStreaksMap.get(terrain) : 0;
        if (newValue > bestStreak)
          bestStreaksMap.set(terrain, newValue);

        if (fog) {
          currentFogStreak = (currentFogStreak + 1) % 7;
          if (bestFogStreak = Math.max(bestFogStreak, currentFogStreak));
        } else {
          currentFogStreak = 0;
        }

      });
      return bestFogStreak;
    }

    private addHexToTgs(hex: Hex): void {

      // for transition macros, try to catch longest sequences of the same neighbour type
      // in a row. That way we can filter out transition macros of higher grades.

      var streaksMap = new Map<ETerrain, number>();
      var fogStreak = this.calculateStreaks(hex, streaksMap);

      // iterate through all the macros and check which of them applies here.      
      this.tgGroup.tgs.forEach(tg => {
        var tile = tg.tiles[0];
        if (tile.type !== undefined && !tile.type.has(hex.terrain))
          return;

        if (tile.overlay !== undefined && !tile.overlay.has(hex.overlay))
          return;

        if (tg.transition !== undefined) {
          if (tile.fog === undefined) {
            var found = 0;
            streaksMap.forEach((value: number, key: ETerrain) => {
              if (tg.transition.has(key))
                found += value;
            });
            if (found < tg.transitionNumber) {
              return;
            }
          }

        }

        if (tile.fog !== undefined) {
          if (tg.transitionNumber === undefined && !hex.fog) {
            return;
          }
          else {
            if (tg.transitionNumber > fogStreak)
              return;
          }
        }

        tg.hexes.set(hex.str, hex);
      });

    }

    iterate(callback: (hex: Hex) => void) {
      this.hexes.forEach(map => {
        map.forEach(hex => {
          callback(hex);
        })
      });
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
    private iterateNeighboursDouble(q: number, r: number, callback: (terrain: ETerrain, fog: boolean) => void) {
      var func = (hex: Hex) => {
        if (hex !== undefined)
          callback(hex.terrain, hex.fog);
        else
          callback(undefined, undefined);
      }

      func(this.getHexP(q, r - 1));
      func(this.getHexP(q + 1, r - 1));
      func(this.getHexP(q + 1, r));
      func(this.getHexP(q, r + 1));
      func(this.getHexP(q - 1, r + 1));
      func(this.getHexP(q - 1, r));
      
      // We do not need to make the fifth and sixth call in the repeat round.
      // They wouldn't be needed under even most unlucky circumtances
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
