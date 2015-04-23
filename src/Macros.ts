module WesnothTiles {
  'use strict';


  export interface IBuilder {
    toDrawable(imageStem: string, postfix: string, pos: IVector, layer: number, base: IVector): IDrawable;
    toString(imageStem: string, postfix?: string): string;
  }
  // image builders.
  export var IB_IMAGE_SINGLE: IBuilder = {
    toDrawable: (imageStem: string, postfix: string, pos: IVector, layer: number, base: IVector) => {
      // console.log("Adding " + imageStem + postfix);
      return new StaticImage(
        pos.x, 
        pos.y, 
        imageStem + postfix, layer, base
      )
    },    
    
    toString: (imageStem: string, postfix: string) => {
      return imageStem + postfix;
    }
  }

  export var IB_ANIMATION_15_SLOW: IBuilder = {
    toDrawable: (imageStem: string, postfix: string, pos: IVector, layer: number, base: IVector) => {
      return new AnimatedImage(
        pos.x, 
        pos.y,
        imageStem + "-@A" + postfix, layer, base, 15, 150
      )
    },
    toString: (imageStem: string, postfix: string) => {
      return imageStem + "-A01" + postfix;
    }
  }

  export var IB_ANIMATION_15: IBuilder = {
    toDrawable: (imageStem: string, postfix: string, pos: IVector, layer: number, base: IVector) => {
      return new AnimatedImage(
        pos.x, 
        pos.y,
        imageStem + "-@A" + postfix, layer, base, 15, 110
      )
    },
    toString: (imageStem: string, postfix: string) => {
      return imageStem + "-A01" + postfix;
    }
  }  

  export var IB_ANIMATION_06: IBuilder = {
    toDrawable: (imageStem: string, postfix: string, pos: IVector, layer: number, base: IVector) => {
      return new AnimatedImage(
        pos.x, 
        pos.y,
        imageStem + "-@A" + postfix, layer, base, 6, 200
      )
    },
    toString: (imageStem: string, postfix: string) => {
      return imageStem + "-A01" + postfix;
    }
  }


  export interface WMLImage {
    name: string;
    layer: number;
    variations: string[];
    postfix?: string;
    base?: IVector;
    center?: IVector;
  }

  export interface WMLTile {
    set_no_flag?: string[];

    q: number;
    r: number;
    type?: Map<ETerrain, boolean>;
    overlay?: Map<ETerrain, boolean>;
    images?: WMLImage[];

    anchor?: number;
  }

  // Group of terrain graphics elements
  export class TgGroup {
    public mappedTerrains: Map<ETerrain, WMLTerrainGraphics[]>;

    public terrains: WMLTerrainGraphics[];

    // Need to perform no matter what.
    public ungroupped: WMLTerrainGraphics[];
    constructor() {
    }

    // add terrain graphics
    addTg(tg: WMLTerrainGraphics) {
      
    }

  }

  export interface WMLTerrainGraphics {
    tiles: WMLTile[];
    set_no_flag?: string[];
    images?: WMLImage[];
    probability?: number;

    rotations?: string[];

    builder: IBuilder;
  }

  export interface PLFB extends LFB {
    prob?: number;
  }

  export interface LFB {
    layer?: number;
    flag?: string;
    builder?: IBuilder;
  }

  var GENERIC_SINGLE_PLFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, overlayList: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB) => {
    var img: WMLImage = {
      name: imageStem,
      layer: plfb.layer,
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"],
      base: {x: 90 - 90, y: 108 - 144},
      center: {x: 90 - 54, y: 108 - 72}
    }

    var tile: WMLTile = {
      q: 0,
      r: 0,
      type: terrainList,
      overlay: overlayList,
      set_no_flag: [plfb.flag]      
    }

    var terrainGraphic: WMLTerrainGraphics = {
      tiles: [
        tile
      ],
      images: [img],      
      probability: plfb.prob,
      builder: plfb.builder
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
    if (plfb.builder === undefined)
      plfb.builder = IB_IMAGE_SINGLE;
    GENERIC_SINGLE_PLFB(terrainGraphics, terrainList, undefined, imageStem, plfb);
  }

  var GENERIC_SINGLE_RANDOM_LFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, overlayList: Map<ETerrain, boolean>, imageStem: string, lfb: LFB) => {    
    GENERIC_SINGLE_PLFB(terrainGraphics, terrainList, overlayList, imageStem + "@V", {
      prob: 100,
      layer: lfb.layer,
      flag: lfb.flag,
      builder: lfb.builder
    });
  }

  export var OVERLAY_RANDOM_LFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, overlayList: Map<ETerrain, boolean>, imageStem: string, lfb: LFB) => {    
    GENERIC_SINGLE_RANDOM_LFB(terrainGraphics, terrainList, overlayList, imageStem , {
      layer: lfb.layer === undefined ? 0 : lfb.layer,
      flag: lfb.flag === undefined ? "overlay" : lfb.flag,
      builder: lfb.builder === undefined ? IB_IMAGE_SINGLE : lfb.builder,
    });
  }

  export var TERRAIN_BASE_RANDOM_LFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, imageStem: string, lfb: LFB) => {
    if (lfb.layer === undefined)
      lfb.layer = -1000;
    if (lfb.flag === undefined)
      lfb.flag = "base";
    if (lfb.builder === undefined)
      lfb.builder = IB_IMAGE_SINGLE;      
    GENERIC_SINGLE_RANDOM_LFB(terrainGraphics, terrainList, undefined, imageStem, lfb);
  }


  var BORDER_RESTRICTED_PLFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB) => {
    var img: WMLImage = {
      name: imageStem,
      postfix: "-@R0",
      layer: plfb.layer,
      center: {x: 36, y: 36},
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]      
    }

    var tile1: WMLTile = {
      q: 0,
      r: 0,
      type: adjacent,
      set_no_flag: [plfb.flag + "-@R0"]
    }

    var tile2: WMLTile = {
      q: 0,
      r: -1,
      type: terrainList,
      set_no_flag: [plfb.flag + "-@R3"]
    } 

    var terrainGraphic: WMLTerrainGraphics = {
      tiles: [
        tile1,
        tile2
      ],
      images: [img],
      probability: plfb.prob,
      rotations: ["n", "ne", "se", "s", "sw", "nw"],
      builder: plfb.builder
    }
    terrainGraphics.push(terrainGraphic);
  }

  var BORDER_RESTRICTED6_PLFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB) => {
    var img: WMLImage = {
      name: imageStem,
      postfix: "-@R0-@R1-@R2-@R3-@R4-@R5",      
      layer: plfb.layer,
      center: {x: 36, y: 36},
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
    }

    var tile1: WMLTile = {
      q: 0,
      r: 0,
      type: adjacent,
      set_no_flag: [plfb.flag + "-@R0", plfb.flag + "-@R1", plfb.flag + "-@R2", plfb.flag + "-@R3", plfb.flag + "-@R4", plfb.flag + "-@R5"]
    }

    var tile2: WMLTile = {
      q: 0,
      r: -1,
      type: terrainList,
      set_no_flag: [plfb.flag + "-@R3"]
    }

    var tile3: WMLTile = {
      q: 1,
      r: -1,
      type: terrainList,
      set_no_flag: [plfb.flag + "-@R4"]
    }    

    var tile4: WMLTile = {
      q: 1,
      r: 0,
      type: terrainList,
      set_no_flag: [plfb.flag + "-@R5"]
    }

    var tile5: WMLTile = {
      q: 0,
      r: 1,
      type: terrainList,
      set_no_flag: [plfb.flag + "-@R0"]
    }              

    var tile6: WMLTile = {
      q: -1,
      r: 1,
      type: terrainList,
      set_no_flag: [plfb.flag + "-@R1"]
    }

    var tile7: WMLTile = {
      q: -1,
      r: 0,
      type: terrainList,
      set_no_flag: [plfb.flag + "-@R2"]
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
      images: [img],
      set_no_flag: [],
      probability: plfb.prob,
      rotations: ["n", "ne", "se", "s", "sw", "nw"],
      builder: plfb.builder
    }
    terrainGraphics.push(terrainGraphic);
  }

  var BORDER_RESTRICTED5_PLFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB) => {
    var img: WMLImage = {
      name: imageStem,
      postfix: "-@R0-@R1-@R2-@R3-@R4",  
      layer: plfb.layer,
      center: {x: 36, y: 36},
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
    }

    var tile1: WMLTile = {
      q: 0,
      r: 0,
      type: adjacent,
      set_no_flag: [plfb.flag + "-@R0", plfb.flag + "-@R1", plfb.flag + "-@R2", plfb.flag + "-@R3", plfb.flag + "-@R4"]
    }

    var tile2: WMLTile = {
      q: 0,
      r: -1,
      type: terrainList,
      set_no_flag: [plfb.flag + "-@R3"]
    }

    var tile3: WMLTile = {
      q: 1,
      r: -1,
      type: terrainList,
      set_no_flag: [plfb.flag + "-@R4"]
    }    

    var tile4: WMLTile = {
      q: 1,
      r: 0,
      type: terrainList,
      set_no_flag: [plfb.flag + "-@R5"]
    }

    var tile5: WMLTile = {
      q: 0,
      r: 1,
      type: terrainList,
      set_no_flag: [plfb.flag + "-@R0"]
    }              

    var tile6: WMLTile = {
      q: -1,
      r: 1,
      type: terrainList,
      set_no_flag: [plfb.flag + "-@R1"]
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
      images: [img],
      set_no_flag: [],
      probability: plfb.prob,
      rotations: ["n", "ne", "se", "s", "sw", "nw"],
      builder: plfb.builder
    }
    terrainGraphics.push(terrainGraphic);
  }

  var BORDER_RESTRICTED4_PLFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB) => {
    var img: WMLImage = {
      name: imageStem,
      postfix: "-@R0-@R1-@R2-@R3",  
      layer: plfb.layer,
      center: {x: 36, y: 36},
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
    }

    var tile1: WMLTile = {
      q: 0,
      r: 0,
      type: adjacent,
      set_no_flag: [plfb.flag + "-@R0", plfb.flag + "-@R1", plfb.flag + "-@R2", plfb.flag + "-@R3"]
    }

    var tile2: WMLTile = {
      q: 0,
      r: -1,
      type: terrainList,
      set_no_flag: [plfb.flag + "-@R3"]
    }

    var tile3: WMLTile = {
      q: 1,
      r: -1,
      type: terrainList,
      set_no_flag: [plfb.flag + "-@R4"]
    }    

    var tile4: WMLTile = {
      q: 1,
      r: 0,
      type: terrainList,
      set_no_flag: [plfb.flag + "-@R5"]
    }

    var tile5: WMLTile = {
      q: 0,
      r: 1,
      type: terrainList,
      set_no_flag: [plfb.flag + "-@R0"]
    }              

    var terrainGraphic: WMLTerrainGraphics = {
      tiles: [
        tile1,
        tile2,
        tile3,
        tile4,
        tile5
      ],
      images: [img],      
      probability: plfb.prob,
      rotations: ["n", "ne", "se", "s", "sw", "nw"],
      builder: plfb.builder
    }
    terrainGraphics.push(terrainGraphic);
  }

  var BORDER_RESTRICTED3_PLFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB) => {
    var img: WMLImage = {
      name: imageStem,
      postfix: "-@R0-@R1-@R2",  
      layer: plfb.layer,
      center: {x: 36, y: 36},
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
    }

    var tile1: WMLTile = {
      q: 0,
      r: 0,
      type: adjacent,
      set_no_flag: [plfb.flag + "-@R0", plfb.flag + "-@R1", plfb.flag + "-@R2"]
    }

    var tile2: WMLTile = {
      q: 0,
      r: -1,
      type: terrainList,
      set_no_flag: [plfb.flag + "-@R3"]
    }

    var tile3: WMLTile = {
      q: 1,
      r: -1,
      type: terrainList,
      set_no_flag: [plfb.flag + "-@R4"]
    }    

    var tile4: WMLTile = {
      q: 1,
      r: 0,
      type: terrainList,
      set_no_flag: [plfb.flag + "-@R5"]
    }        

    var terrainGraphic: WMLTerrainGraphics = {
      tiles: [
        tile1,
        tile2,
        tile3,
        tile4
      ],
      images: [img],      
      probability: plfb.prob,
      rotations: ["n", "ne", "se", "s", "sw", "nw"],
      builder: plfb.builder
    }
    terrainGraphics.push(terrainGraphic);
  }

  var BORDER_RESTRICTED2_PLFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB) => {
    var img: WMLImage = {
      name: imageStem,
      postfix: "-@R0-@R1",  
      layer: plfb.layer,
      center: {x: 36, y: 36},
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
    }

    var tile1: WMLTile = {
      q: 0,
      r: 0,
      type: adjacent,
      set_no_flag: [plfb.flag + "-@R0", plfb.flag + "-@R1"]
    }

    var tile2: WMLTile = {
      q: 0,
      r: -1,
      type: terrainList,
      set_no_flag: [plfb.flag + "-@R3"]
    }

    var tile3: WMLTile = {
      q: 1,
      r: -1,
      type: terrainList,
      set_no_flag: [plfb.flag + "-@R4"]
    }    

    var terrainGraphic: WMLTerrainGraphics = {
      tiles: [
        tile1,
        tile2,
        tile3
      ],
      images: [img],      
      probability: plfb.prob,
      rotations: ["n", "ne", "se", "s", "sw", "nw"],
      builder: plfb.builder
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

  var BORDER_COMPLETE_LFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, lfb: LFB, grades: number) => {
    switch (grades) {
      case 6:
      BORDER_RESTRICTED6_RANDOM_LFB(terrainGraphics, terrainList, adjacent, imageStem, lfb);
      case 5:
      BORDER_RESTRICTED5_RANDOM_LFB(terrainGraphics, terrainList, adjacent, imageStem, lfb);
      case 4:
      BORDER_RESTRICTED4_RANDOM_LFB(terrainGraphics, terrainList, adjacent, imageStem, lfb);
      case 3:
      BORDER_RESTRICTED3_RANDOM_LFB(terrainGraphics, terrainList, adjacent, imageStem, lfb);
      case 2:
      BORDER_RESTRICTED2_RANDOM_LFB(terrainGraphics, terrainList, adjacent, imageStem, lfb);
      case 1:
      BORDER_RESTRICTED_RANDOM_LFB(terrainGraphics, terrainList, adjacent, imageStem, lfb);
    }
    

  }

  // grades is used by BORDER_COMPLETE, to filter out not needed macros.
  export var TRANSITION_COMPLETE_LFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, lfb: LFB, grades = 6) => {
    if (lfb.layer === undefined)
      lfb.layer = -500;
    if (lfb.flag === undefined)
      lfb.flag = "transition";
    if (lfb.builder === undefined)
      lfb.builder = IB_IMAGE_SINGLE;      
    BORDER_COMPLETE_LFB(terrainGraphics, terrainList, adjacent, imageStem, lfb, grades);
  }


  var GENERIC_SINGLEHEX_PLFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB) => {
    var img: WMLImage = {
      name: imageStem,
      layer: plfb.layer,
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
    }

    var tile: WMLTile = {
      q: 0,
      r: 0,
      type: terrainList,
      images: [img],
      set_no_flag: [plfb.flag]      
    }

    var terrainGraphic: WMLTerrainGraphics = {
      tiles: [
        tile
      ],
      probability: plfb.prob,
      builder: plfb.builder
    }
    terrainGraphics.push(terrainGraphic);    
  }

  export var TERRAIN_BASE_SINGLEHEX_PLFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB) => {
    if (plfb.prob === undefined)
      plfb.prob = 100;
    if (plfb.layer === undefined)
      plfb.layer = -1000;
    if (plfb.flag === undefined)
      plfb.flag = "base";
    if (plfb.builder === undefined)
      plfb.builder = IB_IMAGE_SINGLE;      
    GENERIC_SINGLEHEX_PLFB(terrainGraphics, terrainList, imageStem, plfb); 
  }

  export var ANIMATED_WATER_15_TRANSITION = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, layer: number) => {
    var img: WMLImage = {
      name: imageStem,
      postfix: "-@R0",
      layer: layer,
      variations: [""]      
    }

    var tile1: WMLTile = {
      q: 0,
      r: 0,
      type: adjacent,
      images: [img],
      set_no_flag: ["transition-@R0"]
    }

    var tile2: WMLTile = {
      q: 0,
      r: -1,
      type: terrainList,
    } 

    var terrainGraphic: WMLTerrainGraphics = {
      tiles: [
        tile1,
        tile2
      ],
      probability: 100,
      rotations: ["n", "ne", "se", "s", "sw", "nw"],
      builder: IB_ANIMATION_15_SLOW
    }
    terrainGraphics.push(terrainGraphic);
  }

  export var NEW_BEACH = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string) => {
    var concave_img1: WMLImage = {
      name: imageStem + "-concave",
      postfix: "-@R0-@R5",
      layer: -500,
      center: {x: 36, y: 36},
      variations: [""]
    }

    var concave_img2: WMLImage = {
      name: imageStem + "-concave",
      postfix: "-@R0-@R1",
      layer: -500,
      center: {x: 36, y: 36},
      variations: [""]
    }

    var concave_tile1: WMLTile = {
      q: 0,
      r: 0,
      type: adjacent,      
      set_no_flag: ["beach-@R0-@R5", "beach-@R0-@R1"]
    }

    var concave_tile2: WMLTile = {
      q: 0,
      r: -1,
      type: terrainList,
      set_no_flag: ["beach-@R2-@R3"]
    } 

    var concave_tile3: WMLTile = {
      q: 1,
      r: -1,
      type: terrainList,
      set_no_flag: ["beach-@R4-@R3"]
    } 

    var concave_terrainGraphic: WMLTerrainGraphics = {
      tiles: [
        concave_tile1,
        concave_tile2,
        concave_tile3
      ],
      images: [concave_img1, concave_img2],
      probability: 100,
      rotations: ["tr", "r", "br", "bl", "l", "tl"],      
      builder: IB_IMAGE_SINGLE
    }
    terrainGraphics.push(concave_terrainGraphic);
// ----------------------------------------------------

    var convex0_img1: WMLImage = {
      name: imageStem + "-convex",
      postfix: "-@R0-@R5",
      layer: -500,
      center: {x: 36, y: 36},
      variations: [""]
    }

    var convex0_img2: WMLImage = {
      name: imageStem + "-convex",
      postfix: "-@R0-@R1",
      layer: -500,
      center: {x: 36, y: 36},
      variations: [""]
    }

    var convex0_tile1: WMLTile = {
      q: 0,
      r: 0,
      type: terrainList,
      set_no_flag: ["beach-@R0-@R5", "beach-@R0-@R1"]
    }

    var convex0_tile2: WMLTile = {
      q: 0,
      r: -1,
      type: adjacent,
      set_no_flag: ["beach-@R2-@R3"]
    } 

    var convex0_tile3: WMLTile = {
      q: 1,
      r: -1,
      type: adjacent,
      set_no_flag: ["beach-@R4-@R3"]
    } 

    var convex0_terrainGraphic: WMLTerrainGraphics = {
      tiles: [
        convex0_tile1,
        convex0_tile2,
        convex0_tile3
      ],
      images: [convex0_img1, convex0_img2],
      probability: 100,
      rotations: ["tr", "r", "br", "bl", "l", "tl"],      
      builder: IB_IMAGE_SINGLE
    }
    terrainGraphics.push(convex0_terrainGraphic);
// ----------------------------------------------------
    var convex1_img1: WMLImage = {
      name: imageStem + "-convex",
      postfix: "-@R0-@R5",
      layer: -500,
      center: {x: 36, y: 36},
      variations: [""]
    }

    var convex1_tile1: WMLTile = {
      q: 0,
      r: 0,
      type: terrainList,
      set_no_flag: ["beach-@R0-@R5"]
    }

    var convex1_tile2: WMLTile = {
      q: 0,
      r: -1,
      type: adjacent,
      set_no_flag: ["beach-@R2-@R3"]
    } 

    var convex1_tile3: WMLTile = {
      q: 1,
      r: -1,
      type: swapTerrainTypes(sumTerrainMaps(adjacent, terrainList)),
    } 

    var convex1_terrainGraphic: WMLTerrainGraphics = {
      tiles: [
        convex1_tile1,
        convex1_tile2,
        convex1_tile3
      ],
      images: [convex1_img1],
      probability: 100,
      rotations: ["tr", "r", "br", "bl", "l", "tl"],      
      builder: IB_IMAGE_SINGLE
    }
    terrainGraphics.push(convex1_terrainGraphic);

// ----------------------------------------------------
    var convex2_img1: WMLImage = {
      name: imageStem + "-convex",
      postfix: "-@R0-@R1",
      layer: -500,
      center: {x: 36, y: 36},
      variations: [""]
    }

    var convex2_tile1: WMLTile = {
      q: 0,
      r: 0,
      type: terrainList,

      set_no_flag: ["beach-@R0-@R1"]
    }

    var convex2_tile2: WMLTile = {
      q: 0,
      r: -1,
      type: swapTerrainTypes(sumTerrainMaps(adjacent, terrainList)),
    } 

    var convex2_tile3: WMLTile = {
      q: 1,
      r: -1,
      type: adjacent,
      set_no_flag: ["beach-@R4-@R3"]
    } 

    var convex2_terrainGraphic: WMLTerrainGraphics = {
      tiles: [
        convex2_tile1,
        convex2_tile2,
        convex2_tile3
      ],
      images: [convex2_img1],      
      probability: 100,
      rotations: ["tr", "r", "br", "bl", "l", "tl"],      
      builder: IB_IMAGE_SINGLE
    }
    terrainGraphics.push(convex2_terrainGraphic);        
  }

  export var NEW_WAVES = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, layer: number, imageStem: string) => {
    var convex_img1: WMLImage = {
      name: imageStem + "-convex",
      postfix: "-@R0",
      layer: layer,
      center: {x: 36, y: 36},
      variations: [""]
    }

    var convex_tile1: WMLTile = {
      q: 0,
      r: 0,
      type: terrainList,
      set_no_flag: ["waves-@R0"]
    }

    var convex_tile2: WMLTile = {
      q: 0,
      r: -1,
      type: adjacent,
      set_no_flag: ["waves-@R2"]
    } 

    var convex_tile3: WMLTile = {
      q: 1,
      r: -1,
      type: adjacent,
      set_no_flag: ["waves-@R4"]
    } 

    var convex_terrainGraphic: WMLTerrainGraphics = {
      tiles: [
        convex_tile1,
        convex_tile2,
        convex_tile3
      ],
      images: [convex_img1],
      probability: 100,
      rotations: ["tr", "r", "br", "bl", "l", "tl"],      
      builder: IB_ANIMATION_06
    }
    terrainGraphics.push(convex_terrainGraphic);
// ----------------------------------------------------

    var concave_img1: WMLImage = {
      name: imageStem + "-concave",
      postfix: "-@R0",
      layer: layer,
      center: {x: 36, y: 36},
      variations: [""]
    }

    var concave_tile1: WMLTile = {
      q: 0,
      r: 0,
      type: adjacent,      
      set_no_flag: ["waves-@R0"]
    }

    var concave_tile2: WMLTile = {
      q: 0,
      r: -1,
      type: terrainList,
      set_no_flag: ["waves-@R2"]
    } 

    var concave_tile3: WMLTile = {
      q: 1,
      r: -1,
      type: terrainList,
      set_no_flag: ["waves-@R4"]
    } 

    var concave_terrainGraphic: WMLTerrainGraphics = {
      tiles: [
        concave_tile1,
        concave_tile2,
        concave_tile3
      ],
      images: [concave_img1],      
      probability: 100,
      rotations: ["tr", "r", "br", "bl", "l", "tl"],      
      builder: IB_ANIMATION_06
    }
    terrainGraphics.push(concave_terrainGraphic);

  }

  export var MOUNTAIN_SINGLE = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, imageStem: string, prob: number, flag: string) => {
    var img: WMLImage = {
      name: imageStem,
      base: {x: 90 - 54, y: 107 - 72},
      layer: 0,
      center: {x: 90 - 54, y: 108 - 72},
      variations: ["", "2", "3", "4", "5", "6"],
    }

    var tile: WMLTile = {
      q: 0,
      r: 0,
      type: terrainList,
      set_no_flag: [flag]      
    }

    var terrainGraphic: WMLTerrainGraphics = {
      tiles: [tile],
      images: [img],
      probability: prob,
      builder: IB_IMAGE_SINGLE
    }
    terrainGraphics.push(terrainGraphic);
  }

  var GENERIC_RESTRICTED3_RANDOM_LFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, lfb: LFB, rotation: string) => {
    GENERIC_RESTRICTED3_PLFB(terrainGraphics, terrainList, adjacent, imageStem + "@V", {
      layer: lfb.layer,
      prob: 100,
      flag: lfb.flag,
      builder: lfb.builder
    }, rotation);
  }

  var GENERIC_RESTRICTED2_RANDOM_LFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, lfb: LFB, rotation: string) => {
    GENERIC_RESTRICTED2_PLFB(terrainGraphics, terrainList, adjacent, imageStem + "@V", {
      layer: lfb.layer,
      prob: 100,
      flag: lfb.flag,
      builder: lfb.builder
    }, rotation);
  }

  var GENERIC_RESTRICTED_RANDOM_LFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, lfb: LFB, rotation: string) => {
    GENERIC_RESTRICTED_PLFB(terrainGraphics, terrainList, adjacent, imageStem + "@V", {
      layer: lfb.layer,
      prob: 100,
      flag: lfb.flag,
      builder: lfb.builder
    }, rotation);
  }

  var GENERIC_COMPLETE_LFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, lfb: LFB) => {
    GENERIC_RESTRICTED3_RANDOM_LFB(terrainGraphics, terrainList, adjacent, imageStem + "-small", lfb, "-@R0-@R1-@R2");
    GENERIC_RESTRICTED3_RANDOM_LFB(terrainGraphics, terrainList, adjacent, imageStem + "-small", lfb, "");
    GENERIC_RESTRICTED2_RANDOM_LFB(terrainGraphics, terrainList, adjacent, imageStem + "-small", lfb, "-@R0-@R1");
    GENERIC_RESTRICTED2_RANDOM_LFB(terrainGraphics, terrainList, adjacent, imageStem + "-small", lfb, "");    
    GENERIC_RESTRICTED_RANDOM_LFB(terrainGraphics, terrainList, adjacent, imageStem + "-small", lfb, "-@R0");
    GENERIC_RESTRICTED_RANDOM_LFB(terrainGraphics, terrainList, adjacent, imageStem + "-small", lfb, "");        
    GENERIC_SINGLE_RANDOM_LFB(terrainGraphics, terrainList, undefined, imageStem, lfb);
  }

  export var OVERLAY_COMPLETE_LFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, lfb: LFB) => {
    GENERIC_COMPLETE_LFB(terrainGraphics, terrainList, adjacent, imageStem, {
      layer: lfb.layer === undefined ? 0: lfb.layer,
      flag: lfb.flag === undefined ? "overlay" : lfb.flag,
      builder: lfb.builder === undefined ? IB_IMAGE_SINGLE: lfb.builder,
    });
  }

  export var MOUNTAIN_SINGLE_RANDOM = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, imageStem: string, flag: string) => {
    MOUNTAIN_SINGLE(terrainGraphics, terrainList, imageStem + "@V", 100, flag);
  }

  var GENERIC_RESTRICTED3_N_NE_SE_PLFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB, rotation: string) => {
    var img: WMLImage = {
      name: imageStem,
      postfix: rotation,
      layer: plfb.layer,
      base: {x: 90 - 90, y: 108 - 144},
      center: {x: 90 - 54, y: 108 - 72},
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
    }

    var tile1: WMLTile = {
      q: 0,
      r: 0,
      type: terrainList,      
      set_no_flag: [plfb.flag]
    }

    var tile2: WMLTile = {
      q: 0,
      r: -1,
      type: adjacent
    } 

    var tile3: WMLTile = {
      q: 1,
      r: -1,
      type: adjacent
    } 

    var tile4: WMLTile = {
      q: 1,
      r: 0,
      type: adjacent
    } 

    var terrainGraphic: WMLTerrainGraphics = {
      tiles: [
        tile1,
        tile2,
        tile3,
        tile4
      ],
      images: [img],
      probability: plfb.prob,
      rotations: ["n", "ne", "se", "s", "sw", "nw"],
      builder: plfb.builder
    }
    terrainGraphics.push(terrainGraphic);

  }

  var GENERIC_RESTRICTED3_N_NE_S_PLFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB, rotation: string) => {
    var img: WMLImage = {
      name: imageStem,
      postfix: rotation,
      layer: plfb.layer,
      base: {x: 90 - 90, y: 108 - 144},
      center: {x: 90 - 54, y: 108 - 72},
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
    }

    var tile1: WMLTile = {
      q: 0,
      r: 0,
      type: terrainList,      
      set_no_flag: [plfb.flag]
    }

    var tile2: WMLTile = {
      q: 0,
      r: -1,
      type: adjacent
    } 

    var tile3: WMLTile = {
      q: 1,
      r: -1,
      type: adjacent
    } 

    var tile4: WMLTile = {
      q: 0,
      r: 1,
      type: adjacent
    } 

    var terrainGraphic: WMLTerrainGraphics = {
      tiles: [
        tile1,
        tile2,
        tile3,
        tile4
      ],
      images: [img],
      probability: plfb.prob,
      rotations: ["n", "ne", "se", "s", "sw", "nw"],
      builder: plfb.builder
    }
    terrainGraphics.push(terrainGraphic);

  }

  var GENERIC_RESTRICTED3_N_NE_SW_PLFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB, rotation: string) => {
    var img: WMLImage = {
      name: imageStem,
      postfix: rotation,
      layer: plfb.layer,
      base: {x: 90 - 90, y: 108 - 144},
      center: {x: 90 - 54, y: 108 - 72},
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
    }

    var tile1: WMLTile = {
      q: 0,
      r: 0,
      type: terrainList,      
      set_no_flag: [plfb.flag]
    }

    var tile2: WMLTile = {
      q: 0,
      r: -1,
      type: adjacent
    } 

    var tile3: WMLTile = {
      q: 1,
      r: -1,
      type: adjacent
    } 

    var tile4: WMLTile = {
      q: -1,
      r: 1,
      type: adjacent
    } 

    var terrainGraphic: WMLTerrainGraphics = {
      tiles: [
        tile1,
        tile2,
        tile3,
        tile4
      ],
      images: [img],
      probability: plfb.prob,
      rotations: ["n", "ne", "se", "s", "sw", "nw"],
      builder: plfb.builder
    }
    terrainGraphics.push(terrainGraphic);    
  }

  var GENERIC_RESTRICTED3_N_SE_SW_PLFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB, rotation: string) => {
    var img: WMLImage = {
      name: imageStem,
      postfix: rotation,
      layer: plfb.layer,
      base: {x: 90 - 90, y: 108 - 144},
      center: {x: 90 - 54, y: 108 - 72},
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
    }

    var tile1: WMLTile = {
      q: 0,
      r: 0,
      type: terrainList,      
      set_no_flag: [plfb.flag]
    }

    var tile2: WMLTile = {
      q: 0,
      r: -1,
      type: adjacent
    } 

    var tile3: WMLTile = {
      q: 1,
      r: 0,
      type: adjacent
    } 

    var tile4: WMLTile = {
      q: -1,
      r: 1,
      type: adjacent
    } 

    var terrainGraphic: WMLTerrainGraphics = {
      tiles: [
        tile1,
        tile2,
        tile3,
        tile4
      ],
      images: [img],
      probability: plfb.prob,
      rotations: ["n", "ne", "se", "s", "sw", "nw"],
      builder: plfb.builder
    }
    terrainGraphics.push(terrainGraphic);    
  }

  var GENERIC_RESTRICTED3_PLFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB, rotation: string) => {
    GENERIC_RESTRICTED3_N_NE_SE_PLFB(terrainGraphics, terrainList, adjacent, imageStem, plfb, rotation);
    GENERIC_RESTRICTED3_N_NE_S_PLFB(terrainGraphics, terrainList, adjacent, imageStem, plfb, rotation);
    GENERIC_RESTRICTED3_N_NE_SW_PLFB(terrainGraphics, terrainList, adjacent, imageStem, plfb, rotation);
    GENERIC_RESTRICTED3_N_SE_SW_PLFB(terrainGraphics, terrainList, adjacent, imageStem, plfb, rotation);
  }


  export var OVERLAY_RESTRICTED2_PLFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB) => {
    GENERIC_RESTRICTED2_PLFB(terrainGraphics, terrainList, adjacent, imageStem, {
      prob: plfb.prob === undefined ? 100: plfb.prob,
      layer: plfb.layer === undefined ? 0: plfb.layer,
      flag: plfb.flag === undefined ? "overlay" : plfb.flag,
      builder: plfb.builder === undefined ? IB_IMAGE_SINGLE: plfb.builder,
    }, "");
  }

  export var OVERLAY_RESTRICTED3_PLFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB) => {
    GENERIC_RESTRICTED3_PLFB(terrainGraphics, terrainList, adjacent, imageStem, {
      prob: plfb.prob === undefined ? 100: plfb.prob,
      layer: plfb.layer === undefined ? 0: plfb.layer,
      flag: plfb.flag === undefined ? "overlay" : plfb.flag,
      builder: plfb.builder === undefined ? IB_IMAGE_SINGLE: plfb.builder,
    }, "");
  }

  var GENERIC_RESTRICTED2_N_NE_PLFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB, rotation: string) => {
    var img: WMLImage = {
      name: imageStem,
      postfix: rotation,
      layer: plfb.layer,
      base: {x: 90 - 90, y: 108 - 144},
      center: {x: 90 - 54, y: 108 - 72},
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
    }

    var tile1: WMLTile = {
      q: 0,
      r: 0,
      type: terrainList,      
      set_no_flag: [plfb.flag]
    }

    var tile2: WMLTile = {
      q: 0,
      r: -1,
      type: adjacent
    } 

    var tile3: WMLTile = {
      q: 1,
      r: -1,
      type: adjacent
    } 

    var terrainGraphic: WMLTerrainGraphics = {
      tiles: [
        tile1,
        tile2,
        tile3,
      ],
      images: [img],
      probability: plfb.prob,
      rotations: ["n", "ne", "se", "s", "sw", "nw"],
      builder: plfb.builder
    }
    terrainGraphics.push(terrainGraphic);

  }

  var GENERIC_RESTRICTED2_N_SE_PLFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB, rotation: string) => {
    var img: WMLImage = {
      name: imageStem,
      postfix: rotation,
      layer: plfb.layer,
      base: {x: 90 - 90, y: 108 - 144},
      center: {x: 90 - 54, y: 108 - 72},
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
    }

    var tile1: WMLTile = {
      q: 0,
      r: 0,
      type: terrainList,      
      set_no_flag: [plfb.flag]
    }

    var tile2: WMLTile = {
      q: 0,
      r: -1,
      type: adjacent
    } 


    var tile3: WMLTile = {
      q: 1,
      r: 0,
      type: adjacent
    } 

    var terrainGraphic: WMLTerrainGraphics = {
      tiles: [
        tile1,
        tile2,
        tile3,
      ],
      images: [img],
      probability: plfb.prob,
      rotations: ["n", "ne", "se", "s", "sw", "nw"],
      builder: plfb.builder
    }
    terrainGraphics.push(terrainGraphic);

  }

  var GENERIC_RESTRICTED2_N_S_PLFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB, rotation: string) => {
    var img: WMLImage = {
      name: imageStem,
      postfix: rotation,
      layer: plfb.layer,
      base: {x: 90 - 90, y: 108 - 144},
      center: {x: 90 - 54, y: 108 - 72},
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
    }

    var tile1: WMLTile = {
      q: 0,
      r: 0,
      type: terrainList,      
      set_no_flag: [plfb.flag]
    }

    var tile2: WMLTile = {
      q: 0,
      r: -1,
      type: adjacent
    } 

    var tile3: WMLTile = {
      q: 0,
      r: 1,
      type: adjacent
    } 

    var terrainGraphic: WMLTerrainGraphics = {
      tiles: [
        tile1,
        tile2,
        tile3,
      ],
      images: [img],
      probability: plfb.prob,
      rotations: ["n", "ne", "se", "s", "sw", "nw"],
      builder: plfb.builder
    }
    terrainGraphics.push(terrainGraphic);    
  }

  export var OVERLAY_PLFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, overlayList: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB) => {
    GENERIC_SINGLE_PLFB(terrainGraphics, terrainList, overlayList, imageStem, {
      prob: plfb.prob === undefined ? 100: plfb.prob,
      layer: plfb.layer === undefined ? 0: plfb.layer,
      flag: plfb.flag === undefined ? "overlay" : plfb.flag,
      builder: plfb.builder === undefined ? IB_IMAGE_SINGLE: plfb.builder,
    });
  }

  var GENERIC_RESTRICTED2_PLFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB, rotation: string) => {
    GENERIC_RESTRICTED2_N_NE_PLFB(terrainGraphics, terrainList, adjacent, imageStem, plfb, rotation);
    GENERIC_RESTRICTED2_N_SE_PLFB(terrainGraphics, terrainList, adjacent, imageStem, plfb, rotation);
    GENERIC_RESTRICTED2_N_S_PLFB(terrainGraphics, terrainList, adjacent, imageStem, plfb, rotation);
  }

  export var OVERLAY_ROTATION_RESTRICTED2_PLFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB) => {
    GENERIC_RESTRICTED2_PLFB(terrainGraphics, terrainList, adjacent, imageStem, {
      prob: plfb.prob === undefined ? 100: plfb.prob,
      layer: plfb.layer === undefined ? 0: plfb.layer,
      flag: plfb.flag === undefined ? "overlay" : plfb.flag,
      builder: plfb.builder === undefined ? IB_IMAGE_SINGLE: plfb.builder,
    }, "-@R0-@R1");
  }

  var GENERIC_RESTRICTED_PLFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB, rotation: string) => {
    var img: WMLImage = {
      name: imageStem,
      postfix: rotation,
      layer: plfb.layer,
      base: {x: 90 - 90, y: 108 - 144},
      center: {x: 90 - 54, y: 108 - 72},
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
    }

    var tile1: WMLTile = {
      q: 0,
      r: 0,
      type: terrainList,      
      set_no_flag: [plfb.flag]
    }

    var tile2: WMLTile = {
      q: 0,
      r: -1,
      type: adjacent
    } 

    var terrainGraphic: WMLTerrainGraphics = {
      tiles: [
        tile1,
        tile2,
      ],
      images: [img],
      probability: plfb.prob,
      rotations: ["n", "ne", "se", "s", "sw", "nw"],
      builder: plfb.builder
    }
    terrainGraphics.push(terrainGraphic);    
  }

  export var OVERLAY_ROTATION_RESTRICTED_PLFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB) => {
    GENERIC_RESTRICTED_PLFB(terrainGraphics, terrainList, adjacent, imageStem, {
      prob: plfb.prob === undefined ? 100: plfb.prob,
      layer: plfb.layer === undefined ? 0: plfb.layer,
      flag: plfb.flag === undefined ? "overlay" : plfb.flag,
      builder: plfb.builder === undefined ? IB_IMAGE_SINGLE: plfb.builder,
    }, "-@R0");
  }

  export var MOUNTAINS_2x4_NW_SE = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, imageStem: string, flag: string, prob: number) => {
    var center = {x: 198 - 54, y: 180 - 108}
    var img1: WMLImage = {
      name: imageStem + "_1",
      postfix: "",
      layer: 0,
      center: center,
      base: {x: 88 - 54, y: 107 - 108},
      variations: [""]
    }

    var img2: WMLImage = {
      name: imageStem + "_2",
      postfix: "",
      layer: 0,
      center: center,
      base: {x: 144 - 54, y: 107 - 108},
      variations: [""]
    }    

    var img3: WMLImage = {
      name: imageStem + "_3",
      postfix: "",
      center: center,
      layer: 0,
      base: {x: 196 - 54, y: 107 - 108},
      variations: [""]
    }    

    var img4: WMLImage = {
      name: imageStem + "_4",
      postfix: "",
      center: center,
      layer: 0,
      base: {x: 248 - 54, y: 107 - 108},
      variations: [""]
    }    

    var img5: WMLImage = {
      name: imageStem + "_5",
      postfix: "",
      center: center,
      layer: 0,
      base: {x: 304 - 54, y: 107 - 108},
      variations: [""]
    }    

    var terrainGraphic: WMLTerrainGraphics = {
      tiles: [],
      images: [img1, img2, img3, img4, img5],
      probability: prob,
      builder: IB_IMAGE_SINGLE
    }

    for (var i = 0; i < 4; i++) {
      terrainGraphic.tiles.push({
        q: i,
        r: 0,
        type: terrainList,      
        set_no_flag: [flag]
      });
      terrainGraphic.tiles.push({
        q: i + 1,
        r: -1,
        type: terrainList,      
        set_no_flag: [flag]
      });
    }

    terrainGraphics.push(terrainGraphic);     
  }

  export var MOUNTAINS_1x3_NW_SE = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, imageStem: string, flag: string, prob: number) => {
    var center = {x: 144 - 54, y: 162 - 108}
    var img1: WMLImage = {
      name: imageStem + "_1",
      postfix: "",
      layer: 0,
      center: center,
      base: {x: 88 - 54, y: 128 - 108},
      variations: [""]
    }

    var img2: WMLImage = {
      name: imageStem + "_2",
      postfix: "",
      layer: 0,
      center: center,
      base: {x: 142 - 54, y: 144 - 108},
      variations: [""]
    }    

    var img3: WMLImage = {
      name: imageStem + "_3",
      postfix: "",
      layer: 0,
      center: center,
      base: {x: 196 - 54, y: 180 - 108},
      variations: [""]
    }      

    var terrainGraphic: WMLTerrainGraphics = {
      tiles: [],
      images: [img1, img2, img3],
      probability: prob,
      builder: IB_IMAGE_SINGLE
    }

    for (var i = 0; i < 3; i++) {
      terrainGraphic.tiles.push({
        q: i,
        r: 0,
        type: terrainList,      
        set_no_flag: [flag]
      });
    }

    terrainGraphics.push(terrainGraphic);     
  }

  export var MOUNTAINS_2x4_SW_NE = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, imageStem: string, flag: string, prob: number) => {
    var center = {x: 198 - 216, y: 180 - 72}
    var img1: WMLImage = {
      name: imageStem + "_1",
      postfix: "",
      layer: 0,
      center: center,
      base: {x: 88 - 216, y: 107 - 72},
      variations: [""]
    }

    var img2: WMLImage = {
      name: imageStem + "_2",
      postfix: "",
      layer: 0,
      center: center,
      base: {x: 144 - 216, y: 107 - 72},
      variations: [""]
    }    

    var img3: WMLImage = {
      name: imageStem + "_3",
      postfix: "",
      layer: 0,
      center: center,
      base: {x: 196 - 216, y: 107 - 72},
      variations: [""]
    }    

    var img4: WMLImage = {
      name: imageStem + "_4",
      postfix: "",
      layer: 0,
      center: center,
      base: {x: 248 - 216, y: 107 - 72},
      variations: [""]
    }    

    var img5: WMLImage = {
      name: imageStem + "_5",
      postfix: "",
      layer: 0,
      center: center,
      base: {x: 304 - 216, y: 107 - 72},
      variations: [""]
    }    

    var terrainGraphic: WMLTerrainGraphics = {
      tiles: [],
      images: [img1, img2, img3, img4, img5],
      probability: prob,
      builder: IB_IMAGE_SINGLE
    }

    for (var i = 0; i < 4; i++) {
      terrainGraphic.tiles.push({
        q: -i,
        r: i,
        type: terrainList,      
        set_no_flag: [flag]
      });
      terrainGraphic.tiles.push({
        q: 1 -i,
        r: i,
        type: terrainList,      
        set_no_flag: [flag]
      });
    }

    terrainGraphics.push(terrainGraphic);     
  }

  export var MOUNTAINS_1x3_SW_NE = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, imageStem: string, flag: string, prob: number) => {
    var center = {x: 144 - 162, y: 162 - 108}
    var img1: WMLImage = {
      name: imageStem + "_1",
      postfix: "",
      layer: 0,
      center: center,
      base: {x: 88 - 162, y: 180 - 108},
      variations: [""]
    }

    var img2: WMLImage = {
      name: imageStem + "_2",
      postfix: "",
      layer: 0,
      center: center,
      base: {x: 142 - 162, y: 144 - 108},
      variations: [""]
    }    

    var img3: WMLImage = {
      name: imageStem + "_3",
      postfix: "",
      layer: 0,
      center: center,
      base: {x: 196 - 162, y: 128 - 108},
      variations: [""]
    }      

    var terrainGraphic: WMLTerrainGraphics = {
      tiles: [],
      images: [img1, img2, img3],
      probability: prob,
      builder: IB_IMAGE_SINGLE
    }

    for (var i = 0; i < 3; i++) {
      terrainGraphic.tiles.push({
        q: -i,
        r: i,
        type: terrainList,      
        set_no_flag: [flag]
      });
    }

    terrainGraphics.push(terrainGraphic);     
  }

  export var MOUNTAINS_2x2 = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, imageStem: string, flag: string, prob: number) => {
    var center = {x: 144 - 108, y: 144 - 72}
    var img1: WMLImage = {
      name: imageStem + "_1",
      postfix: "",
      layer: 0,
      center: center,
      base: {x: 88 - 108, y: 107 - 72},
      variations: [""]
    }

    var img2: WMLImage = {
      name: imageStem + "_2",
      postfix: "",
      layer: 0,
      center: center,
      base: {x: 142 - 108, y: 72 - 72},
      variations: [""]
    }    

    var img3: WMLImage = {
      name: imageStem + "_3",
      postfix: "",
      layer: 0,
      center: center,
      base: {x: 196 - 108, y: 107 - 72},
      variations: [""]
    }      

    var terrainGraphic: WMLTerrainGraphics = {
      tiles: [],
      images: [img1, img2, img3],
      probability: prob,
      builder: IB_IMAGE_SINGLE
    }

    for (var i = 0; i < 2; i++) {
      terrainGraphic.tiles.push({
        q: -i,
        r: i,
        type: terrainList,      
        set_no_flag: [flag]
      });
      terrainGraphic.tiles.push({
        q: 1 -i,
        r: i,
        type: terrainList,      
        set_no_flag: [flag]
      });    
    }

    terrainGraphics.push(terrainGraphic);     
  } 

  export var VOLCANO_2x2 = (terrainGraphics: WMLTerrainGraphics[], volcano: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, flag: string) => {
    var center = {x: 144 - 108, y: 144 - 72}
    var img1: WMLImage = {
      name: imageStem + "_1",
      postfix: "",
      layer: 0,
      center: center,
      base: {x: 88 - 108, y: 107 - 72},
      variations: [""]
    }

    var img2: WMLImage = {
      name: imageStem + "_2",
      postfix: "",
      layer: 0,
      center: center,
      base: {x: 142 - 108, y: 72 - 72},
      variations: [""]
    }    

    var img3: WMLImage = {
      name: imageStem + "_3",
      postfix: "",
      center: center,
      layer: 0,
      base: {x: 196 - 108, y: 107 - 72},
      variations: [""]
    }      

    var terrainGraphic: WMLTerrainGraphics = {
      tiles: [],
      images: [img1, img2, img3],
      probability: 100,
      builder: IB_IMAGE_SINGLE
    }

    terrainGraphic.tiles.push({
      q: 0,
      r: 0,
      type: volcano,      
      set_no_flag: [flag]
    });
    terrainGraphic.tiles.push({
      q: 1,
      r: 0,
      type: adjacent,      
      set_no_flag: [flag]
    });    

    terrainGraphic.tiles.push({
      q: -1,
      r: 1,
      type: adjacent,      
      set_no_flag: [flag]
    });
    terrainGraphic.tiles.push({
      q: 0,
      r: 1,
      type: adjacent,      
      set_no_flag: [flag]
    });    

    terrainGraphics.push(terrainGraphic);     
  } 

  // export var DISABLE_BASE_TRANSITIONS = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>) => {
  //   DISABLE_BASE_TRANSITIONS_F(terrainGraphics, terrainList, "transition");
  // }

  // export var DISABLE_BASE_TRANSITIONS_F = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, flag: string) => {
  //   var terrainGraphic: WMLTerrainGraphics = {
  //     tiles: [],
  //     images: [],
  //     probability: 100,
  //     builder: IB_IMAGE_SINGLE
  //   }

  //   terrainGraphic.tiles.push({
  //     q: 0,
  //     r: 0,
  //     type: terrainList,      
  //     set_flag: [flag + "-n", flag + "-ne", flag + "-se", flag + "-s", flag + "-sw", flag + "-nw"]
  //   });

  //   terrainGraphics.push(terrainGraphic);
  // }

  export var CORNER_PLFB_CONVEX = (terrainGraphics: WMLTerrainGraphics[], terrainList1: Map<ETerrain, boolean>, adjacent1: Map<ETerrain, boolean>, 
    adjacent2: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB) => {
 
    // 0 ["tr", "r", "br", "bl", "l", "tl"]
    terrainGraphics.push({
      tiles: [{
          q: 0,
          r: 0,
          type: terrainList1,      
          set_no_flag: [plfb.flag + "-tr"]
        }, {
          q: 0,
          r: -1,
          type: adjacent1,
          set_no_flag: [plfb.flag + "-br"]
        }, {
          q: 1,
          r: -1,
          type: adjacent2,
          set_no_flag: [plfb.flag + "-l"]
        }
      ],
      images: [{
          name: imageStem,
          postfix: "-tr",
          layer: plfb.layer,
          center: {x: 72-9, y: 0},
          variations: [""]
        }],
      probability: plfb.prob,
      builder: plfb.builder
    });

    // 1 ["tr", "r", "br", "bl", "l", "tl"]
    terrainGraphics.push({
      tiles: [{
          q: 0,
          r: 0,
          type: terrainList1,      
          set_no_flag: [plfb.flag + "-r"]
        }, {
          q: 1,
          r: -1,
          type: adjacent1,
          set_no_flag: [plfb.flag + "-bl"]
        }, {
          q: 1,
          r: 0,
          type: adjacent2,
          set_no_flag: [plfb.flag + "-tl"]
        }
      ],
      images: [{
          name: imageStem,
          postfix: "-r",
          layer: plfb.layer,
          center: {x: 72-9, y: 18},
          variations: [""]
        }],
      probability: plfb.prob,
      builder: plfb.builder
    });

    // 2 ["tr", "r", "br", "bl", "l", "tl"]
    terrainGraphics.push({
      tiles: [{
          q: 0,
          r: 0,
          type: terrainList1,      
          set_no_flag: [plfb.flag + "-br"]
        }, {
          q: 1,
          r: 0,
          type: adjacent1,
          set_no_flag: [plfb.flag + "-l"]
        }, {
          q: 0,
          r: 1,
          type: adjacent2,
          set_no_flag: [plfb.flag + "-tr"]
        }
      ],
      images: [{
          name: imageStem,
          postfix: "-br",
          layer: plfb.layer,
          center: {x: 54, y: 54+9},
          variations: [""]
        }],
      probability: plfb.prob,
      builder: plfb.builder
    });

    // 3 ["tr", "r", "br", "bl", "l", "tl"]
    terrainGraphics.push({
      tiles: [{
          q: 0,
          r: 0,
          type: terrainList1,      
          set_no_flag: [plfb.flag + "-bl"]
        }, {
          q: 0,
          r: 1,
          type: adjacent1,
          set_no_flag: [plfb.flag + "-tl"]
        }, {
          q: -1,
          r: 1,
          type: adjacent2,
          set_no_flag: [plfb.flag + "-r"]
        }
      ],
      images: [{
          name: imageStem,
          postfix: "-bl",
          layer: plfb.layer,
          center: {x: 0, y: 36+9},
          variations: [""]
        }],
      probability: plfb.prob,
      builder: plfb.builder
    });

    // 4 ["tr", "r", "br", "bl", "l", "tl"]
    terrainGraphics.push({
      tiles: [{
          q: 0,
          r: 0,
          type: terrainList1,      
          set_no_flag: [plfb.flag + "-l"]
        }, {
          q: -1,
          r: 1,
          type: adjacent1,
          set_no_flag: [plfb.flag + "-tr"]
        }, {
          q: -1,
          r: 0,
          type: adjacent2,
          set_no_flag: [plfb.flag + "-br"]
        }
      ],
      images: [{
          name: imageStem,
          postfix: "-l",
          layer: plfb.layer,
          center: {x: 0, y: 27},
          variations: [""]
        }],
      probability: plfb.prob,
      builder: plfb.builder
    });

    // 5 ["tr", "r", "br", "bl", "l", "tl"]
    terrainGraphics.push({
      tiles: [{
          q: 0,
          r: 0,
          type: terrainList1,      
          set_no_flag: [plfb.flag + "-tl"]
        }, {
          q: -1,
          r: 0,
          type: adjacent1,
          set_no_flag: [plfb.flag + "-r"]
        }, {
          q: 0,
          r: -1,
          type: adjacent2,
          set_no_flag: [plfb.flag + "-bl"]
        }
      ],
      images: [{
          name: imageStem,
          postfix: "-tl",
          layer: plfb.layer,
          center: {x: 9, y: -18},
          variations: [""]
        }],
      probability: plfb.prob,
      builder: plfb.builder
    });
  }

  export var CORNER_PLFB_CONCAVE = (terrainGraphics: WMLTerrainGraphics[], terrainList1: Map<ETerrain, boolean>, adjacent1: Map<ETerrain, boolean>, 
    adjacent2: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB) => {
 
    // 0 ["tr", "r", "br", "bl", "l", "tl"]
    terrainGraphics.push({
      tiles: [{
          q: 0,
          r: 0,
          type: terrainList1,      
          set_no_flag: [plfb.flag + "-tr"]
        }, {
          q: 0,
          r: -1,
          type: adjacent1,
          set_no_flag: [plfb.flag + "-br"]
        }, {
          q: 1,
          r: -1,
          type: adjacent2,
          set_no_flag: [plfb.flag + "-l"]
        }
      ],
      images: [{
          name: imageStem,
          postfix: "-tr",
          layer: plfb.layer,
          center: {x: 72-9, y: 0},
          variations: [""]
        }],
      probability: plfb.prob,
      builder: plfb.builder
    });

    // 1 ["tr", "r", "br", "bl", "l", "tl"]
    terrainGraphics.push({
      tiles: [{
          q: 0,
          r: 0,
          type: terrainList1,      
          set_no_flag: [plfb.flag + "-r"]
        }, {
          q: 1,
          r: -1,
          type: adjacent1,
          set_no_flag: [plfb.flag + "-bl"]
        }, {
          q: 1,
          r: 0,
          type: adjacent2,
          set_no_flag: [plfb.flag + "-tl"]
        }
      ],
      images: [{
          name: imageStem,
          postfix: "-r",
          layer: plfb.layer,
          center: {x: 72-9, y: 18},
          variations: [""]
        }],
      probability: plfb.prob,
      builder: plfb.builder
    });

    // 2 ["tr", "r", "br", "bl", "l", "tl"]
    terrainGraphics.push({
      tiles: [{
          q: 0,
          r: 0,
          type: terrainList1,      
          set_no_flag: [plfb.flag + "-br"]
        }, {
          q: 1,
          r: 0,
          type: adjacent1,
          set_no_flag: [plfb.flag + "-l"]
        }, {
          q: 0,
          r: 1,
          type: adjacent2,
          set_no_flag: [plfb.flag + "-tr"]
        }
      ],
      images: [{
          name: imageStem,
          postfix: "-br",
          layer: plfb.layer,
          center: {x: 54+9, y: 54+9},
          variations: [""]
        }],
      probability: plfb.prob,
      builder: plfb.builder
    });

    // 3 ["tr", "r", "br", "bl", "l", "tl"]
    terrainGraphics.push({
      tiles: [{
          q: 0,
          r: 0,
          type: terrainList1,      
          set_no_flag: [plfb.flag + "-bl"]
        }, {
          q: 0,
          r: 1,
          type: adjacent1,
          set_no_flag: [plfb.flag + "-tl"]
        }, {
          q: -1,
          r: 1,
          type: adjacent2,
          set_no_flag: [plfb.flag + "-r"]
        }
      ],
      images: [{
          name: imageStem,
          postfix: "-bl",
          layer: plfb.layer,
          center: {x: 9, y: 36+9},
          variations: [""]
        }],
      probability: plfb.prob,
      builder: plfb.builder
    });

    // 4 ["tr", "r", "br", "bl", "l", "tl"]
    terrainGraphics.push({
      tiles: [{
          q: 0,
          r: 0,
          type: terrainList1,      
          set_no_flag: [plfb.flag + "-l"]
        }, {
          q: -1,
          r: 1,
          type: adjacent1,
          set_no_flag: [plfb.flag + "-tr"]
        }, {
          q: -1,
          r: 0,
          type: adjacent2,
          set_no_flag: [plfb.flag + "-br"]
        }
      ],
      images: [{
          name: imageStem,
          postfix: "-l",
          layer: plfb.layer,
          center: {x: 9, y: 36},
          variations: [""]
        }],
      probability: plfb.prob,
      builder: plfb.builder
    });

    // 5 ["tr", "r", "br", "bl", "l", "tl"]
    terrainGraphics.push({
      tiles: [{
          q: 0,
          r: 0,
          type: terrainList1,      
          set_no_flag: [plfb.flag + "-tl"]
        }, {
          q: -1,
          r: 0,
          type: adjacent1,
          set_no_flag: [plfb.flag + "-r"]
        }, {
          q: 0,
          r: -1,
          type: adjacent2,
          set_no_flag: [plfb.flag + "-bl"]
        }
      ],
      images: [{
          name: imageStem,
          postfix: "-tl",
          layer: plfb.layer,
          center: {x: 9, y: -18},
          variations: [""]
        }],
      probability: plfb.prob,
      builder: plfb.builder
    });
  }

  export var WALL_TRANSITION_PLFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, 
    adjacent: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB) => {
    if (plfb.layer === undefined)
      plfb.layer = 0;
    if (plfb.flag === undefined)
      plfb.flag = "overlay";
    if (plfb.builder === undefined)
      plfb.builder = IB_IMAGE_SINGLE;     
    if (plfb.prob === undefined)
      plfb.prob = 100;     
    CORNER_PLFB_CONVEX(terrainGraphics, terrainList, adjacent, adjacent, imageStem + "-convex", plfb);
    CORNER_PLFB_CONCAVE(terrainGraphics, adjacent, terrainList, terrainList, imageStem + "-concave", plfb);
  }

  export var NEW_FOREST = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, overlayList: Map<ETerrain, boolean>, 
    adjacent: Map<ETerrain, boolean>, imageStem: string) => {
    terrainGraphics.push({
      tiles: [{
          q: 0,
          r: 0,
          overlay: overlayList,      
          type: terrainList,
          set_no_flag: ["overlay"]
        }, {
          q: 0,
          r: -1,
          type: adjacent
        }
      ],
      images: [{
          name: imageStem + "-small@V",
          postfix: "",
          layer: 0,
          center: {x: 36, y: 36},
          base: {x: 36, y: 36},
          variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"],          
        }],
      probability: 100,
      rotations: ["n", "ne", "se", "s", "sw", "nw"],
      builder: IB_IMAGE_SINGLE
    });

    terrainGraphics.push({
      tiles: [{
          q: 0,
          r: 0,
          overlay: overlayList,      
          type: terrainList,
          set_no_flag: ["overlay"]
        }],
      images: [{
          name: imageStem + "@V",
          postfix: "",
          layer: 0,
          center: {x: 36, y: 36},
          base: {x: 36, y: 36},
          variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"],
        }],
      probability: 100,
      builder: IB_IMAGE_SINGLE
    });
  }
  export var NEW_VILLAGE = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, overlayList: Map<ETerrain, boolean>, 
    imageStem: string) => {

    terrainGraphics.push({
      tiles: [{
          q: 0,
          r: 0,
          overlay: overlayList,
          type: terrainList,
          set_no_flag: ["village"]
        }],
      images: [{
          name: imageStem + "@V",
          postfix: "",
          layer: 0,
          center: {x: 36, y: 36},
          base: {x: 36, y: 36},
          variations: ["", "2", "3", "4"],
        }],
      probability: 100,
      builder: IB_IMAGE_SINGLE

    });    
  }
}