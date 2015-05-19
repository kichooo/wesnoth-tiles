/// <reference path="HexPos.ts"/>

module WesnothTiles {
  'use strict';

  export enum ETerrain {
    GRASS_GREEN, // Gg 0
    GRASS_SEMI_DRY, // Ggd 1
    GRASS_DRY, // Gd 2     
    GRASS_LEAF_LITTER, // Gll 3

    HILLS_REGULAR, // Hh 4
    HILLS_DRY, // Hhd 5
    HILLS_DESERT, // Hd 6      
    HILLS_SNOW, // Ha 7    


    MOUNTAIN_BASIC, // Mm 8
    MOUNTAIN_DRY, // Md 9
    MOUNTAIN_SNOW, // Ms 10 
    MOUNTAIN_VOLCANO, // Mv 11

    FROZEN_SNOW, // Aa 12
    FROZEN_ICE, // Ai 13

    SAND_BEACH, // Ds 14
    SAND_DESERT, // Dd 15
      
    SWAMP_MUD, // Sm 16
    SWAMP_WATER, // Ss 17
      
    WATER_OCEAN, // Wo 18
    WATER_COAST_TROPICAL, // Ww 19
      
    ABYSS, // Qxua 20
    VOID // Xv 21
  }
  export enum EOverlay {
    WOODS_PINE = 22,
    SNOW_FOREST,
    JUNGLE,
    PALM_DESERT,
    RAINFOREST,
    SAVANNA,
    DECIDUOUS_SUMMER,
    DECIDUOUS_FALL,
    DECIDUOUS_WINTER,
    DECIDUOUS_WINTER_SNOW,
    MIXED_SUMMER,
    MIXED_FALL,
    MIXED_WINTER,
    MIXED_WINTER_SNOW,
    MUSHROOMS,
    FARM_VEGS,
    FLOWERS_MIXED,
    RUBBLE,
    STONES_SMALL,
    OASIS,
    DETRITUS,
    LITER,
    TRASH,
    VILLAGE_HUMAN,
    VILLAGE_HUMAN_RUIN,
    VILLAGE_HUMAN_CITY,
    VILLAGE_HUMAN_CITY_RUIN,
    VILLAGE_TROPICAL,
    VILLAGE_HUT,
    VILLAGE_LOG_CABIN,
    VILLAGE_CAMP,
    VILLAGE_IGLOO,
    VILLAGE_ORC,
    VILLAGE_ELVEN,
    VILLAGE_DESERT,
    VILLAGE_DESERT_CAMP,
    VILLAGE_DWARVEN,
    VILLAGE_SWAMP,
    VILLAGE_COAST,
    DESERT_PLANTS,
    NONE
  }

  export class Hex extends HexPos {
    private hashesTaken = 0;

    constructor(q: number, r: number, public terrain: ETerrain,
      public overlay = EOverlay.NONE, public fog = false) {
      super(q, r);
    }

    getRandom(from = 0, to?: number): number {
      this.hashesTaken++;
      if (to === undefined) {
        return from + murmurhash3(this.toString(), this.hashesTaken);
      }
      return from + murmurhash3(this.toString(), this.hashesTaken) % to;
    }

  }
} 
