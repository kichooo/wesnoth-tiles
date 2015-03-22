// Drawing algoritm. Pretty complicated, although much simplified compared to Wesnoth (which is much more powerful).

module WesnothTiles {
  'use strict';

  export interface WMLImage {
    name: string;
    layer: number;
    variations: string[];
  }

  export interface WMLTile {
    set_flag: string[];
    has_flag: string[];
    no_flag: string[];
    set_no_flag: string[];

    q: number;
    r: number;
    type: Map<ETerrain, boolean>;

    image?: WMLImage;

    anchor?: number;
  }

  export interface WMLTerrainGraphics {
    tiles: WMLTile[];
    set_flag: string[];
    has_flag: string[];
    no_flag: string[];
    set_no_flag: string[];

    probability?: number;

    rotations?: string[];
  }

  export interface PLFB {
    prob?: number;
    layer?: number;
    flag?: string;
    builder?: string;
  }

  export interface LFB {
    layer?: number;
    flag?: string;
    builder?: string;
  }

  var GENERIC_SINGLE_PLFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB) => {
    var img: WMLImage = {
      name: imageStem,
      layer: plfb.layer,
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
    }

    var tile: WMLTile = {
      q: 0,
      r: 0,
      type: terrainList,
      image: img,
      set_flag: [],
      has_flag: [],
      no_flag: [],
      set_no_flag: []
    }
    if (plfb.flag !== undefined)
      tile.set_no_flag.push(plfb.flag);

    var terrainGraphic: WMLTerrainGraphics = {
      tiles: [
        tile
      ],
      set_flag: [],
      has_flag: [],
      no_flag: [],
      set_no_flag: [],
      probability: plfb.prob
    }
    terrainGraphics.push(terrainGraphic);
  }

  export var TERRAIN_BASE_PLFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB) => {
    if (plfb.prob === undefined)
      plfb.prob = 100;
    if (plfb.layer === undefined)
      plfb.layer = -1000;
    if (plfb.flag === undefined)
      plfb.flag = "base";
    console.log(Resources.definitions.has(imageStem));
    GENERIC_SINGLE_PLFB(terrainGraphics, terrainList, imageStem, plfb);
  }

  var GENERIC_SINGLE_RANDOM_LFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, imageStem: string, lfb: LFB) => {    
    GENERIC_SINGLE_PLFB(terrainGraphics, terrainList, imageStem + "@V", {
      prob: 100,
      layer: lfb.layer,
      flag: lfb.flag,
      builder: lfb.builder
    });
  }

  export var TERRAIN_BASE_RANDOM_LFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, imageStem: string, lfb: LFB) => {
    if (lfb.layer === undefined)
      lfb.layer = -1000;
    if (lfb.flag === undefined)
      lfb.flag = "base";
    GENERIC_SINGLE_RANDOM_LFB(terrainGraphics, terrainList, imageStem, lfb);
  }


  var BORDER_RESTRICTED_PLFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB) => {
    var img: WMLImage = {
      name: imageStem + "-@R0",
      layer: plfb.layer,
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
    }

    var tile1: WMLTile = {
      q: 0,
      r: 0,
      type: adjacent,
      image: img,
      set_flag: [],
      has_flag: [],
      no_flag: [],
      set_no_flag: plfb.flag !== undefined? [plfb.flag + "-@R0"] : []
    }

    var tile2: WMLTile = {
      q: 0,
      r: -1,
      type: terrainList,
      set_flag: [],
      has_flag: [],
      no_flag: [],
      set_no_flag: plfb.flag !== undefined? [plfb.flag + "-@R3"] : []
    } 

    var terrainGraphic: WMLTerrainGraphics = {
      tiles: [
        tile1,
        tile2
      ],
      set_flag: [],
      has_flag: [],
      no_flag: [],
      set_no_flag: [],
      probability: plfb.prob,
      rotations: ["n", "ne", "se", "s", "sw", "nw"]
    }
    terrainGraphics.push(terrainGraphic);
  }

  var BORDER_RESTRICTED6_PLFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB) => {
    var img: WMLImage = {
      name: imageStem + "-@R0-@R1-@R2-@R3-@R4-@R5",
      layer: plfb.layer,
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
    }

    var tile1: WMLTile = {
      q: 0,
      r: 0,
      type: adjacent,
      image: img,
      set_flag: [],
      has_flag: [],
      no_flag: [],
      set_no_flag: plfb.flag !== undefined? [plfb.flag + "-@R0", plfb.flag + "-@R1", plfb.flag + "-@R2", plfb.flag + "-@R3", plfb.flag + "-@R4", plfb.flag + "-@R5"] : []
    }

    var tile2: WMLTile = {
      q: 0,
      r: -1,
      type: terrainList,
      set_flag: [],
      has_flag: [],
      no_flag: [],
      set_no_flag: plfb.flag !== undefined? [plfb.flag + "-@R3"] : []
    }

    var tile3: WMLTile = {
      q: 1,
      r: -1,
      type: terrainList,
      set_flag: [],
      has_flag: [],
      no_flag: [],
      set_no_flag: plfb.flag !== undefined? [plfb.flag + "-@R4"] : []
    }    

    var tile4: WMLTile = {
      q: 1,
      r: 0,
      type: terrainList,
      set_flag: [],
      has_flag: [],
      no_flag: [],
      set_no_flag: plfb.flag !== undefined? [plfb.flag + "-@R5"] : []
    }

    var tile5: WMLTile = {
      q: 0,
      r: 1,
      type: terrainList,
      set_flag: [],
      has_flag: [],
      no_flag: [],
      set_no_flag: plfb.flag !== undefined? [plfb.flag + "-@R0"] : []
    }              

    var tile6: WMLTile = {
      q: -1,
      r: 1,
      type: terrainList,
      set_flag: [],
      has_flag: [],
      no_flag: [],
      set_no_flag: plfb.flag !== undefined? [plfb.flag + "-@R1"] : []
    }

    var tile7: WMLTile = {
      q: -1,
      r: 0,
      type: terrainList,
      set_flag: [],
      has_flag: [],
      no_flag: [],
      set_no_flag: plfb.flag !== undefined? [plfb.flag + "-@R2"] : []
    }                      

    var terrainGraphic: WMLTerrainGraphics = {
      tiles: [
        tile1,
        tile2,
        tile3,
        tile4,
        tile5,
        tile6,
        tile7
      ],
      set_flag: [],
      has_flag: [],
      no_flag: [],
      set_no_flag: [],
      probability: plfb.prob,
      rotations: ["n", "ne", "se", "s", "sw", "nw"]
    }
    terrainGraphics.push(terrainGraphic);
  }

  var BORDER_RESTRICTED5_PLFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB) => {
    var img: WMLImage = {
      name: imageStem + "-@R0-@R1-@R2-@R3-@R4",
      layer: plfb.layer,
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
    }

    var tile1: WMLTile = {
      q: 0,
      r: 0,
      type: adjacent,
      image: img,
      set_flag: [],
      has_flag: [],
      no_flag: [],
      set_no_flag: plfb.flag !== undefined? [plfb.flag + "-@R0", plfb.flag + "-@R1", plfb.flag + "-@R2", plfb.flag + "-@R3", plfb.flag + "-@R4"] : []
    }

    var tile2: WMLTile = {
      q: 0,
      r: -1,
      type: terrainList,
      set_flag: [],
      has_flag: [],
      no_flag: [],
      set_no_flag: plfb.flag !== undefined? [plfb.flag + "-@R3"] : []
    }

    var tile3: WMLTile = {
      q: 1,
      r: -1,
      type: terrainList,
      set_flag: [],
      has_flag: [],
      no_flag: [],
      set_no_flag: plfb.flag !== undefined? [plfb.flag + "-@R4"] : []
    }    

    var tile4: WMLTile = {
      q: 1,
      r: 0,
      type: terrainList,
      set_flag: [],
      has_flag: [],
      no_flag: [],
      set_no_flag: plfb.flag !== undefined? [plfb.flag + "-@R5"] : []
    }

    var tile5: WMLTile = {
      q: 0,
      r: 1,
      type: terrainList,
      set_flag: [],
      has_flag: [],
      no_flag: [],
      set_no_flag: plfb.flag !== undefined? [plfb.flag + "-@R0"] : []
    }              

    var tile6: WMLTile = {
      q: -1,
      r: 1,
      type: terrainList,
      set_flag: [],
      has_flag: [],
      no_flag: [],
      set_no_flag: plfb.flag !== undefined? [plfb.flag + "-@R1"] : []
    }             

    var terrainGraphic: WMLTerrainGraphics = {
      tiles: [
        tile1,
        tile2,
        tile3,
        tile4,
        tile5,
        tile6
      ],
      set_flag: [],
      has_flag: [],
      no_flag: [],
      set_no_flag: [],
      probability: plfb.prob,
      rotations: ["n", "ne", "se", "s", "sw", "nw"]
    }
    terrainGraphics.push(terrainGraphic);
  }

  var BORDER_RESTRICTED4_PLFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB) => {
    var img: WMLImage = {
      name: imageStem + "-@R0-@R1-@R2-@R3",
      layer: plfb.layer,
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
    }

    var tile1: WMLTile = {
      q: 0,
      r: 0,
      type: adjacent,
      image: img,
      set_flag: [],
      has_flag: [],
      no_flag: [],
      set_no_flag: plfb.flag !== undefined? [plfb.flag + "-@R0", plfb.flag + "-@R1", plfb.flag + "-@R2", plfb.flag + "-@R3"] : []
    }

    var tile2: WMLTile = {
      q: 0,
      r: -1,
      type: terrainList,
      set_flag: [],
      has_flag: [],
      no_flag: [],
      set_no_flag: plfb.flag !== undefined? [plfb.flag + "-@R3"] : []
    }

    var tile3: WMLTile = {
      q: 1,
      r: -1,
      type: terrainList,
      set_flag: [],
      has_flag: [],
      no_flag: [],
      set_no_flag: plfb.flag !== undefined? [plfb.flag + "-@R4"] : []
    }    

    var tile4: WMLTile = {
      q: 1,
      r: 0,
      type: terrainList,
      set_flag: [],
      has_flag: [],
      no_flag: [],
      set_no_flag: plfb.flag !== undefined? [plfb.flag + "-@R5"] : []
    }

    var tile5: WMLTile = {
      q: 0,
      r: 1,
      type: terrainList,
      set_flag: [],
      has_flag: [],
      no_flag: [],
      set_no_flag: plfb.flag !== undefined? [plfb.flag + "-@R0"] : []
    }              

    var terrainGraphic: WMLTerrainGraphics = {
      tiles: [
        tile1,
        tile2,
        tile3,
        tile4,
        tile5
      ],
      set_flag: [],
      has_flag: [],
      no_flag: [],
      set_no_flag: [],
      probability: plfb.prob,
      rotations: ["n", "ne", "se", "s", "sw", "nw"]
    }
    terrainGraphics.push(terrainGraphic);
  }

  var BORDER_RESTRICTED3_PLFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB) => {
    var img: WMLImage = {
      name: imageStem + "-@R0-@R1-@R2",
      layer: plfb.layer,
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
    }

    var tile1: WMLTile = {
      q: 0,
      r: 0,
      type: adjacent,
      image: img,
      set_flag: [],
      has_flag: [],
      no_flag: [],
      set_no_flag: plfb.flag !== undefined? [plfb.flag + "-@R0", plfb.flag + "-@R1", plfb.flag + "-@R2"] : []
    }

    var tile2: WMLTile = {
      q: 0,
      r: -1,
      type: terrainList,
      set_flag: [],
      has_flag: [],
      no_flag: [],
      set_no_flag: plfb.flag !== undefined? [plfb.flag + "-@R3"] : []
    }

    var tile3: WMLTile = {
      q: 1,
      r: -1,
      type: terrainList,
      set_flag: [],
      has_flag: [],
      no_flag: [],
      set_no_flag: plfb.flag !== undefined? [plfb.flag + "-@R4"] : []
    }    

    var tile4: WMLTile = {
      q: 1,
      r: 0,
      type: terrainList,
      set_flag: [],
      has_flag: [],
      no_flag: [],
      set_no_flag: plfb.flag !== undefined? [plfb.flag + "-@R5"] : []
    }        

    var terrainGraphic: WMLTerrainGraphics = {
      tiles: [
        tile1,
        tile2,
        tile3,
        tile4
      ],
      set_flag: [],
      has_flag: [],
      no_flag: [],
      set_no_flag: [],
      probability: plfb.prob,
      rotations: ["n", "ne", "se", "s", "sw", "nw"]
    }
    terrainGraphics.push(terrainGraphic);
  }

  var BORDER_RESTRICTED2_PLFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB) => {
    var img: WMLImage = {
      name: imageStem + "-@R0-@R1",
      layer: plfb.layer,
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
    }

    var tile1: WMLTile = {
      q: 0,
      r: 0,
      type: adjacent,
      image: img,
      set_flag: [],
      has_flag: [],
      no_flag: [],
      set_no_flag: plfb.flag !== undefined? [plfb.flag + "-@R0", plfb.flag + "-@R1"] : []
    }

    var tile2: WMLTile = {
      q: 0,
      r: -1,
      type: terrainList,
      set_flag: [],
      has_flag: [],
      no_flag: [],
      set_no_flag: plfb.flag !== undefined? [plfb.flag + "-@R3"] : []
    }

    var tile3: WMLTile = {
      q: 1,
      r: -1,
      type: terrainList,
      set_flag: [],
      has_flag: [],
      no_flag: [],
      set_no_flag: plfb.flag !== undefined? [plfb.flag + "-@R4"] : []
    }    

    var terrainGraphic: WMLTerrainGraphics = {
      tiles: [
        tile1,
        tile2,
        tile3
      ],
      set_flag: [],
      has_flag: [],
      no_flag: [],
      set_no_flag: [],
      probability: plfb.prob,
      rotations: ["n", "ne", "se", "s", "sw", "nw"]
    }
    terrainGraphics.push(terrainGraphic);
  }

  var BORDER_RESTRICTED6_RANDOM_LFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, lfb: LFB) => {
    BORDER_RESTRICTED6_PLFB(terrainGraphics, terrainList, adjacent, imageStem + "@V", {
      prob: 100,
      layer: lfb.layer,
      flag: lfb.flag,
      builder: lfb.builder
    });
  }

  var BORDER_RESTRICTED5_RANDOM_LFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, lfb: LFB) => {
    BORDER_RESTRICTED5_PLFB(terrainGraphics, terrainList, adjacent, imageStem + "@V", {
      prob: 100,
      layer: lfb.layer,
      flag: lfb.flag,
      builder: lfb.builder
    });
  }

  var BORDER_RESTRICTED4_RANDOM_LFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, lfb: LFB) => {
    BORDER_RESTRICTED4_PLFB(terrainGraphics, terrainList, adjacent, imageStem + "@V", {
      prob: 100,
      layer: lfb.layer,
      flag: lfb.flag,
      builder: lfb.builder
    });
  }

  var BORDER_RESTRICTED3_RANDOM_LFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, lfb: LFB) => {
    BORDER_RESTRICTED3_PLFB(terrainGraphics, terrainList, adjacent, imageStem + "@V", {
      prob: 100,
      layer: lfb.layer,
      flag: lfb.flag,
      builder: lfb.builder
    });
  }

  var BORDER_RESTRICTED2_RANDOM_LFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, lfb: LFB) => {
    BORDER_RESTRICTED2_PLFB(terrainGraphics, terrainList, adjacent, imageStem + "@V", {
      prob: 100,
      layer: lfb.layer,
      flag: lfb.flag,
      builder: lfb.builder
    });
  }

  var BORDER_RESTRICTED_RANDOM_LFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, lfb: LFB) => {
    BORDER_RESTRICTED_PLFB(terrainGraphics, terrainList, adjacent, imageStem + "@V", {
      prob: 100,
      layer: lfb.layer,
      flag: lfb.flag,
      builder: lfb.builder
    });
  }

  var BORDER_COMPLETE_LFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, lfb: LFB) => {
    BORDER_RESTRICTED6_RANDOM_LFB(terrainGraphics, terrainList, adjacent, imageStem, lfb);
    BORDER_RESTRICTED5_RANDOM_LFB(terrainGraphics, terrainList, adjacent, imageStem, lfb);
    BORDER_RESTRICTED4_RANDOM_LFB(terrainGraphics, terrainList, adjacent, imageStem, lfb);
    BORDER_RESTRICTED3_RANDOM_LFB(terrainGraphics, terrainList, adjacent, imageStem, lfb);
    BORDER_RESTRICTED2_RANDOM_LFB(terrainGraphics, terrainList, adjacent, imageStem, lfb);
    BORDER_RESTRICTED_RANDOM_LFB(terrainGraphics, terrainList, adjacent, imageStem, lfb);
  }

  export var TRANSITION_COMPLETE_LFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, lfb: LFB) => {
    if (lfb.layer === undefined)
      lfb.layer = -500;
    if (lfb.flag === undefined)
      lfb.flag = "transition";
    if (lfb.builder === undefined)
      lfb.builder = "IMAGE_SINGLE";      
    BORDER_COMPLETE_LFB(terrainGraphics, terrainList, adjacent, imageStem, lfb);
  }

  
} 
