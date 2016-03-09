module WesnothTiles.Worker {
  'use strict';

  const getTerrainMap = (terrains: EOverlay[]| ETerrain[]): Map<number, boolean> => {
    if (terrains === undefined)
      return undefined;
    const terrainList = new Map<number, boolean>();
    (<number[]>terrains).forEach(terrain => {
      terrainList.set(terrain, true);
    });
    return terrainList;
  }


  export interface IBuilder {
    toDrawable(imageStem: string, postfix: string, pos: IVector, layer: number, base: IVector): Internal.DrawableData;
    toString(imageStem: string, postfix?: string): string;
  }
  // image builders.
  export const IB_IMAGE_SINGLE: IBuilder = {
    toDrawable: (imageStem: string, postfix: string, pos: IVector, layer: number, base: IVector) => {
      // console.log("Adding " + imageStem + postfix);
      return new Internal.DrawableData(
        pos.x,
        pos.y,
        imageStem + postfix, layer, base, undefined, undefined // TODO change me to undefined, i am not needed.
        )
    },

    toString: (imageStem: string, postfix: string) => {
      return imageStem + postfix;
    }
  }

  export const IB_ANIMATION_15_SLOW: IBuilder = {
    toDrawable: (imageStem: string, postfix: string, pos: IVector, layer: number, base: IVector) => {
      return new Internal.DrawableData(
        pos.x,
        pos.y,
        imageStem + "-@A" + postfix, layer, base, 15, 150
        )
    },
    toString: (imageStem: string, postfix: string) => {
      return imageStem + "-A01" + postfix;
    }
  }

  export const IB_ANIMATION_15: IBuilder = {
    toDrawable: (imageStem: string, postfix: string, pos: IVector, layer: number, base: IVector) => {
      return new Internal.DrawableData(
        pos.x,
        pos.y,
        imageStem + "-@A" + postfix, layer, base, 15, 110
        )
    },
    toString: (imageStem: string, postfix: string) => {
      return imageStem + "-A01" + postfix;
    }
  }

  export const IB_ANIMATION_06: IBuilder = {
    toDrawable: (imageStem: string, postfix: string, pos: IVector, layer: number, base: IVector) => {
      return new Internal.DrawableData(
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

    anchor?: number;
  }


  export interface WMLTerrainGraphics {
    tiles: WMLTile[];
    images: WMLImage[];
    probability: number;
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

  const GENERIC_SINGLE_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], overlays: EOverlay[], fog: boolean, imageStem: string, plfb: PLFB) => {
    const img: WMLImage = {
      name: imageStem,
      layer: plfb.layer,
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"],
      base: { x: 90 - 90, y: 108 - 144 },
      center: { x: 90 - 54, y: 108 - 72 }
    }

    const tile: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(terrains),
      overlay: getTerrainMap(overlays),
      fog: fog,
      set_no_flag: [plfb.flag]
    }

    const terrainGraphic: WMLTerrainGraphics = {
      tiles: [
        tile
      ],
      images: [img],
      probability: plfb.prob,
      builder: plfb.builder
    }
    tgGroup.addTg(terrainGraphic);
  }

  export const TERRAIN_BASE_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], imageStem: string, plfb: PLFB) => {
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

  const GENERIC_SINGLE_RANDOM_LFB = (tgGroup: TgGroup, terrains: ETerrain[], overlays: EOverlay[], fog: boolean, imageStem: string, lfb: LFB) => {
    GENERIC_SINGLE_PLFB(tgGroup, terrains, overlays, fog, imageStem + "@V", {
      prob: 100,
      layer: lfb.layer,
      flag: lfb.flag,
      builder: lfb.builder
    });
  }

  export const OVERLAY_RANDOM_LFB = (tgGroup: TgGroup, terrains: ETerrain[], overlays: EOverlay[], fog: boolean, imageStem: string, lfb: LFB) => {
    GENERIC_SINGLE_RANDOM_LFB(tgGroup, terrains, overlays, fog, imageStem, {
      layer: lfb.layer === undefined ? 0 : lfb.layer,
      flag: lfb.flag === undefined ? "overlay" : lfb.flag,
      builder: lfb.builder === undefined ? IB_IMAGE_SINGLE : lfb.builder,
    });
  }

  export const TERRAIN_BASE_RANDOM_LFB = (tgGroup: TgGroup, terrains: ETerrain[], imageStem: string, lfb: LFB) => {
    if (lfb.layer === undefined)
      lfb.layer = -1000;
    if (lfb.flag === undefined)
      lfb.flag = "base";
    if (lfb.builder === undefined)
      lfb.builder = IB_IMAGE_SINGLE;
    GENERIC_SINGLE_RANDOM_LFB(tgGroup, terrains, undefined, undefined, imageStem, lfb);
  }

  const BORDER_RESTRICTED_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], fog: boolean,
    adjacent: ETerrain[], fogAdjacent: boolean, imageStem: string, plfb: PLFB) => {
    const img: WMLImage = {
      name: imageStem,
      postfix: "-@R0",
      layer: plfb.layer,
      center: { x: 36, y: 36 },
      variations: ["", "2"]
    }

    const tile1: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(adjacent),
      fog: fogAdjacent,
      set_no_flag: [plfb.flag + "-@R0"]
    }

    const tile2: WMLTile = {
      q: 0,
      r: -1,
      type: getTerrainMap(terrains),
      fog: fog,
      set_no_flag: [plfb.flag + "-@R3"]
    }

    const terrainGraphic: WMLTerrainGraphics = {
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

  const BORDER_RESTRICTED6_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], fog: boolean,
    adjacent: ETerrain[], fogAdjacent: boolean, imageStem: string, plfb: PLFB) => {
    const img: WMLImage = {
      name: imageStem,
      postfix: "-@R0-@R1-@R2-@R3-@R4-@R5",
      layer: plfb.layer,
      center: { x: 36, y: 36 },
      variations: ["", "2"]
    }

    const tile1: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(adjacent),
      fog: fogAdjacent,
      set_no_flag: [plfb.flag + "-@R0", plfb.flag + "-@R1", plfb.flag + "-@R2", plfb.flag + "-@R3", plfb.flag + "-@R4", plfb.flag + "-@R5"]
    }

    const tile2: WMLTile = {
      q: 0,
      r: -1,
      type: getTerrainMap(terrains),
      fog: fog,
      set_no_flag: [plfb.flag + "-@R3"]
    }

    const tile3: WMLTile = {
      q: 1,
      r: -1,
      type: getTerrainMap(terrains),
      fog: fog,
      set_no_flag: [plfb.flag + "-@R4"]
    }

    const tile4: WMLTile = {
      q: 1,
      r: 0,
      type: getTerrainMap(terrains),
      fog: fog,
      set_no_flag: [plfb.flag + "-@R5"]
    }

    const tile5: WMLTile = {
      q: 0,
      r: 1,
      type: getTerrainMap(terrains),
      fog: fog,
      set_no_flag: [plfb.flag + "-@R0"]
    }

    const tile6: WMLTile = {
      q: -1,
      r: 1,
      type: getTerrainMap(terrains),
      fog: fog,
      set_no_flag: [plfb.flag + "-@R1"]
    }

    const tile7: WMLTile = {
      q: -1,
      r: 0,
      type: getTerrainMap(terrains),
      fog: fog,
      set_no_flag: [plfb.flag + "-@R2"]
    }

    const terrainGraphic: WMLTerrainGraphics = {
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

  const BORDER_RESTRICTED4_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], fog: boolean,
    adjacent: ETerrain[], fogAdjacent: boolean, imageStem: string, plfb: PLFB) => {
    const img: WMLImage = {
      name: imageStem,
      postfix: "-@R0-@R1-@R2-@R3",
      layer: plfb.layer,
      center: { x: 36, y: 36 },
      variations: ["", "2"]
    }

    const tile1: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(adjacent),
      fog: fogAdjacent,
      set_no_flag: [plfb.flag + "-@R0", plfb.flag + "-@R1", plfb.flag + "-@R2", plfb.flag + "-@R3"]
    }

    const tile2: WMLTile = {
      q: 0,
      r: -1,
      type: getTerrainMap(terrains),
      fog: fog,
      set_no_flag: [plfb.flag + "-@R3"]
    }

    const tile3: WMLTile = {
      q: 1,
      r: -1,
      type: getTerrainMap(terrains),
      fog: fog,
      set_no_flag: [plfb.flag + "-@R4"]
    }

    const tile4: WMLTile = {
      q: 1,
      r: 0,
      type: getTerrainMap(terrains),
      fog: fog,
      set_no_flag: [plfb.flag + "-@R5"]
    }

    const tile5: WMLTile = {
      q: 0,
      r: 1,
      type: getTerrainMap(terrains),
      fog: fog,
      set_no_flag: [plfb.flag + "-@R0"]
    }

    const terrainGraphic: WMLTerrainGraphics = {
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

  const BORDER_RESTRICTED3_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], fog: boolean,
    adjacent: ETerrain[], fogAdjacent: boolean, imageStem: string, plfb: PLFB) => {
    const img: WMLImage = {
      name: imageStem,
      postfix: "-@R0-@R1-@R2",
      layer: plfb.layer,
      center: { x: 36, y: 36 },
      variations: ["", "2"]
    }

    const tile1: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(adjacent),
      fog: fogAdjacent,
      set_no_flag: [plfb.flag + "-@R0", plfb.flag + "-@R1", plfb.flag + "-@R2"]
    }

    const tile2: WMLTile = {
      q: 0,
      r: -1,
      type: getTerrainMap(terrains),
      fog: fog,
      set_no_flag: [plfb.flag + "-@R3"]
    }

    const tile3: WMLTile = {
      q: 1,
      r: -1,
      type: getTerrainMap(terrains),
      fog: fog,
      set_no_flag: [plfb.flag + "-@R4"]
    }

    const tile4: WMLTile = {
      q: 1,
      r: 0,
      type: getTerrainMap(terrains),
      fog: fog,
      set_no_flag: [plfb.flag + "-@R5"]
    }

    const terrainGraphic: WMLTerrainGraphics = {
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

  const BORDER_RESTRICTED2_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], fog: boolean,
    adjacent: ETerrain[], fogAdjacent: boolean, imageStem: string, plfb: PLFB) => {
    const img: WMLImage = {
      name: imageStem,
      postfix: "-@R0-@R1",
      layer: plfb.layer,
      center: { x: 36, y: 36 },
      variations: ["", "2"]
    }

    const tile1: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(adjacent),
      fog: fogAdjacent,
      set_no_flag: [plfb.flag + "-@R0", plfb.flag + "-@R1"]
    }

    const tile2: WMLTile = {
      q: 0,
      r: -1,
      type: getTerrainMap(terrains),
      fog: fog,
      set_no_flag: [plfb.flag + "-@R3"]
    }

    const tile3: WMLTile = {
      q: 1,
      r: -1,
      type: getTerrainMap(terrains),
      fog: fog,
      set_no_flag: [plfb.flag + "-@R4"]
    }

    const terrainGraphic: WMLTerrainGraphics = {
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

  const BORDER_RESTRICTED6_RANDOM_LFB = (tgGroup: TgGroup, terrains: ETerrain[], fog: boolean,
    adjacent: ETerrain[], fogAdjacent: boolean, imageStem: string, lfb: LFB) => {
    BORDER_RESTRICTED6_PLFB(tgGroup, terrains, fog, adjacent, fogAdjacent, imageStem + "@V", {
      prob: 100,
      layer: lfb.layer,
      flag: lfb.flag,
      builder: lfb.builder
    });
  }

  const BORDER_RESTRICTED4_RANDOM_LFB = (tgGroup: TgGroup, terrains: ETerrain[], fog: boolean,
    adjacent: ETerrain[], fogAdjacent: boolean, imageStem: string, lfb: LFB) => {
    BORDER_RESTRICTED4_PLFB(tgGroup, terrains, fog, adjacent, fogAdjacent, imageStem + "@V", {
      prob: 100,
      layer: lfb.layer,
      flag: lfb.flag,
      builder: lfb.builder
    });
  }

  const BORDER_RESTRICTED3_RANDOM_LFB = (tgGroup: TgGroup, terrains: ETerrain[], fog: boolean,
    adjacent: ETerrain[], fogAdjacent: boolean, imageStem: string, lfb: LFB) => {
    BORDER_RESTRICTED3_PLFB(tgGroup, terrains, fog, adjacent, fogAdjacent, imageStem + "@V", {
      prob: 100,
      layer: lfb.layer,
      flag: lfb.flag,
      builder: lfb.builder
    });
  }

  const BORDER_RESTRICTED2_RANDOM_LFB = (tgGroup: TgGroup, terrains: ETerrain[], fog: boolean,
    adjacent: ETerrain[], fogAdjacent: boolean, imageStem: string, lfb: LFB) => {
    BORDER_RESTRICTED2_PLFB(tgGroup, terrains, fog, adjacent, fogAdjacent, imageStem + "@V", {
      prob: 100,
      layer: lfb.layer,
      flag: lfb.flag,
      builder: lfb.builder
    });
  }

  const BORDER_RESTRICTED_RANDOM_LFB = (tgGroup: TgGroup, terrains: ETerrain[], fog: boolean,
    adjacent: ETerrain[], fogAdjacent: boolean, imageStem: string, lfb: LFB) => {
    BORDER_RESTRICTED_PLFB(tgGroup, terrains, fog, adjacent, fogAdjacent, imageStem + "@V", {
      prob: 100,
      layer: lfb.layer,
      flag: lfb.flag,
      builder: lfb.builder
    });
  }

  const BORDER_COMPLETE_LFB = (tgGroup: TgGroup, terrains: ETerrain[], fog: boolean,
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

  // grades is used by BORDER_COMPLETE, to filter out not needed macros.
  export const TRANSITION_COMPLETE_LFB = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, lfb: LFB, grades: number[]) => {
    if (lfb.layer === undefined)
      lfb.layer = -500;
    if (lfb.flag === undefined)
      lfb.flag = "transition";
    if (lfb.builder === undefined)
      lfb.builder = IB_IMAGE_SINGLE;
    BORDER_COMPLETE_LFB(tgGroup, terrains, undefined, adjacent, undefined, imageStem, lfb, grades);
  }

  export const FOG_TRANSITION_LFB = (tgGroup: TgGroup, fog: boolean, fogAdjacent: boolean, imageStem: string, lfb: LFB, grades: number[]) => {
    if (lfb.layer === undefined)
      lfb.layer = -500;
    if (lfb.flag === undefined)
      lfb.flag = "transition";
    if (lfb.builder === undefined)
      lfb.builder = IB_IMAGE_SINGLE;
    BORDER_COMPLETE_LFB(tgGroup, undefined, fog, undefined, fogAdjacent, imageStem, lfb, grades);
  }


  const GENERIC_SINGLEHEX_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], imageStem: string, plfb: PLFB) => {
    const img: WMLImage = {
      name: imageStem,
      layer: plfb.layer,
      center: { x: 36, y: 36 },
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
    }

    const tile: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(terrains),
      set_no_flag: [plfb.flag]
    }

    const terrainGraphic: WMLTerrainGraphics = {
      tiles: [
        tile
      ],
      images: [img],
      probability: plfb.prob,
      builder: plfb.builder
    }
    tgGroup.addTg(terrainGraphic);
  }

  export const TERRAIN_BASE_SINGLEHEX_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], imageStem: string, plfb: PLFB) => {
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

  export const ANIMATED_WATER_15_TRANSITION = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, layer: number) => {
    const img: WMLImage = {
      name: imageStem,
      postfix: "-@R0",
      layer: layer,
      center: { x: 36, y: 36 },
      variations: [""]
    }
    const tile1: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(adjacent),

      set_no_flag: ["transition-@R0"]
    }

    const tile2: WMLTile = {
      q: 0,
      r: -1,
      type: getTerrainMap(terrains),
    }

    const terrainGraphic: WMLTerrainGraphics = {
      tiles: [
        tile1,
        tile2
      ],
      probability: 100,
      images: [img],
      rotations: ["n", "ne", "se", "s", "sw", "nw"],
      builder: IB_ANIMATION_15_SLOW,
      transition: getTerrainMap(terrains),
      transitionNumber: 1
    }
    tgGroup.addTg(terrainGraphic);
  }

  export const NEW_BEACH = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string) => {
    const concave_img1: WMLImage = {
      name: imageStem + "-concave",
      postfix: "-@R0-@R5",
      layer: -500,
      center: { x: 36, y: 36 },
      variations: [""]
    }

    const concave_img2: WMLImage = {
      name: imageStem + "-concave",
      postfix: "-@R0-@R1",
      layer: -500,
      center: { x: 36, y: 36 },
      variations: [""]
    }

    const concave_tile1: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(adjacent),
      set_no_flag: ["beach-@R0-@R5", "beach-@R0-@R1"]
    }

    const concave_tile2: WMLTile = {
      q: 0,
      r: -1,
      type: getTerrainMap(terrains),
      set_no_flag: ["beach-@R2-@R3"]
    }

    const concave_tile3: WMLTile = {
      q: 1,
      r: -1,
      type: getTerrainMap(terrains),
      set_no_flag: ["beach-@R4-@R3"]
    }

    const concave_terrainGraphic: WMLTerrainGraphics = {
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

    const convex0_img1: WMLImage = {
      name: imageStem + "-convex",
      postfix: "-@R0-@R5",
      layer: -500,
      center: { x: 36, y: 36 },
      variations: [""]
    }

    const convex0_img2: WMLImage = {
      name: imageStem + "-convex",
      postfix: "-@R0-@R1",
      layer: -500,
      center: { x: 36, y: 36 },
      variations: [""]
    }

    const convex0_tile1: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(terrains),
      set_no_flag: ["beach-@R0-@R5", "beach-@R0-@R1"]
    }

    const convex0_tile2: WMLTile = {
      q: 0,
      r: -1,
      type: getTerrainMap(adjacent),
      set_no_flag: ["beach-@R2-@R3"]
    }

    const convex0_tile3: WMLTile = {
      q: 1,
      r: -1,
      type: getTerrainMap(adjacent),
      set_no_flag: ["beach-@R4-@R3"]
    }

    const convex0_terrainGraphic: WMLTerrainGraphics = {
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
    const convex1_img1: WMLImage = {
      name: imageStem + "-convex",
      postfix: "-@R0-@R5",
      layer: -500,
      center: { x: 36, y: 36 },
      variations: [""]
    }

    const convex1_tile1: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(terrains),
      set_no_flag: ["beach-@R0-@R5"]
    }

    const convex1_tile2: WMLTile = {
      q: 0,
      r: -1,
      type: getTerrainMap(adjacent),
      set_no_flag: ["beach-@R2-@R3"]
    }

    const convex1_tile3: WMLTile = {
      q: 1,
      r: -1,
      type: getTerrainMap(swapTerrains(adjacent.concat(terrains))),
    }

    const convex1_terrainGraphic: WMLTerrainGraphics = {
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
    const convex2_img1: WMLImage = {
      name: imageStem + "-convex",
      postfix: "-@R0-@R1",
      layer: -500,
      center: { x: 36, y: 36 },
      variations: [""]
    }

    const convex2_tile1: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(terrains),

      set_no_flag: ["beach-@R0-@R1"]
    }

    const convex2_tile2: WMLTile = {
      q: 0,
      r: -1,
      type: getTerrainMap(swapTerrains(adjacent.concat(terrains))),
    }

    const convex2_tile3: WMLTile = {
      q: 1,
      r: -1,
      type: getTerrainMap(adjacent),
      set_no_flag: ["beach-@R4-@R3"]
    }

    const convex2_terrainGraphic: WMLTerrainGraphics = {
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

  export const NEW_WAVES = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], layer: number, imageStem: string) => {
    const convex_img1: WMLImage = {
      name: imageStem + "-convex",
      postfix: "-@R0",
      layer: layer,
      center: { x: 36, y: 36 },
      variations: [""]
    }

    const convex_tile1: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(terrains),
      set_no_flag: ["waves-@R0"]
    }

    const convex_tile2: WMLTile = {
      q: 0,
      r: -1,
      type: getTerrainMap(adjacent),
      set_no_flag: ["waves-@R2"]
    }

    const convex_tile3: WMLTile = {
      q: 1,
      r: -1,
      type: getTerrainMap(adjacent),
      set_no_flag: ["waves-@R4"]
    }

    const convex_terrainGraphic: WMLTerrainGraphics = {
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

    const concave_img1: WMLImage = {
      name: imageStem + "-concave",
      postfix: "-@R0",
      layer: layer,
      center: { x: 36, y: 36 },
      variations: [""]
    }

    const concave_tile1: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(adjacent),
      set_no_flag: ["waves-@R0"]
    }

    const concave_tile2: WMLTile = {
      q: 0,
      r: -1,
      type: getTerrainMap(terrains),
      set_no_flag: ["waves-@R2"]
    }

    const concave_tile3: WMLTile = {
      q: 1,
      r: -1,
      type: getTerrainMap(terrains),
      set_no_flag: ["waves-@R4"]
    }

    const concave_terrainGraphic: WMLTerrainGraphics = {
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

  export const MOUNTAIN_SINGLE = (tgGroup: TgGroup, terrains: ETerrain[], imageStem: string, prob: number, flag: string) => {
    const img: WMLImage = {
      name: imageStem,
      base: { x: 90 - 54, y: 107 - 72 },
      layer: 0,
      center: { x: 90 - 54, y: 108 - 72 },
      variations: ["", "2", "3", "4", "5", "6"],
    }

    const tile: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(terrains),
      set_no_flag: [flag]
    }

    const terrainGraphic: WMLTerrainGraphics = {
      tiles: [tile],
      images: [img],
      probability: prob,
      builder: IB_IMAGE_SINGLE
    }
    tgGroup.addTg(terrainGraphic);
  }

  const GENERIC_RESTRICTED3_RANDOM_LFB = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, lfb: LFB, rotation: string) => {
    GENERIC_RESTRICTED3_PLFB(tgGroup, terrains, adjacent, imageStem + "@V", {
      layer: lfb.layer,
      prob: 100,
      flag: lfb.flag,
      builder: lfb.builder
    }, rotation);
  }

  const GENERIC_RESTRICTED2_RANDOM_LFB = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, lfb: LFB, rotation: string) => {
    GENERIC_RESTRICTED2_PLFB(tgGroup, terrains, adjacent, imageStem + "@V", {
      layer: lfb.layer,
      prob: 100,
      flag: lfb.flag,
      builder: lfb.builder
    }, rotation);
  }

  const GENERIC_RESTRICTED_RANDOM_LFB = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, lfb: LFB, rotation: string) => {
    GENERIC_RESTRICTED_PLFB(tgGroup, terrains, undefined, adjacent, undefined, imageStem + "@V", {
      layer: lfb.layer,
      prob: 100,
      flag: lfb.flag,
      builder: lfb.builder
    }, rotation);
  }

  const GENERIC_COMPLETE_LFB = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, lfb: LFB) => {
    GENERIC_RESTRICTED3_RANDOM_LFB(tgGroup, terrains, adjacent, imageStem + "-small", lfb, "-@R0-@R1-@R2");
    GENERIC_RESTRICTED3_RANDOM_LFB(tgGroup, terrains, adjacent, imageStem + "-small", lfb, "");
    GENERIC_RESTRICTED2_RANDOM_LFB(tgGroup, terrains, adjacent, imageStem + "-small", lfb, "-@R0-@R1");
    GENERIC_RESTRICTED2_RANDOM_LFB(tgGroup, terrains, adjacent, imageStem + "-small", lfb, "");
    GENERIC_RESTRICTED_RANDOM_LFB(tgGroup, terrains, adjacent, imageStem + "-small", lfb, "-@R0");
    GENERIC_RESTRICTED_RANDOM_LFB(tgGroup, terrains, adjacent, imageStem + "-small", lfb, "");
    GENERIC_SINGLE_RANDOM_LFB(tgGroup, terrains, undefined, undefined, imageStem, lfb);
  }

  export const OVERLAY_COMPLETE_LFB = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, lfb: LFB) => {
    GENERIC_COMPLETE_LFB(tgGroup, terrains, adjacent, imageStem, {
      layer: lfb.layer === undefined ? 0 : lfb.layer,
      flag: lfb.flag === undefined ? "overlay" : lfb.flag,
      builder: lfb.builder === undefined ? IB_IMAGE_SINGLE : lfb.builder,
    });
  }

  export const MOUNTAIN_SINGLE_RANDOM = (tgGroup: TgGroup, terrains: ETerrain[], imageStem: string, flag: string) => {
    MOUNTAIN_SINGLE(tgGroup, terrains, imageStem + "@V", 100, flag);
  }

  const GENERIC_RESTRICTED3_N_NE_SE_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, plfb: PLFB, rotation: string) => {
    const img: WMLImage = {
      name: imageStem,
      postfix: rotation,
      layer: plfb.layer,
      base: { x: 90 - 90, y: 108 - 144 },
      center: { x: 90 - 54, y: 108 - 72 },
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
    }

    const tile1: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(terrains),
      set_no_flag: [plfb.flag]
    }

    const tile2: WMLTile = {
      q: 0,
      r: -1,
      type: getTerrainMap(adjacent)
    }

    const tile3: WMLTile = {
      q: 1,
      r: -1,
      type: getTerrainMap(adjacent)
    }

    const tile4: WMLTile = {
      q: 1,
      r: 0,
      type: getTerrainMap(adjacent)
    }

    const terrainGraphic: WMLTerrainGraphics = {
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

  const GENERIC_RESTRICTED3_N_NE_S_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, plfb: PLFB, rotation: string) => {
    const img: WMLImage = {
      name: imageStem,
      postfix: rotation,
      layer: plfb.layer,
      base: { x: 90 - 90, y: 108 - 144 },
      center: { x: 90 - 54, y: 108 - 72 },
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
    }

    const tile1: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(terrains),
      set_no_flag: [plfb.flag]
    }

    const tile2: WMLTile = {
      q: 0,
      r: -1,
      type: getTerrainMap(adjacent)
    }

    const tile3: WMLTile = {
      q: 1,
      r: -1,
      type: getTerrainMap(adjacent)
    }

    const tile4: WMLTile = {
      q: 0,
      r: 1,
      type: getTerrainMap(adjacent)
    }

    const terrainGraphic: WMLTerrainGraphics = {
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

  const GENERIC_RESTRICTED3_N_NE_SW_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, plfb: PLFB, rotation: string) => {
    const img: WMLImage = {
      name: imageStem,
      postfix: rotation,
      layer: plfb.layer,
      base: { x: 90 - 90, y: 108 - 144 },
      center: { x: 90 - 54, y: 108 - 72 },
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
    }

    const tile1: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(terrains),
      set_no_flag: [plfb.flag]
    }

    const tile2: WMLTile = {
      q: 0,
      r: -1,
      type: getTerrainMap(adjacent)
    }

    const tile3: WMLTile = {
      q: 1,
      r: -1,
      type: getTerrainMap(adjacent)
    }

    const tile4: WMLTile = {
      q: -1,
      r: 1,
      type: getTerrainMap(adjacent)
    }

    const terrainGraphic: WMLTerrainGraphics = {
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

  const GENERIC_RESTRICTED3_N_SE_SW_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, plfb: PLFB, rotation: string) => {
    const img: WMLImage = {
      name: imageStem,
      postfix: rotation,
      layer: plfb.layer,
      base: { x: 90 - 90, y: 108 - 144 },
      center: { x: 90 - 54, y: 108 - 72 },
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
    }

    const tile1: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(terrains),
      set_no_flag: [plfb.flag]
    }

    const tile2: WMLTile = {
      q: 0,
      r: -1,
      type: getTerrainMap(adjacent)
    }

    const tile3: WMLTile = {
      q: 1,
      r: 0,
      type: getTerrainMap(adjacent)
    }

    const tile4: WMLTile = {
      q: -1,
      r: 1,
      type: getTerrainMap(adjacent)
    }

    const terrainGraphic: WMLTerrainGraphics = {
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

  const GENERIC_RESTRICTED3_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, plfb: PLFB, rotation: string) => {
    GENERIC_RESTRICTED3_N_NE_SE_PLFB(tgGroup, terrains, adjacent, imageStem, plfb, rotation);
    GENERIC_RESTRICTED3_N_NE_S_PLFB(tgGroup, terrains, adjacent, imageStem, plfb, rotation);
    GENERIC_RESTRICTED3_N_NE_SW_PLFB(tgGroup, terrains, adjacent, imageStem, plfb, rotation);
    GENERIC_RESTRICTED3_N_SE_SW_PLFB(tgGroup, terrains, adjacent, imageStem, plfb, rotation);
  }


  export const OVERLAY_RESTRICTED2_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, plfb: PLFB) => {
    GENERIC_RESTRICTED2_PLFB(tgGroup, terrains, adjacent, imageStem, {
      prob: plfb.prob === undefined ? 100 : plfb.prob,
      layer: plfb.layer === undefined ? 0 : plfb.layer,
      flag: plfb.flag === undefined ? "overlay" : plfb.flag,
      builder: plfb.builder === undefined ? IB_IMAGE_SINGLE : plfb.builder,
    }, "");
  }

  export const OVERLAY_RESTRICTED3_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, plfb: PLFB) => {
    GENERIC_RESTRICTED3_PLFB(tgGroup, terrains, adjacent, imageStem, {
      prob: plfb.prob === undefined ? 100 : plfb.prob,
      layer: plfb.layer === undefined ? 0 : plfb.layer,
      flag: plfb.flag === undefined ? "overlay" : plfb.flag,
      builder: plfb.builder === undefined ? IB_IMAGE_SINGLE : plfb.builder,
    }, "");
  }

  const GENERIC_RESTRICTED2_N_NE_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, plfb: PLFB, rotation: string) => {
    const img: WMLImage = {
      name: imageStem,
      postfix: rotation,
      layer: plfb.layer,
      base: { x: 90 - 90, y: 108 - 144 },
      center: { x: 90 - 54, y: 108 - 72 },
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
    }

    const tile1: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(terrains),
      set_no_flag: [plfb.flag]
    }

    const tile2: WMLTile = {
      q: 0,
      r: -1,
      type: getTerrainMap(adjacent)
    }

    const tile3: WMLTile = {
      q: 1,
      r: -1,
      type: getTerrainMap(adjacent)
    }

    const terrainGraphic: WMLTerrainGraphics = {
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

  const GENERIC_RESTRICTED2_N_SE_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, plfb: PLFB, rotation: string) => {
    const img: WMLImage = {
      name: imageStem,
      postfix: rotation,
      layer: plfb.layer,
      base: { x: 90 - 90, y: 108 - 144 },
      center: { x: 90 - 54, y: 108 - 72 },
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
    }

    const tile1: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(terrains),
      set_no_flag: [plfb.flag]
    }

    const tile2: WMLTile = {
      q: 0,
      r: -1,
      type: getTerrainMap(adjacent)
    }


    const tile3: WMLTile = {
      q: 1,
      r: 0,
      type: getTerrainMap(adjacent)
    }

    const terrainGraphic: WMLTerrainGraphics = {
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

  const GENERIC_RESTRICTED2_N_S_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, plfb: PLFB, rotation: string) => {
    const img: WMLImage = {
      name: imageStem,
      postfix: rotation,
      layer: plfb.layer,
      base: { x: 90 - 90, y: 108 - 144 },
      center: { x: 90 - 54, y: 108 - 72 },
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
    }

    const tile1: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(terrains),
      set_no_flag: [plfb.flag]
    }

    const tile2: WMLTile = {
      q: 0,
      r: -1,
      type: getTerrainMap(adjacent)
    }

    const tile3: WMLTile = {
      q: 0,
      r: 1,
      type: getTerrainMap(adjacent)
    }

    const terrainGraphic: WMLTerrainGraphics = {
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

  export const OVERLAY_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], overlays: EOverlay[], fog: boolean, imageStem: string, plfb: PLFB) => {
    GENERIC_SINGLE_PLFB(tgGroup, terrains, overlays, fog, imageStem, {
      prob: plfb.prob === undefined ? 100 : plfb.prob,
      layer: plfb.layer === undefined ? 0 : plfb.layer,
      flag: plfb.flag === undefined ? "overlay" : plfb.flag,
      builder: plfb.builder === undefined ? IB_IMAGE_SINGLE : plfb.builder,
    });
  }

  const GENERIC_RESTRICTED2_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, plfb: PLFB, rotation: string) => {
    GENERIC_RESTRICTED2_N_NE_PLFB(tgGroup, terrains, adjacent, imageStem, plfb, rotation);
    GENERIC_RESTRICTED2_N_SE_PLFB(tgGroup, terrains, adjacent, imageStem, plfb, rotation);
    GENERIC_RESTRICTED2_N_S_PLFB(tgGroup, terrains, adjacent, imageStem, plfb, rotation);
  }

  export const OVERLAY_ROTATION_RESTRICTED2_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, plfb: PLFB) => {
    GENERIC_RESTRICTED2_PLFB(tgGroup, terrains, adjacent, imageStem, {
      prob: plfb.prob === undefined ? 100 : plfb.prob,
      layer: plfb.layer === undefined ? 0 : plfb.layer,
      flag: plfb.flag === undefined ? "overlay" : plfb.flag,
      builder: plfb.builder === undefined ? IB_IMAGE_SINGLE : plfb.builder,
    }, "-@R0-@R1");
  }

  const GENERIC_RESTRICTED_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], overlays: EOverlay[],
    adjacent: ETerrain[], adjacentOverlays: ETerrain[], imageStem: string, plfb: PLFB, rotation: string) => {
    const img: WMLImage = {
      name: imageStem,
      postfix: rotation,
      layer: plfb.layer,
      base: { x: 90 - 90, y: 108 - 144 },
      center: { x: 90 - 54, y: 108 - 72 },
      variations: ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
    }

    const tile1: WMLTile = {
      q: 0,
      r: 0,
      type: getTerrainMap(terrains),
      overlay: getTerrainMap(overlays),
      set_no_flag: [plfb.flag]
    }

    const tile2: WMLTile = {
      q: 0,
      r: -1,
      type: getTerrainMap(adjacent),
      overlay: getTerrainMap(adjacentOverlays),
    }

    const terrainGraphic: WMLTerrainGraphics = {
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

  export const OVERLAY_ROTATION_RESTRICTED_PLFB = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, plfb: PLFB) => {
    GENERIC_RESTRICTED_PLFB(tgGroup, terrains, undefined, adjacent, undefined, imageStem, {
      prob: plfb.prob === undefined ? 100 : plfb.prob,
      layer: plfb.layer === undefined ? 0 : plfb.layer,
      flag: plfb.flag === undefined ? "overlay" : plfb.flag,
      builder: plfb.builder === undefined ? IB_IMAGE_SINGLE : plfb.builder,
    }, "-@R0");
  }

  export const MOUNTAINS_2x4_NW_SE = (tgGroup: TgGroup, terrains: ETerrain[], imageStem: string, flag: string, prob: number) => {
    const center = { x: 198 - 54, y: 180 - 108 }
    const img1: WMLImage = {
      name: imageStem + "_1",
      postfix: "",
      layer: 0,
      center: center,
      base: { x: 88 - 54, y: 107 - 108 },
      variations: [""]
    }

    const img2: WMLImage = {
      name: imageStem + "_2",
      postfix: "",
      layer: 0,
      center: center,
      base: { x: 144 - 54, y: 107 - 108 },
      variations: [""]
    }

    const img3: WMLImage = {
      name: imageStem + "_3",
      postfix: "",
      center: center,
      layer: 0,
      base: { x: 196 - 54, y: 107 - 108 },
      variations: [""]
    }

    const img4: WMLImage = {
      name: imageStem + "_4",
      postfix: "",
      center: center,
      layer: 0,
      base: { x: 248 - 54, y: 107 - 108 },
      variations: [""]
    }

    const img5: WMLImage = {
      name: imageStem + "_5",
      postfix: "",
      center: center,
      layer: 0,
      base: { x: 304 - 54, y: 107 - 108 },
      variations: [""]
    }

    const terrainGraphic: WMLTerrainGraphics = {
      tiles: [],
      images: [img1, img2, img3, img4, img5],
      probability: prob,
      builder: IB_IMAGE_SINGLE
    }

    for (let i = 0; i < 4; i++) {
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

  export const MOUNTAINS_1x3_NW_SE = (tgGroup: TgGroup, terrains: ETerrain[], imageStem: string, flag: string, prob: number) => {
    const center = { x: 144 - 54, y: 162 - 108 }
    const img1: WMLImage = {
      name: imageStem + "_1",
      postfix: "",
      layer: 0,
      center: center,
      base: { x: 88 - 54, y: 128 - 108 },
      variations: [""]
    }

    const img2: WMLImage = {
      name: imageStem + "_2",
      postfix: "",
      layer: 0,
      center: center,
      base: { x: 142 - 54, y: 144 - 108 },
      variations: [""]
    }

    const img3: WMLImage = {
      name: imageStem + "_3",
      postfix: "",
      layer: 0,
      center: center,
      base: { x: 196 - 54, y: 180 - 108 },
      variations: [""]
    }

    const terrainGraphic: WMLTerrainGraphics = {
      tiles: [],
      images: [img1, img2, img3],
      probability: prob,
      builder: IB_IMAGE_SINGLE
    }

    for (let i = 0; i < 3; i++) {
      terrainGraphic.tiles.push({
        q: i,
        r: 0,
        type: getTerrainMap(terrains),
        set_no_flag: [flag]
      });
    }

    tgGroup.addTg(terrainGraphic);
  }

  export const MOUNTAINS_2x4_SW_NE = (tgGroup: TgGroup, terrains: ETerrain[], imageStem: string, flag: string, prob: number) => {
    const center = { x: 198 - 216, y: 180 - 72 }
    const img1: WMLImage = {
      name: imageStem + "_1",
      postfix: "",
      layer: 0,
      center: center,
      base: { x: 88 - 216, y: 107 - 72 },
      variations: [""]
    }

    const img2: WMLImage = {
      name: imageStem + "_2",
      postfix: "",
      layer: 0,
      center: center,
      base: { x: 144 - 216, y: 107 - 72 },
      variations: [""]
    }

    const img3: WMLImage = {
      name: imageStem + "_3",
      postfix: "",
      layer: 0,
      center: center,
      base: { x: 196 - 216, y: 107 - 72 },
      variations: [""]
    }

    const img4: WMLImage = {
      name: imageStem + "_4",
      postfix: "",
      layer: 0,
      center: center,
      base: { x: 248 - 216, y: 107 - 72 },
      variations: [""]
    }

    const img5: WMLImage = {
      name: imageStem + "_5",
      postfix: "",
      layer: 0,
      center: center,
      base: { x: 304 - 216, y: 107 - 72 },
      variations: [""]
    }

    const terrainGraphic: WMLTerrainGraphics = {
      tiles: [],
      images: [img1, img2, img3, img4, img5],
      probability: prob,
      builder: IB_IMAGE_SINGLE
    }

    for (let i = 0; i < 4; i++) {
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

  export const MOUNTAINS_1x3_SW_NE = (tgGroup: TgGroup, terrains: ETerrain[], imageStem: string, flag: string, prob: number) => {
    const center = { x: 144 - 162, y: 162 - 108 }
    const img1: WMLImage = {
      name: imageStem + "_1",
      postfix: "",
      layer: 0,
      center: center,
      base: { x: 88 - 162, y: 180 - 108 },
      variations: [""]
    }

    const img2: WMLImage = {
      name: imageStem + "_2",
      postfix: "",
      layer: 0,
      center: center,
      base: { x: 142 - 162, y: 144 - 108 },
      variations: [""]
    }

    const img3: WMLImage = {
      name: imageStem + "_3",
      postfix: "",
      layer: 0,
      center: center,
      base: { x: 196 - 162, y: 128 - 108 },
      variations: [""]
    }

    const terrainGraphic: WMLTerrainGraphics = {
      tiles: [],
      images: [img1, img2, img3],
      probability: prob,
      builder: IB_IMAGE_SINGLE
    }

    for (let i = 0; i < 3; i++) {
      terrainGraphic.tiles.push({
        q: -i,
        r: i,
        type: getTerrainMap(terrains),
        set_no_flag: [flag]
      });
    }

    tgGroup.addTg(terrainGraphic);
  }

  export const MOUNTAINS_2x2 = (tgGroup: TgGroup, terrains: ETerrain[], imageStem: string, flag: string, prob: number) => {
    const center = { x: 144 - 108, y: 144 - 72 }
    const img1: WMLImage = {
      name: imageStem + "_1",
      postfix: "",
      layer: 0,
      center: center,
      base: { x: 88 - 108, y: 107 - 72 },
      variations: [""]
    }

    const img2: WMLImage = {
      name: imageStem + "_2",
      postfix: "",
      layer: 0,
      center: center,
      base: { x: 142 - 108, y: 72 - 72 },
      variations: [""]
    }

    const img3: WMLImage = {
      name: imageStem + "_3",
      postfix: "",
      layer: 0,
      center: center,
      base: { x: 196 - 108, y: 107 - 72 },
      variations: [""]
    }

    const terrainGraphic: WMLTerrainGraphics = {
      tiles: [],
      images: [img1, img2, img3],
      probability: prob,
      builder: IB_IMAGE_SINGLE
    }

    for (let i = 0; i < 2; i++) {
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

  export const VOLCANO_2x2 = (tgGroup: TgGroup, volcano: ETerrain[], adjacent: ETerrain[], imageStem: string, flag: string) => {
    const center = { x: 144 - 108, y: 144 - 72 }
    const img1: WMLImage = {
      name: imageStem + "_1",
      postfix: "",
      layer: 0,
      center: center,
      base: { x: 88 - 108, y: 107 - 72 },
      variations: [""]
    }

    const img2: WMLImage = {
      name: imageStem + "_2",
      postfix: "",
      layer: 0,
      center: center,
      base: { x: 142 - 108, y: 72 - 72 },
      variations: [""]
    }

    const img3: WMLImage = {
      name: imageStem + "_3",
      postfix: "",
      center: center,
      layer: 0,
      base: { x: 196 - 108, y: 107 - 72 },
      variations: [""]
    }

    const terrainGraphic: WMLTerrainGraphics = {
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

  const CORNER_PLFB_CONVEX = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[], imageStem: string, plfb: PLFB) => {
 
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

  const CORNER_PLFB_CONCAVE = (tgGroup: TgGroup, terrains: ETerrain[], adjacent: ETerrain[],
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

  export const WALL_TRANSITION_PLFB = (tgGroup: TgGroup, terrains: ETerrain[],
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

  export const NEW_FOREST = (tgGroup: TgGroup, terrains: ETerrain[], overlays: EOverlay[],
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
  export const NEW_VILLAGE = (tgGroup: TgGroup, terrains: ETerrain[], overlays: EOverlay[],
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

  export const OVERLAY_RESTRICTED_PLFB = (tgGroup: TgGroup, overlays: EOverlay[],
    adjacent: ETerrain[], imageStem: string, plfb: PLFB) => {
    GENERIC_RESTRICTED_PLFB(tgGroup, undefined, overlays, adjacent, undefined, imageStem, {
      layer: plfb.layer === undefined ? 0 : plfb.layer,
      flag: plfb.flag === undefined ? "overlay" : plfb.flag,
      prob: plfb.prob === undefined ? 100 : plfb.prob,
      builder: plfb.builder === undefined ? IB_IMAGE_SINGLE : plfb.builder,
    }, "");
  }

}