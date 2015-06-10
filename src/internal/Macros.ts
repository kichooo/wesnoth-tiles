module WesnothTiles.Internal {
  'use strict';

  var getTerrainMap = (terrains: EOverlay[]| ETerrain[]): Map<number, boolean> => {
    if (terrains === undefined)
      return undefined;
    var terrainList = new Map<number, boolean>();
    (<number[]>terrains).forEach(terrain => {
      terrainList.set(terrain, true);
    });
    return terrainList;
  }


  export interface IBuilder {
    toDrawable(imageStem: string, postfix: string, pos: IVector, layer: number, base: IVector): IDrawable;
    toString(imageStem: string, postfix?: string): string;
  }
  // image builders.
  export var IB_IMAGE_SINGLE: IBuilder = {
    toDrawable: (imageStem: string, postfix: string, pos: IVector, layer: number, base: IVector) => {
      // console.log("Adding " + imageStem + postfix);
      return new StaticDrawable(
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
      return new AnimatedDrawable(
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
      return new AnimatedDrawable(
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
      return new AnimatedDrawable(
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

  export interface WMLTile extends IHexPos {
    set_no_flag?: string[];
    q: number;
    r: number;
    type?: Map<ETerrain, boolean>;
    overlay?: Map<EOverlay, boolean>;
    fog?: boolean;
    images?: WMLImage[];

    anchor?: number;
  }


  export interface WMLTerrainGraphics {
    tiles: WMLTile[];
    images?: WMLImage[];
    probability?: number;
    hexes?: Map<string, Hex>;
    rotations?: string[];

    builder: IBuilder;
    transitionNumber?: number;
    transition?: Map<ETerrain, boolean>;
  }

  export interface PLFB extends LFB {
    prob?: number;
  }

  export interface LFB {
    layer?: number;
    flag?: string;
    builder?: IBuilder;
  }

  var GENERIC_SINGLE_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], overlays: EOverlay[], fog: boolean, imageStem: string, plfb: PLFB) => {
    var img: WMLImage = {
      name: imageStem,
      layer: plfb.layer,
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"],
      base: { x: 90 - 90, y: 108 - 144 },
      center: { x: 90 - 54, y: 108 - 72 }
    }

    var tile: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(terrains),
      overlay: getTerrainMap(overlays),
      fog: fog,
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
    tgGroup.addTg(terrainGraphic);
  }

  export var TERRAIN_BASE_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], imageStem: string, plfb: PLFB) => {
    if (plfb.prob === undefined)
      plfb.prob = 100;
    if (plfb.layer === undefined)
      plfb.layer = -1000;
    if (plfb.flag === undefined)
      plfb.flag = "base";
    if (plfb.builder === undefined)
      plfb.builder = IB_IMAGE_SINGLE;
    GENERIC_SINGLE_PLFB(tgGroup, terrains, undefined, undefined, imageStem, plfb);
  }

  var GENERIC_SINGLE_RANDOM_LFB = (tgGroup: TgGroup, terrains: ETerrain[], overlays: EOverlay[], fog: boolean, imageStem: string, lfb: LFB) => {
    GENERIC_SINGLE_PLFB(tgGroup, terrains, overlays, fog, imageStem + "@V", {
      prob: 100,
      layer: lfb.layer,
      flag: lfb.flag,
      builder: lfb.builder
    });
  }

  export var OVERLAY_RANDOM_LFB = (tgGroup: TgGroup, terrains: ETerrain[], overlays: EOverlay[], fog: boolean, imageStem: string, lfb: LFB) => {
    GENERIC_SINGLE_RANDOM_LFB(tgGroup, terrains, overlays, fog, imageStem, {
      layer: lfb.layer === undefined ? 0 : lfb.layer,
      flag: lfb.flag === undefined ? "overlay" : lfb.flag,
      builder: lfb.builder === undefined ? IB_IMAGE_SINGLE : lfb.builder,
    });
  }

  export var TERRAIN_BASE_RANDOM_LFB = (tgGroup: TgGroup, terrains: ETerrain[], imageStem: string, lfb: LFB) => {
    if (lfb.layer === undefined)
      lfb.layer = -1000;
    if (lfb.flag === undefined)
      lfb.flag = "base";
    if (lfb.builder === undefined)
      lfb.builder = IB_IMAGE_SINGLE;
    GENERIC_SINGLE_RANDOM_LFB(tgGroup, terrains, undefined, undefined, imageStem, lfb);
  }

  var BORDER_RESTRICTED_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], fog: boolean,
    adjacent: ETerrain[], fogAdjacent: boolean, imageStem: string, plfb: PLFB) => {
    var img: WMLImage = {
      name: imageStem,
      postfix: "-@R0",
      layer: plfb.layer,
      center: { x: 36, y: 36 },
      variations: ["", "2"]
    }

    var tile1: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(adjacent),
      fog: fogAdjacent,
      set_no_flag: [plfb.flag + "-@R0"]
    }

    var tile2: WMLTile = {
      q: 0,
      r: -1,
      type: getTerrainMap(terrains),
      fog: fog,
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
      transitionNumber: 1,
      transition: getTerrainMap(terrains),
      builder: plfb.builder
    }
    tgGroup.addTg(terrainGraphic);
  }

  var BORDER_RESTRICTED6_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], fog: boolean,
    adjacent: ETerrain[], fogAdjacent: boolean, imageStem: string, plfb: PLFB) => {
    var img: WMLImage = {
      name: imageStem,
      postfix: "-@R0-@R1-@R2-@R3-@R4-@R5",
      layer: plfb.layer,
      center: { x: 36, y: 36 },
      variations: ["", "2"]
    }

    var tile1: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(adjacent),
      fog: fogAdjacent,
      set_no_flag: [plfb.flag + "-@R0", plfb.flag + "-@R1", plfb.flag + "-@R2", plfb.flag + "-@R3", plfb.flag + "-@R4", plfb.flag + "-@R5"]
    }

    var tile2: WMLTile = {
      q: 0,
      r: -1,
      type: getTerrainMap(terrains),
      fog: fog,
      set_no_flag: [plfb.flag + "-@R3"]
    }

    var tile3: WMLTile = {
      q: 1,
      r: -1,
      type: getTerrainMap(terrains),
      fog: fog,
      set_no_flag: [plfb.flag + "-@R4"]
    }

    var tile4: WMLTile = {
      q: 1,
      r: 0,
      type: getTerrainMap(terrains),
      fog: fog,
      set_no_flag: [plfb.flag + "-@R5"]
    }

    var tile5: WMLTile = {
      q: 0,
      r: 1,
      type: getTerrainMap(terrains),
      fog: fog,
      set_no_flag: [plfb.flag + "-@R0"]
    }

    var tile6: WMLTile = {
      q: -1,
      r: 1,
      type: getTerrainMap(terrains),
      fog: fog,
      set_no_flag: [plfb.flag + "-@R1"]
    }

    var tile7: WMLTile = {
      q: -1,
      r: 0,
      type: getTerrainMap(terrains),
      fog: fog,
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
      probability: plfb.prob,
      rotations: ["n", "ne", "se", "s", "sw", "nw"],
      transition: getTerrainMap(terrains),
      transitionNumber: 6,
      builder: plfb.builder
    }
    tgGroup.addTg(terrainGraphic);
  }

  var BORDER_RESTRICTED4_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], fog: boolean,
    adjacent: ETerrain[], fogAdjacent: boolean, imageStem: string, plfb: PLFB) => {
    var img: WMLImage = {
      name: imageStem,
      postfix: "-@R0-@R1-@R2-@R3",
      layer: plfb.layer,
      center: { x: 36, y: 36 },
      variations: ["", "2"]
    }

    var tile1: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(adjacent),
      fog: fogAdjacent,
      set_no_flag: [plfb.flag + "-@R0", plfb.flag + "-@R1", plfb.flag + "-@R2", plfb.flag + "-@R3"]
    }

    var tile2: WMLTile = {
      q: 0,
      r: -1,
      type: getTerrainMap(terrains),
      fog: fog,
      set_no_flag: [plfb.flag + "-@R3"]
    }

    var tile3: WMLTile = {
      q: 1,
      r: -1,
      type: getTerrainMap(terrains),
      fog: fog,
      set_no_flag: [plfb.flag + "-@R4"]
    }

    var tile4: WMLTile = {
      q: 1,
      r: 0,
      type: getTerrainMap(terrains),
      fog: fog,
      set_no_flag: [plfb.flag + "-@R5"]
    }

    var tile5: WMLTile = {
      q: 0,
      r: 1,
      type: getTerrainMap(terrains),
      fog: fog,
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
      transition: getTerrainMap(terrains),
      transitionNumber: 4,
      builder: plfb.builder
    }
    tgGroup.addTg(terrainGraphic);
  }

  var BORDER_RESTRICTED3_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], fog: boolean,
    adjacent: ETerrain[], fogAdjacent: boolean, imageStem: string, plfb: PLFB) => {
    var img: WMLImage = {
      name: imageStem,
      postfix: "-@R0-@R1-@R2",
      layer: plfb.layer,
      center: { x: 36, y: 36 },
      variations: ["", "2"]
    }

    var tile1: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(adjacent),
      fog: fogAdjacent,
      set_no_flag: [plfb.flag + "-@R0", plfb.flag + "-@R1", plfb.flag + "-@R2"]
    }

    var tile2: WMLTile = {
      q: 0,
      r: -1,
      type: getTerrainMap(terrains),
      fog: fog,
      set_no_flag: [plfb.flag + "-@R3"]
    }

    var tile3: WMLTile = {
      q: 1,
      r: -1,
      type: getTerrainMap(terrains),
      fog: fog,
      set_no_flag: [plfb.flag + "-@R4"]
    }

    var tile4: WMLTile = {
      q: 1,
      r: 0,
      type: getTerrainMap(terrains),
      fog: fog,
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
      transition: getTerrainMap(terrains),
      transitionNumber: 3,
      builder: plfb.builder
    }
    tgGroup.addTg(terrainGraphic);
  }

  var BORDER_RESTRICTED2_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], fog: boolean,
    adjacent: ETerrain[], fogAdjacent: boolean, imageStem: string, plfb: PLFB) => {
    var img: WMLImage = {
      name: imageStem,
      postfix: "-@R0-@R1",
      layer: plfb.layer,
      center: { x: 36, y: 36 },
      variations: ["", "2"]
    }

    var tile1: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(adjacent),
      fog: fogAdjacent,
      set_no_flag: [plfb.flag + "-@R0", plfb.flag + "-@R1"]
    }

    var tile2: WMLTile = {
      q: 0,
      r: -1,
      type: getTerrainMap(terrains),
      fog: fog,
      set_no_flag: [plfb.flag + "-@R3"]
    }

    var tile3: WMLTile = {
      q: 1,
      r: -1,
      type: getTerrainMap(terrains),
      fog: fog,
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
      transition: getTerrainMap(terrains),
      transitionNumber: 2,
      builder: plfb.builder
    }
    tgGroup.addTg(terrainGraphic);
  }

  var BORDER_RESTRICTED6_RANDOM_LFB = (tgGroup: TgGroup, terrains: ETerrain[], fog: boolean,
    adjacent: ETerrain[], fogAdjacent: boolean, imageStem: string, lfb: LFB) => {
    BORDER_RESTRICTED6_PLFB(tgGroup, terrains, fog, adjacent, fogAdjacent, imageStem + "@V", {
      prob: 100,
      layer: lfb.layer,
      flag: lfb.flag,
      builder: lfb.builder
    });
  }

  var BORDER_RESTRICTED4_RANDOM_LFB = (tgGroup: TgGroup, terrains: ETerrain[], fog: boolean,
    adjacent: ETerrain[], fogAdjacent: boolean, imageStem: string, lfb: LFB) => {
    BORDER_RESTRICTED4_PLFB(tgGroup, terrains, fog, adjacent, fogAdjacent, imageStem + "@V", {
      prob: 100,
      layer: lfb.layer,
      flag: lfb.flag,
      builder: lfb.builder
    });
  }

  var BORDER_RESTRICTED3_RANDOM_LFB = (tgGroup: TgGroup, terrains: ETerrain[], fog: boolean,
    adjacent: ETerrain[], fogAdjacent: boolean, imageStem: string, lfb: LFB) => {
    BORDER_RESTRICTED3_PLFB(tgGroup, terrains, fog, adjacent, fogAdjacent, imageStem + "@V", {
      prob: 100,
      layer: lfb.layer,
      flag: lfb.flag,
      builder: lfb.builder
    });
  }

  var BORDER_RESTRICTED2_RANDOM_LFB = (tgGroup: TgGroup, terrains: ETerrain[], fog: boolean,
    adjacent: ETerrain[], fogAdjacent: boolean, imageStem: string, lfb: LFB) => {
    BORDER_RESTRICTED2_PLFB(tgGroup, terrains, fog, adjacent, fogAdjacent, imageStem + "@V", {
      prob: 100,
      layer: lfb.layer,
      flag: lfb.flag,
      builder: lfb.builder
    });
  }

  var BORDER_RESTRICTED_RANDOM_LFB = (tgGroup: TgGroup, terrains: ETerrain[], fog: boolean,
    adjacent: ETerrain[], fogAdjacent: boolean, imageStem: string, lfb: LFB) => {
    BORDER_RESTRICTED_PLFB(tgGroup, terrains, fog, adjacent, fogAdjacent, imageStem + "@V", {
      prob: 100,
      layer: lfb.layer,
      flag: lfb.flag,
      builder: lfb.builder
    });
  }

  var BORDER_COMPLETE_LFB = (tgGroup: TgGroup, terrains: ETerrain[], fog: boolean,
    adjacent: ETerrain[], fogAdjacent: boolean, imageStem: string, lfb: LFB, grades: number[]) => {
    grades.forEach(grade => {
      switch (grade) {
        case 6:
          BORDER_RESTRICTED6_RANDOM_LFB(tgGroup, terrains, fog, adjacent, fogAdjacent, imageStem, lfb);
          break;
        // 5 borders transition was nowhere used, thus got removed.
        case 4:
          BORDER_RESTRICTED4_RANDOM_LFB(tgGroup, terrains, fog, adjacent, fogAdjacent, imageStem, lfb);
          break;
        case 3:
          BORDER_RESTRICTED3_RANDOM_LFB(tgGroup, terrains, fog, adjacent, fogAdjacent, imageStem, lfb);
          break;
        case 2:
          BORDER_RESTRICTED2_RANDOM_LFB(tgGroup, terrains, fog, adjacent, fogAdjacent, imageStem, lfb);
          break;
        case 1:
          BORDER_RESTRICTED_RANDOM_LFB(tgGroup, terrains, fog, adjacent, fogAdjacent, imageStem, lfb);
          break;
      }
    });


  }

  export var transitionsOptimizer = new Map<ETerrain, Map<ETerrain, boolean>>();

  export var addToTransitionsTable = (terrains: ETerrain[], adjacent: ETerrain[], stem: string) => {
    terrains.forEach(terrain => {

      if (!transitionsOptimizer.has(terrain)) {
        transitionsOptimizer.set(terrain, new Map<ETerrain, boolean>());
      }
      adjacent.forEach((adjacent) => {
        if (transitionsOptimizer.get(terrain).has(adjacent)) {
          console.log("Duplicate transnition from ", ETerrain[terrain], ETerrain[adjacent], stem);
        } else {
          transitionsOptimizer.get(terrain).set(adjacent, true);
        }
      });
    });
  }

  // grades is used by BORDER_COMPLETE, to filter out not needed macros.
  export var TRANSITION_COMPLETE_LFB = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, lfb: LFB, grades = [1, 2, 3, 4, 5, 6]) => {
    if (lfb.layer === undefined)
      lfb.layer = -500;
    if (lfb.flag === undefined)
      lfb.flag = "transition";
    if (lfb.builder === undefined)
      lfb.builder = IB_IMAGE_SINGLE;
    if (lfb.flag === "transition") {
      addToTransitionsTable(terrains, adjacent, imageStem);
      addToTransitionsTable(adjacent, terrains, imageStem);
    }
    BORDER_COMPLETE_LFB(tgGroup, terrains, undefined, adjacent, undefined, imageStem, lfb, grades);
  }

  export var FOG_TRANSITION_LFB = (tgGroup: TgGroup, fog: boolean, fogAdjacent: boolean, imageStem: string, lfb: LFB, grades = [1, 2, 3, 4, 5, 6]) => {
    if (lfb.layer === undefined)
      lfb.layer = -500;
    if (lfb.flag === undefined)
      lfb.flag = "transition";
    if (lfb.builder === undefined)
      lfb.builder = IB_IMAGE_SINGLE;
    BORDER_COMPLETE_LFB(tgGroup, undefined, fog, undefined, fogAdjacent, imageStem, lfb, grades);
  }


  var GENERIC_SINGLEHEX_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], imageStem: string, plfb: PLFB) => {
    var img: WMLImage = {
      name: imageStem,
      layer: plfb.layer,
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
    }

    var tile: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(terrains),
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
    tgGroup.addTg(terrainGraphic);
  }

  export var TERRAIN_BASE_SINGLEHEX_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], imageStem: string, plfb: PLFB) => {
    if (plfb.prob === undefined)
      plfb.prob = 100;
    if (plfb.layer === undefined)
      plfb.layer = -1000;
    if (plfb.flag === undefined)
      plfb.flag = "base";
    if (plfb.builder === undefined)
      plfb.builder = IB_IMAGE_SINGLE;
    GENERIC_SINGLEHEX_PLFB(tgGroup, terrains, imageStem, plfb);
  }

  export var ANIMATED_WATER_15_TRANSITION = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, layer: number) => {
    addToTransitionsTable(terrains, adjacent, imageStem);
    var img: WMLImage = {
      name: imageStem,
      postfix: "-@R0",
      layer: layer,
      variations: [""]
    }

    var tile1: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(adjacent),
      images: [img],
      set_no_flag: ["transition-@R0"]
    }

    var tile2: WMLTile = {
      q: 0,
      r: -1,
      type: getTerrainMap(terrains),
    }

    var terrainGraphic: WMLTerrainGraphics = {
      tiles: [
        tile1,
        tile2
      ],
      probability: 100,
      rotations: ["n", "ne", "se", "s", "sw", "nw"],
      builder: IB_ANIMATION_15_SLOW,
      transition: getTerrainMap(terrains),
      transitionNumber: 1
    }
    tgGroup.addTg(terrainGraphic);
  }

  export var NEW_BEACH = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string) => {
    var concave_img1: WMLImage = {
      name: imageStem + "-concave",
      postfix: "-@R0-@R5",
      layer: -500,
      center: { x: 36, y: 36 },
      variations: [""]
    }

    var concave_img2: WMLImage = {
      name: imageStem + "-concave",
      postfix: "-@R0-@R1",
      layer: -500,
      center: { x: 36, y: 36 },
      variations: [""]
    }

    var concave_tile1: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(adjacent),
      set_no_flag: ["beach-@R0-@R5", "beach-@R0-@R1"]
    }

    var concave_tile2: WMLTile = {
      q: 0,
      r: -1,
      type: getTerrainMap(terrains),
      set_no_flag: ["beach-@R2-@R3"]
    }

    var concave_tile3: WMLTile = {
      q: 1,
      r: -1,
      type: getTerrainMap(terrains),
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
      transition: getTerrainMap(terrains),
      transitionNumber: 2,
      rotations: ["tr", "r", "br", "bl", "l", "tl"],
      builder: IB_IMAGE_SINGLE
    }
    tgGroup.addTg(concave_terrainGraphic);
    // ----------------------------------------------------

    var convex0_img1: WMLImage = {
      name: imageStem + "-convex",
      postfix: "-@R0-@R5",
      layer: -500,
      center: { x: 36, y: 36 },
      variations: [""]
    }

    var convex0_img2: WMLImage = {
      name: imageStem + "-convex",
      postfix: "-@R0-@R1",
      layer: -500,
      center: { x: 36, y: 36 },
      variations: [""]
    }

    var convex0_tile1: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(terrains),
      set_no_flag: ["beach-@R0-@R5", "beach-@R0-@R1"]
    }

    var convex0_tile2: WMLTile = {
      q: 0,
      r: -1,
      type: getTerrainMap(adjacent),
      set_no_flag: ["beach-@R2-@R3"]
    }

    var convex0_tile3: WMLTile = {
      q: 1,
      r: -1,
      type: getTerrainMap(adjacent),
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
      transition: getTerrainMap(adjacent),
      transitionNumber: 2,
      rotations: ["tr", "r", "br", "bl", "l", "tl"],
      builder: IB_IMAGE_SINGLE
    }
    tgGroup.addTg(convex0_terrainGraphic);
    // ----------------------------------------------------
    var convex1_img1: WMLImage = {
      name: imageStem + "-convex",
      postfix: "-@R0-@R5",
      layer: -500,
      center: { x: 36, y: 36 },
      variations: [""]
    }

    var convex1_tile1: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(terrains),
      set_no_flag: ["beach-@R0-@R5"]
    }

    var convex1_tile2: WMLTile = {
      q: 0,
      r: -1,
      type: getTerrainMap(adjacent),
      set_no_flag: ["beach-@R2-@R3"]
    }

    var convex1_tile3: WMLTile = {
      q: 1,
      r: -1,
      type: getTerrainMap(swapTerrains(adjacent.concat(terrains))),
    }

    var convex1_terrainGraphic: WMLTerrainGraphics = {
      tiles: [
        convex1_tile1,
        convex1_tile2,
        convex1_tile3
      ],
      transition: getTerrainMap(adjacent),
      transitionNumber: 1,
      images: [convex1_img1],
      probability: 100,
      rotations: ["tr", "r", "br", "bl", "l", "tl"],
      builder: IB_IMAGE_SINGLE
    }
    tgGroup.addTg(convex1_terrainGraphic);

    // ----------------------------------------------------
    var convex2_img1: WMLImage = {
      name: imageStem + "-convex",
      postfix: "-@R0-@R1",
      layer: -500,
      center: { x: 36, y: 36 },
      variations: [""]
    }

    var convex2_tile1: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(terrains),

      set_no_flag: ["beach-@R0-@R1"]
    }

    var convex2_tile2: WMLTile = {
      q: 0,
      r: -1,
      type: getTerrainMap(swapTerrains(adjacent.concat(terrains))),
    }

    var convex2_tile3: WMLTile = {
      q: 1,
      r: -1,
      type: getTerrainMap(adjacent),
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
      transition: getTerrainMap(adjacent),
      transitionNumber: 1,
      rotations: ["tr", "r", "br", "bl", "l", "tl"],
      builder: IB_IMAGE_SINGLE
    }
    tgGroup.addTg(convex2_terrainGraphic);
  }

  export var NEW_WAVES = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], layer: number, imageStem: string) => {
    var convex_img1: WMLImage = {
      name: imageStem + "-convex",
      postfix: "-@R0",
      layer: layer,
      center: { x: 36, y: 36 },
      variations: [""]
    }

    var convex_tile1: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(terrains),
      set_no_flag: ["waves-@R0"]
    }

    var convex_tile2: WMLTile = {
      q: 0,
      r: -1,
      type: getTerrainMap(adjacent),
      set_no_flag: ["waves-@R2"]
    }

    var convex_tile3: WMLTile = {
      q: 1,
      r: -1,
      type: getTerrainMap(adjacent),
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
    tgGroup.addTg(convex_terrainGraphic);
    // ----------------------------------------------------

    var concave_img1: WMLImage = {
      name: imageStem + "-concave",
      postfix: "-@R0",
      layer: layer,
      center: { x: 36, y: 36 },
      variations: [""]
    }

    var concave_tile1: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(adjacent),
      set_no_flag: ["waves-@R0"]
    }

    var concave_tile2: WMLTile = {
      q: 0,
      r: -1,
      type: getTerrainMap(terrains),
      set_no_flag: ["waves-@R2"]
    }

    var concave_tile3: WMLTile = {
      q: 1,
      r: -1,
      type: getTerrainMap(terrains),
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
    tgGroup.addTg(concave_terrainGraphic);

  }

  export var MOUNTAIN_SINGLE = (tgGroup: TgGroup, terrains: ETerrain[], imageStem: string, prob: number, flag: string) => {
    var img: WMLImage = {
      name: imageStem,
      base: { x: 90 - 54, y: 107 - 72 },
      layer: 0,
      center: { x: 90 - 54, y: 108 - 72 },
      variations: ["", "2", "3", "4", "5", "6"],
    }

    var tile: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(terrains),
      set_no_flag: [flag]
    }

    var terrainGraphic: WMLTerrainGraphics = {
      tiles: [tile],
      images: [img],
      probability: prob,
      builder: IB_IMAGE_SINGLE
    }
    tgGroup.addTg(terrainGraphic);
  }

  var GENERIC_RESTRICTED3_RANDOM_LFB = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, lfb: LFB, rotation: string) => {
    GENERIC_RESTRICTED3_PLFB(tgGroup, terrains, adjacent, imageStem + "@V", {
      layer: lfb.layer,
      prob: 100,
      flag: lfb.flag,
      builder: lfb.builder
    }, rotation);
  }

  var GENERIC_RESTRICTED2_RANDOM_LFB = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, lfb: LFB, rotation: string) => {
    GENERIC_RESTRICTED2_PLFB(tgGroup, terrains, adjacent, imageStem + "@V", {
      layer: lfb.layer,
      prob: 100,
      flag: lfb.flag,
      builder: lfb.builder
    }, rotation);
  }

  var GENERIC_RESTRICTED_RANDOM_LFB = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, lfb: LFB, rotation: string) => {
    GENERIC_RESTRICTED_PLFB(tgGroup, terrains, undefined, adjacent, undefined, imageStem + "@V", {
      layer: lfb.layer,
      prob: 100,
      flag: lfb.flag,
      builder: lfb.builder
    }, rotation);
  }

  var GENERIC_COMPLETE_LFB = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, lfb: LFB) => {
    GENERIC_RESTRICTED3_RANDOM_LFB(tgGroup, terrains, adjacent, imageStem + "-small", lfb, "-@R0-@R1-@R2");
    GENERIC_RESTRICTED3_RANDOM_LFB(tgGroup, terrains, adjacent, imageStem + "-small", lfb, "");
    GENERIC_RESTRICTED2_RANDOM_LFB(tgGroup, terrains, adjacent, imageStem + "-small", lfb, "-@R0-@R1");
    GENERIC_RESTRICTED2_RANDOM_LFB(tgGroup, terrains, adjacent, imageStem + "-small", lfb, "");
    GENERIC_RESTRICTED_RANDOM_LFB(tgGroup, terrains, adjacent, imageStem + "-small", lfb, "-@R0");
    GENERIC_RESTRICTED_RANDOM_LFB(tgGroup, terrains, adjacent, imageStem + "-small", lfb, "");
    GENERIC_SINGLE_RANDOM_LFB(tgGroup, terrains, undefined, undefined, imageStem, lfb);
  }

  export var OVERLAY_COMPLETE_LFB = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, lfb: LFB) => {
    GENERIC_COMPLETE_LFB(tgGroup, terrains, adjacent, imageStem, {
      layer: lfb.layer === undefined ? 0 : lfb.layer,
      flag: lfb.flag === undefined ? "overlay" : lfb.flag,
      builder: lfb.builder === undefined ? IB_IMAGE_SINGLE : lfb.builder,
    });
  }

  export var MOUNTAIN_SINGLE_RANDOM = (tgGroup: TgGroup, terrains: ETerrain[], imageStem: string, flag: string) => {
    MOUNTAIN_SINGLE(tgGroup, terrains, imageStem + "@V", 100, flag);
  }

  var GENERIC_RESTRICTED3_N_NE_SE_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, plfb: PLFB, rotation: string) => {
    var img: WMLImage = {
      name: imageStem,
      postfix: rotation,
      layer: plfb.layer,
      base: { x: 90 - 90, y: 108 - 144 },
      center: { x: 90 - 54, y: 108 - 72 },
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
    }

    var tile1: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(terrains),
      set_no_flag: [plfb.flag]
    }

    var tile2: WMLTile = {
      q: 0,
      r: -1,
      type: getTerrainMap(adjacent)
    }

    var tile3: WMLTile = {
      q: 1,
      r: -1,
      type: getTerrainMap(adjacent)
    }

    var tile4: WMLTile = {
      q: 1,
      r: 0,
      type: getTerrainMap(adjacent)
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
    tgGroup.addTg(terrainGraphic);

  }

  var GENERIC_RESTRICTED3_N_NE_S_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, plfb: PLFB, rotation: string) => {
    var img: WMLImage = {
      name: imageStem,
      postfix: rotation,
      layer: plfb.layer,
      base: { x: 90 - 90, y: 108 - 144 },
      center: { x: 90 - 54, y: 108 - 72 },
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
    }

    var tile1: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(terrains),
      set_no_flag: [plfb.flag]
    }

    var tile2: WMLTile = {
      q: 0,
      r: -1,
      type: getTerrainMap(adjacent)
    }

    var tile3: WMLTile = {
      q: 1,
      r: -1,
      type: getTerrainMap(adjacent)
    }

    var tile4: WMLTile = {
      q: 0,
      r: 1,
      type: getTerrainMap(adjacent)
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
    tgGroup.addTg(terrainGraphic);

  }

  var GENERIC_RESTRICTED3_N_NE_SW_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, plfb: PLFB, rotation: string) => {
    var img: WMLImage = {
      name: imageStem,
      postfix: rotation,
      layer: plfb.layer,
      base: { x: 90 - 90, y: 108 - 144 },
      center: { x: 90 - 54, y: 108 - 72 },
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
    }

    var tile1: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(terrains),
      set_no_flag: [plfb.flag]
    }

    var tile2: WMLTile = {
      q: 0,
      r: -1,
      type: getTerrainMap(adjacent)
    }

    var tile3: WMLTile = {
      q: 1,
      r: -1,
      type: getTerrainMap(adjacent)
    }

    var tile4: WMLTile = {
      q: -1,
      r: 1,
      type: getTerrainMap(adjacent)
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
    tgGroup.addTg(terrainGraphic);
  }

  var GENERIC_RESTRICTED3_N_SE_SW_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, plfb: PLFB, rotation: string) => {
    var img: WMLImage = {
      name: imageStem,
      postfix: rotation,
      layer: plfb.layer,
      base: { x: 90 - 90, y: 108 - 144 },
      center: { x: 90 - 54, y: 108 - 72 },
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
    }

    var tile1: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(terrains),
      set_no_flag: [plfb.flag]
    }

    var tile2: WMLTile = {
      q: 0,
      r: -1,
      type: getTerrainMap(adjacent)
    }

    var tile3: WMLTile = {
      q: 1,
      r: 0,
      type: getTerrainMap(adjacent)
    }

    var tile4: WMLTile = {
      q: -1,
      r: 1,
      type: getTerrainMap(adjacent)
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
    tgGroup.addTg(terrainGraphic);
  }

  var GENERIC_RESTRICTED3_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, plfb: PLFB, rotation: string) => {
    GENERIC_RESTRICTED3_N_NE_SE_PLFB(tgGroup, terrains, adjacent, imageStem, plfb, rotation);
    GENERIC_RESTRICTED3_N_NE_S_PLFB(tgGroup, terrains, adjacent, imageStem, plfb, rotation);
    GENERIC_RESTRICTED3_N_NE_SW_PLFB(tgGroup, terrains, adjacent, imageStem, plfb, rotation);
    GENERIC_RESTRICTED3_N_SE_SW_PLFB(tgGroup, terrains, adjacent, imageStem, plfb, rotation);
  }


  export var OVERLAY_RESTRICTED2_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, plfb: PLFB) => {
    GENERIC_RESTRICTED2_PLFB(tgGroup, terrains, adjacent, imageStem, {
      prob: plfb.prob === undefined ? 100 : plfb.prob,
      layer: plfb.layer === undefined ? 0 : plfb.layer,
      flag: plfb.flag === undefined ? "overlay" : plfb.flag,
      builder: plfb.builder === undefined ? IB_IMAGE_SINGLE : plfb.builder,
    }, "");
  }

  export var OVERLAY_RESTRICTED3_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, plfb: PLFB) => {
    GENERIC_RESTRICTED3_PLFB(tgGroup, terrains, adjacent, imageStem, {
      prob: plfb.prob === undefined ? 100 : plfb.prob,
      layer: plfb.layer === undefined ? 0 : plfb.layer,
      flag: plfb.flag === undefined ? "overlay" : plfb.flag,
      builder: plfb.builder === undefined ? IB_IMAGE_SINGLE : plfb.builder,
    }, "");
  }

  var GENERIC_RESTRICTED2_N_NE_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, plfb: PLFB, rotation: string) => {
    var img: WMLImage = {
      name: imageStem,
      postfix: rotation,
      layer: plfb.layer,
      base: { x: 90 - 90, y: 108 - 144 },
      center: { x: 90 - 54, y: 108 - 72 },
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
    }

    var tile1: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(terrains),
      set_no_flag: [plfb.flag]
    }

    var tile2: WMLTile = {
      q: 0,
      r: -1,
      type: getTerrainMap(adjacent)
    }

    var tile3: WMLTile = {
      q: 1,
      r: -1,
      type: getTerrainMap(adjacent)
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
    tgGroup.addTg(terrainGraphic);

  }

  var GENERIC_RESTRICTED2_N_SE_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, plfb: PLFB, rotation: string) => {
    var img: WMLImage = {
      name: imageStem,
      postfix: rotation,
      layer: plfb.layer,
      base: { x: 90 - 90, y: 108 - 144 },
      center: { x: 90 - 54, y: 108 - 72 },
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
    }

    var tile1: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(terrains),
      set_no_flag: [plfb.flag]
    }

    var tile2: WMLTile = {
      q: 0,
      r: -1,
      type: getTerrainMap(adjacent)
    }


    var tile3: WMLTile = {
      q: 1,
      r: 0,
      type: getTerrainMap(adjacent)
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
    tgGroup.addTg(terrainGraphic);

  }

  var GENERIC_RESTRICTED2_N_S_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, plfb: PLFB, rotation: string) => {
    var img: WMLImage = {
      name: imageStem,
      postfix: rotation,
      layer: plfb.layer,
      base: { x: 90 - 90, y: 108 - 144 },
      center: { x: 90 - 54, y: 108 - 72 },
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
    }

    var tile1: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(terrains),
      set_no_flag: [plfb.flag]
    }

    var tile2: WMLTile = {
      q: 0,
      r: -1,
      type: getTerrainMap(adjacent)
    }

    var tile3: WMLTile = {
      q: 0,
      r: 1,
      type: getTerrainMap(adjacent)
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
    tgGroup.addTg(terrainGraphic);
  }

  export var OVERLAY_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], overlays: EOverlay[], fog: boolean, imageStem: string, plfb: PLFB) => {
    GENERIC_SINGLE_PLFB(tgGroup, terrains, overlays, fog, imageStem, {
      prob: plfb.prob === undefined ? 100 : plfb.prob,
      layer: plfb.layer === undefined ? 0 : plfb.layer,
      flag: plfb.flag === undefined ? "overlay" : plfb.flag,
      builder: plfb.builder === undefined ? IB_IMAGE_SINGLE : plfb.builder,
    });
  }

  var GENERIC_RESTRICTED2_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, plfb: PLFB, rotation: string) => {
    GENERIC_RESTRICTED2_N_NE_PLFB(tgGroup, terrains, adjacent, imageStem, plfb, rotation);
    GENERIC_RESTRICTED2_N_SE_PLFB(tgGroup, terrains, adjacent, imageStem, plfb, rotation);
    GENERIC_RESTRICTED2_N_S_PLFB(tgGroup, terrains, adjacent, imageStem, plfb, rotation);
  }

  export var OVERLAY_ROTATION_RESTRICTED2_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, plfb: PLFB) => {
    GENERIC_RESTRICTED2_PLFB(tgGroup, terrains, adjacent, imageStem, {
      prob: plfb.prob === undefined ? 100 : plfb.prob,
      layer: plfb.layer === undefined ? 0 : plfb.layer,
      flag: plfb.flag === undefined ? "overlay" : plfb.flag,
      builder: plfb.builder === undefined ? IB_IMAGE_SINGLE : plfb.builder,
    }, "-@R0-@R1");
  }

  var GENERIC_RESTRICTED_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], overlays: EOverlay[],
    adjacent: ETerrain[], adjacentOverlays: ETerrain[], imageStem: string, plfb: PLFB, rotation: string) => {
    var img: WMLImage = {
      name: imageStem,
      postfix: rotation,
      layer: plfb.layer,
      base: { x: 90 - 90, y: 108 - 144 },
      center: { x: 90 - 54, y: 108 - 72 },
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
    }

    var tile1: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(terrains),
      overlay: getTerrainMap(overlays),
      set_no_flag: [plfb.flag]
    }

    var tile2: WMLTile = {
      q: 0,
      r: -1,
      type: getTerrainMap(adjacent),
      overlay: getTerrainMap(adjacentOverlays),
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
    tgGroup.addTg(terrainGraphic);
  }

  export var OVERLAY_ROTATION_RESTRICTED_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, plfb: PLFB) => {
    GENERIC_RESTRICTED_PLFB(tgGroup, terrains, undefined, adjacent, undefined, imageStem, {
      prob: plfb.prob === undefined ? 100 : plfb.prob,
      layer: plfb.layer === undefined ? 0 : plfb.layer,
      flag: plfb.flag === undefined ? "overlay" : plfb.flag,
      builder: plfb.builder === undefined ? IB_IMAGE_SINGLE : plfb.builder,
    }, "-@R0");
  }

  export var MOUNTAINS_2x4_NW_SE = (tgGroup: TgGroup, terrains: ETerrain[], imageStem: string, flag: string, prob: number) => {
    var center = { x: 198 - 54, y: 180 - 108 }
    var img1: WMLImage = {
      name: imageStem + "_1",
      postfix: "",
      layer: 0,
      center: center,
      base: { x: 88 - 54, y: 107 - 108 },
      variations: [""]
    }

    var img2: WMLImage = {
      name: imageStem + "_2",
      postfix: "",
      layer: 0,
      center: center,
      base: { x: 144 - 54, y: 107 - 108 },
      variations: [""]
    }

    var img3: WMLImage = {
      name: imageStem + "_3",
      postfix: "",
      center: center,
      layer: 0,
      base: { x: 196 - 54, y: 107 - 108 },
      variations: [""]
    }

    var img4: WMLImage = {
      name: imageStem + "_4",
      postfix: "",
      center: center,
      layer: 0,
      base: { x: 248 - 54, y: 107 - 108 },
      variations: [""]
    }

    var img5: WMLImage = {
      name: imageStem + "_5",
      postfix: "",
      center: center,
      layer: 0,
      base: { x: 304 - 54, y: 107 - 108 },
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
        type: getTerrainMap(terrains),
        set_no_flag: [flag]
      });
      terrainGraphic.tiles.push({
        q: i + 1,
        r: -1,
        type: getTerrainMap(terrains),
        set_no_flag: [flag]
      });
    }

    tgGroup.addTg(terrainGraphic);
  }

  export var MOUNTAINS_1x3_NW_SE = (tgGroup: TgGroup, terrains: ETerrain[], imageStem: string, flag: string, prob: number) => {
    var center = { x: 144 - 54, y: 162 - 108 }
    var img1: WMLImage = {
      name: imageStem + "_1",
      postfix: "",
      layer: 0,
      center: center,
      base: { x: 88 - 54, y: 128 - 108 },
      variations: [""]
    }

    var img2: WMLImage = {
      name: imageStem + "_2",
      postfix: "",
      layer: 0,
      center: center,
      base: { x: 142 - 54, y: 144 - 108 },
      variations: [""]
    }

    var img3: WMLImage = {
      name: imageStem + "_3",
      postfix: "",
      layer: 0,
      center: center,
      base: { x: 196 - 54, y: 180 - 108 },
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
        type: getTerrainMap(terrains),
        set_no_flag: [flag]
      });
    }

    tgGroup.addTg(terrainGraphic);
  }

  export var MOUNTAINS_2x4_SW_NE = (tgGroup: TgGroup, terrains: ETerrain[], imageStem: string, flag: string, prob: number) => {
    var center = { x: 198 - 216, y: 180 - 72 }
    var img1: WMLImage = {
      name: imageStem + "_1",
      postfix: "",
      layer: 0,
      center: center,
      base: { x: 88 - 216, y: 107 - 72 },
      variations: [""]
    }

    var img2: WMLImage = {
      name: imageStem + "_2",
      postfix: "",
      layer: 0,
      center: center,
      base: { x: 144 - 216, y: 107 - 72 },
      variations: [""]
    }

    var img3: WMLImage = {
      name: imageStem + "_3",
      postfix: "",
      layer: 0,
      center: center,
      base: { x: 196 - 216, y: 107 - 72 },
      variations: [""]
    }

    var img4: WMLImage = {
      name: imageStem + "_4",
      postfix: "",
      layer: 0,
      center: center,
      base: { x: 248 - 216, y: 107 - 72 },
      variations: [""]
    }

    var img5: WMLImage = {
      name: imageStem + "_5",
      postfix: "",
      layer: 0,
      center: center,
      base: { x: 304 - 216, y: 107 - 72 },
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
        type: getTerrainMap(terrains),
        set_no_flag: [flag]
      });
      terrainGraphic.tiles.push({
        q: 1 - i,
        r: i,
        type: getTerrainMap(terrains),
        set_no_flag: [flag]
      });
    }

    tgGroup.addTg(terrainGraphic);
  }

  export var MOUNTAINS_1x3_SW_NE = (tgGroup: TgGroup, terrains: ETerrain[], imageStem: string, flag: string, prob: number) => {
    var center = { x: 144 - 162, y: 162 - 108 }
    var img1: WMLImage = {
      name: imageStem + "_1",
      postfix: "",
      layer: 0,
      center: center,
      base: { x: 88 - 162, y: 180 - 108 },
      variations: [""]
    }

    var img2: WMLImage = {
      name: imageStem + "_2",
      postfix: "",
      layer: 0,
      center: center,
      base: { x: 142 - 162, y: 144 - 108 },
      variations: [""]
    }

    var img3: WMLImage = {
      name: imageStem + "_3",
      postfix: "",
      layer: 0,
      center: center,
      base: { x: 196 - 162, y: 128 - 108 },
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
        type: getTerrainMap(terrains),
        set_no_flag: [flag]
      });
    }

    tgGroup.addTg(terrainGraphic);
  }

  export var MOUNTAINS_2x2 = (tgGroup: TgGroup, terrains: ETerrain[], imageStem: string, flag: string, prob: number) => {
    var center = { x: 144 - 108, y: 144 - 72 }
    var img1: WMLImage = {
      name: imageStem + "_1",
      postfix: "",
      layer: 0,
      center: center,
      base: { x: 88 - 108, y: 107 - 72 },
      variations: [""]
    }

    var img2: WMLImage = {
      name: imageStem + "_2",
      postfix: "",
      layer: 0,
      center: center,
      base: { x: 142 - 108, y: 72 - 72 },
      variations: [""]
    }

    var img3: WMLImage = {
      name: imageStem + "_3",
      postfix: "",
      layer: 0,
      center: center,
      base: { x: 196 - 108, y: 107 - 72 },
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
        type: getTerrainMap(terrains),
        set_no_flag: [flag]
      });
      terrainGraphic.tiles.push({
        q: 1 - i,
        r: i,
        type: getTerrainMap(terrains),
        set_no_flag: [flag]
      });
    }

    tgGroup.addTg(terrainGraphic);
  }

  export var VOLCANO_2x2 = (tgGroup: TgGroup, volcano: ETerrain[], adjacent: ETerrain[], imageStem: string, flag: string) => {
    var center = { x: 144 - 108, y: 144 - 72 }
    var img1: WMLImage = {
      name: imageStem + "_1",
      postfix: "",
      layer: 0,
      center: center,
      base: { x: 88 - 108, y: 107 - 72 },
      variations: [""]
    }

    var img2: WMLImage = {
      name: imageStem + "_2",
      postfix: "",
      layer: 0,
      center: center,
      base: { x: 142 - 108, y: 72 - 72 },
      variations: [""]
    }

    var img3: WMLImage = {
      name: imageStem + "_3",
      postfix: "",
      center: center,
      layer: 0,
      base: { x: 196 - 108, y: 107 - 72 },
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
      type: getTerrainMap(volcano),
      set_no_flag: [flag]
    });
    terrainGraphic.tiles.push({
      q: 1,
      r: 0,
      type: getTerrainMap(adjacent),
      set_no_flag: [flag]
    });

    terrainGraphic.tiles.push({
      q: -1,
      r: 1,
      type: getTerrainMap(adjacent),
      set_no_flag: [flag]
    });
    terrainGraphic.tiles.push({
      q: 0,
      r: 1,
      type: getTerrainMap(adjacent),
      set_no_flag: [flag]
    });

    tgGroup.addTg(terrainGraphic);
  }

  var CORNER_PLFB_CONVEX = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, plfb: PLFB) => {
 
    // 0 ["tr", "r", "br", "bl", "l", "tl"]
    tgGroup.addTg({
      tiles: [{
        q: 0,
        r: 0,
        type: getTerrainMap(terrains),
        set_no_flag: [plfb.flag + "-tr"]
      }, {
          q: 0,
          r: -1,
          type: getTerrainMap(adjacent),
          set_no_flag: [plfb.flag + "-br"]
        }, {
          q: 1,
          r: -1,
          type: getTerrainMap(adjacent),
          set_no_flag: [plfb.flag + "-l"]
        }
      ],
      images: [{
        name: imageStem,
        postfix: "-tr",
        layer: plfb.layer,
        center: { x: 72 - 9, y: 0 },
        variations: [""]
      }],
      transition: getTerrainMap(adjacent),
      transitionNumber: 2,
      probability: plfb.prob,
      builder: plfb.builder
    });

    // 1 ["tr", "r", "br", "bl", "l", "tl"]
    tgGroup.addTg({
      tiles: [{
        q: 0,
        r: 0,
        type: getTerrainMap(terrains),
        set_no_flag: [plfb.flag + "-r"]
      }, {
          q: 1,
          r: -1,
          type: getTerrainMap(adjacent),
          set_no_flag: [plfb.flag + "-bl"]
        }, {
          q: 1,
          r: 0,
          type: getTerrainMap(adjacent),
          set_no_flag: [plfb.flag + "-tl"]
        }
      ],
      images: [{
        name: imageStem,
        postfix: "-r",
        layer: plfb.layer,
        center: { x: 72 - 9, y: 18 },
        variations: [""]
      }],
      transition: getTerrainMap(adjacent),
      transitionNumber: 2,
      probability: plfb.prob,
      builder: plfb.builder
    });

    // 2 ["tr", "r", "br", "bl", "l", "tl"]
    tgGroup.addTg({
      tiles: [{
        q: 0,
        r: 0,
        type: getTerrainMap(terrains),
        set_no_flag: [plfb.flag + "-br"]
      }, {
          q: 1,
          r: 0,
          type: getTerrainMap(adjacent),
          set_no_flag: [plfb.flag + "-l"]
        }, {
          q: 0,
          r: 1,
          type: getTerrainMap(adjacent),
          set_no_flag: [plfb.flag + "-tr"]
        }
      ],
      images: [{
        name: imageStem,
        postfix: "-br",
        layer: plfb.layer,
        center: { x: 54, y: 54 + 9 },
        variations: [""]
      }],
      transition: getTerrainMap(adjacent),
      transitionNumber: 2,
      probability: plfb.prob,
      builder: plfb.builder
    });

    // 3 ["tr", "r", "br", "bl", "l", "tl"]
    tgGroup.addTg({
      tiles: [{
        q: 0,
        r: 0,
        type: getTerrainMap(terrains),
        set_no_flag: [plfb.flag + "-bl"]
      }, {
          q: 0,
          r: 1,
          type: getTerrainMap(adjacent),
          set_no_flag: [plfb.flag + "-tl"]
        }, {
          q: -1,
          r: 1,
          type: getTerrainMap(adjacent),
          set_no_flag: [plfb.flag + "-r"]
        }
      ],
      images: [{
        name: imageStem,
        postfix: "-bl",
        layer: plfb.layer,
        center: { x: 0, y: 36 + 9 },
        variations: [""]
      }],
      transition: getTerrainMap(adjacent),
      transitionNumber: 2,
      probability: plfb.prob,
      builder: plfb.builder
    });

    // 4 ["tr", "r", "br", "bl", "l", "tl"]
    tgGroup.addTg({
      tiles: [{
        q: 0,
        r: 0,
        type: getTerrainMap(terrains),
        set_no_flag: [plfb.flag + "-l"]
      }, {
          q: -1,
          r: 1,
          type: getTerrainMap(adjacent),
          set_no_flag: [plfb.flag + "-tr"]
        }, {
          q: -1,
          r: 0,
          type: getTerrainMap(adjacent),
          set_no_flag: [plfb.flag + "-br"]
        }
      ],
      images: [{
        name: imageStem,
        postfix: "-l",
        layer: plfb.layer,
        center: { x: 0, y: 27 },
        variations: [""]
      }],
      transition: getTerrainMap(adjacent),
      transitionNumber: 2,
      probability: plfb.prob,
      builder: plfb.builder
    });

    // 5 ["tr", "r", "br", "bl", "l", "tl"]
    tgGroup.addTg({
      tiles: [{
        q: 0,
        r: 0,
        type: getTerrainMap(terrains),
        set_no_flag: [plfb.flag + "-tl"]
      }, {
          q: -1,
          r: 0,
          type: getTerrainMap(adjacent),
          set_no_flag: [plfb.flag + "-r"]
        }, {
          q: 0,
          r: -1,
          type: getTerrainMap(adjacent),
          set_no_flag: [plfb.flag + "-bl"]
        }
      ],
      images: [{
        name: imageStem,
        postfix: "-tl",
        layer: plfb.layer,
        center: { x: 9, y: -18 },
        variations: [""]
      }],
      transition: getTerrainMap(adjacent),
      transitionNumber: 2,
      probability: plfb.prob,
      builder: plfb.builder
    });
  }

  var CORNER_PLFB_CONCAVE = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[],
    imageStem: string, plfb: PLFB) => {
 
    // 0 ["tr", "r", "br", "bl", "l", "tl"]
    tgGroup.addTg({
      tiles: [{
        q: 0,
        r: 0,
        type: getTerrainMap(terrains),
        set_no_flag: [plfb.flag + "-tr"]
      }, {
          q: 0,
          r: -1,
          type: getTerrainMap(adjacent),
          set_no_flag: [plfb.flag + "-br"]
        }, {
          q: 1,
          r: -1,
          type: getTerrainMap(adjacent),
          set_no_flag: [plfb.flag + "-l"]
        }
      ],
      images: [{
        name: imageStem,
        postfix: "-tr",
        layer: plfb.layer,
        center: { x: 72 - 9, y: 0 },
        variations: [""]
      }],
      transition: getTerrainMap(adjacent),
      transitionNumber: 2,
      probability: plfb.prob,
      builder: plfb.builder
    });

    // 1 ["tr", "r", "br", "bl", "l", "tl"]
    tgGroup.addTg({
      tiles: [{
        q: 0,
        r: 0,
        type: getTerrainMap(terrains),
        set_no_flag: [plfb.flag + "-r"]
      }, {
          q: 1,
          r: -1,
          type: getTerrainMap(adjacent),
          set_no_flag: [plfb.flag + "-bl"]
        }, {
          q: 1,
          r: 0,
          type: getTerrainMap(adjacent),
          set_no_flag: [plfb.flag + "-tl"]
        }
      ],
      images: [{
        name: imageStem,
        postfix: "-r",
        layer: plfb.layer,
        center: { x: 72 - 9, y: 18 },
        variations: [""]
      }],
      transition: getTerrainMap(adjacent),
      transitionNumber: 2,
      probability: plfb.prob,
      builder: plfb.builder
    });

    // 2 ["tr", "r", "br", "bl", "l", "tl"]
    tgGroup.addTg({
      tiles: [{
        q: 0,
        r: 0,
        type: getTerrainMap(terrains),
        set_no_flag: [plfb.flag + "-br"]
      }, {
          q: 1,
          r: 0,
          type: getTerrainMap(adjacent),
          set_no_flag: [plfb.flag + "-l"]
        }, {
          q: 0,
          r: 1,
          type: getTerrainMap(adjacent),
          set_no_flag: [plfb.flag + "-tr"]
        }
      ],
      images: [{
        name: imageStem,
        postfix: "-br",
        layer: plfb.layer,
        center: { x: 54 + 9, y: 54 + 9 },
        variations: [""]
      }],
      transition: getTerrainMap(adjacent),
      transitionNumber: 2,
      probability: plfb.prob,
      builder: plfb.builder
    });

    // 3 ["tr", "r", "br", "bl", "l", "tl"]
    tgGroup.addTg({
      tiles: [{
        q: 0,
        r: 0,
        type: getTerrainMap(terrains),
        set_no_flag: [plfb.flag + "-bl"]
      }, {
          q: 0,
          r: 1,
          type: getTerrainMap(adjacent),
          set_no_flag: [plfb.flag + "-tl"]
        }, {
          q: -1,
          r: 1,
          type: getTerrainMap(adjacent),
          set_no_flag: [plfb.flag + "-r"]
        }
      ],
      images: [{
        name: imageStem,
        postfix: "-bl",
        layer: plfb.layer,
        center: { x: 9, y: 36 + 9 },
        variations: [""]
      }],
      transition: getTerrainMap(adjacent),
      transitionNumber: 2,
      probability: plfb.prob,
      builder: plfb.builder
    });

    // 4 ["tr", "r", "br", "bl", "l", "tl"]
    tgGroup.addTg({
      tiles: [{
        q: 0,
        r: 0,
        type: getTerrainMap(terrains),
        set_no_flag: [plfb.flag + "-l"]
      }, {
          q: -1,
          r: 1,
          type: getTerrainMap(adjacent),
          set_no_flag: [plfb.flag + "-tr"]
        }, {
          q: -1,
          r: 0,
          type: getTerrainMap(adjacent),
          set_no_flag: [plfb.flag + "-br"]
        }
      ],
      images: [{
        name: imageStem,
        postfix: "-l",
        layer: plfb.layer,
        center: { x: 9, y: 36 },
        variations: [""]
      }],
      transition: getTerrainMap(adjacent),
      transitionNumber: 2,
      probability: plfb.prob,
      builder: plfb.builder
    });

    // 5 ["tr", "r", "br", "bl", "l", "tl"]
    tgGroup.addTg({
      tiles: [{
        q: 0,
        r: 0,
        type: getTerrainMap(terrains),
        set_no_flag: [plfb.flag + "-tl"]
      }, {
          q: -1,
          r: 0,
          type: getTerrainMap(adjacent),
          set_no_flag: [plfb.flag + "-r"]
        }, {
          q: 0,
          r: -1,
          type: getTerrainMap(adjacent),
          set_no_flag: [plfb.flag + "-bl"]
        }
      ],
      images: [{
        name: imageStem,
        postfix: "-tl",
        layer: plfb.layer,
        center: { x: 9, y: -18 },
        variations: [""]
      }],
      transition: getTerrainMap(adjacent),
      transitionNumber: 2,
      probability: plfb.prob,
      builder: plfb.builder
    });
  }

  export var WALL_TRANSITION_PLFB = (tgGroup: TgGroup, terrains: ETerrain[],
    adjacent: ETerrain[], imageStem: string, plfb: PLFB) => {
    if (plfb.layer === undefined)
      plfb.layer = 0;
    if (plfb.flag === undefined)
      plfb.flag = "overlay";
    if (plfb.builder === undefined)
      plfb.builder = IB_IMAGE_SINGLE;
    if (plfb.prob === undefined)
      plfb.prob = 100;
    CORNER_PLFB_CONVEX(tgGroup, terrains, adjacent, imageStem + "-convex", plfb);
    CORNER_PLFB_CONCAVE(tgGroup, adjacent, terrains, imageStem + "-concave", plfb);
  }

  export var NEW_FOREST = (tgGroup: TgGroup, terrains: ETerrain[], overlays: EOverlay[],
    adjacent: ETerrain[], imageStem: string) => {
    tgGroup.addTg({
      tiles: [{
        q: 0,
        r: 0,
        overlay: getTerrainMap(overlays),
        type: getTerrainMap(terrains),
        set_no_flag: ["overlay"]
      }, {
          q: 0,
          r: -1,
          type: getTerrainMap(adjacent)
        }
      ],
      images: [{
        name: imageStem + "-small@V",
        postfix: "",
        layer: 0,
        center: { x: 36, y: 36 },
        base: { x: 36, y: 36 },
        variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"],
      }],
      probability: 100,
      rotations: ["n", "ne", "se", "s", "sw", "nw"],
      builder: IB_IMAGE_SINGLE
    });

    tgGroup.addTg({
      tiles: [{
        q: 0,
        r: 0,
        overlay: getTerrainMap(overlays),
        type: getTerrainMap(terrains),
        set_no_flag: ["overlay"]
      }],
      images: [{
        name: imageStem + "@V",
        postfix: "",
        layer: 0,
        center: { x: 36, y: 36 },
        base: { x: 36, y: 36 },
        variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"],
      }],
      probability: 100,
      builder: IB_IMAGE_SINGLE
    });
  }
  export var NEW_VILLAGE = (tgGroup: TgGroup, terrains: ETerrain[], overlays: EOverlay[],
    imageStem: string) => {

    tgGroup.addTg({
      tiles: [{
        q: 0,
        r: 0,
        overlay: getTerrainMap(overlays),
        type: getTerrainMap(terrains),
        set_no_flag: ["village"]
      }],
      images: [{
        name: imageStem + "@V",
        postfix: "",
        layer: 0,
        center: { x: 36, y: 36 },
        base: { x: 36, y: 36 },
        variations: ["", "2", "3", "4"],
      }],
      probability: 100,
      builder: IB_IMAGE_SINGLE

    });
  }

  export var OVERLAY_RESTRICTED_PLFB = (tgGroup: TgGroup, overlays: EOverlay[],
    adjacent: ETerrain[], imageStem: string, plfb: PLFB) => {
    GENERIC_RESTRICTED_PLFB(tgGroup, undefined, overlays, adjacent, undefined, imageStem, {
      layer: plfb.layer === undefined ? 0 : plfb.layer,
      flag: plfb.flag === undefined ? "overlay" : plfb.flag,
      prob: plfb.prob === undefined ? 100 : plfb.prob,
      builder: plfb.builder === undefined ? IB_IMAGE_SINGLE : plfb.builder,
    }, "");
  }

}