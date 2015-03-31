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
    layer?: number;
    variations: string[];
    postfix?: string;
    base?: IVector;
    center?: IVector;
  }

  export interface WMLTile {
    set_flag?: string[];
    has_flag?: string[];
    no_flag?: string[];
    set_no_flag?: string[];

    q: number;
    r: number;
    type: Map<ETerrain, boolean>;

    images?: WMLImage[];

    anchor?: number;
  }

  export interface WMLTerrainGraphics {
    tiles: WMLTile[];
    set_flag?: string[];
    has_flag?: string[];
    no_flag?: string[];
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

  var GENERIC_SINGLE_PLFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, imageStem: string, plfb: PLFB) => {
    var img: WMLImage = {
      name: imageStem,
      layer: plfb.layer,
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"],
      center: {x: 36, y: 36}
    }

    var tile: WMLTile = {
      q: 0,
      r: 0,
      type: terrainList,
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
    if (lfb.builder === undefined)
      lfb.builder = IB_IMAGE_SINGLE;      
    GENERIC_SINGLE_RANDOM_LFB(terrainGraphics, terrainList, imageStem, lfb);
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
      lfb.builder = IB_IMAGE_SINGLE;      
    BORDER_COMPLETE_LFB(terrainGraphics, terrainList, adjacent, imageStem, lfb);
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
      base: {x: 90, y: 107},
      center: {x: 36, y: 36},
      variations: ["", "2", "3", "4", "5", "6"],
    }

    var tile: WMLTile = {
      q: 0,
      r: 0,
      type: terrainList,
      set_no_flag: [flag]      
    }

    var terrainGraphic: WMLTerrainGraphics = {
      tiles: [
        tile
      ],
      images: [img],
      probability: prob,
      builder: IB_IMAGE_SINGLE
    }
    terrainGraphics.push(terrainGraphic);
  }

  // var GENERIC_COMPLETE_LFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, imageStem: string, lfb: LFB) => {
  //   // GENERIC_COMPLETE_LFB(terrainGraphics, terrainList, imageStem);
  // }


  var GENERIC_COMPLETE_LFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: Map<ETerrain, boolean>, adjacent: Map<ETerrain, boolean>, imageStem: string, lfb: LFB) => {
    GENERIC_SINGLE_RANDOM_LFB(terrainGraphics, terrainList, imageStem, lfb);
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
      center: {x: 36, y: 36},
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
      center: {x: 36, y: 36},
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
      center: {x: 36, y: 36},
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
      center: {x: 36, y: 36},
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
      center: {x: 36, y: 36},
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
      center: {x: 36, y: 36},
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
      center: {x: 36, y: 36},
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
      center: {x: 36, y: 36},
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

  
}