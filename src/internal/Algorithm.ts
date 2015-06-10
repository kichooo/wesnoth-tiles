// Drawing algoritm. Pretty complicated, although much simplified compared to Wesnoth (which is much more powerful).

module WesnothTiles.Internal {
  'use strict';

  interface IDrawParams {
    hex: Hex;
    hexMap: HexMap;
    drawables: IDrawable[];
  }

  var setFlags = (rot: number, rotations: string[],
    set_no_flags: string[], flags: Map<string, boolean>) => {
    if (set_no_flags !== undefined)
      for (var i = 0; i < set_no_flags.length; i++)
        flags.set(replaceRotation(set_no_flags[i], rot, rotations), true);
  }

  var checkFlags = (rot: number, rotations: string[],
    set_no_flags: string[], flags: Map<string, boolean>) => {

    if (set_no_flags !== undefined)
      for (var i = 0; i < set_no_flags.length; i++)
        if (flags.has(replaceRotation(set_no_flags[i], rot, rotations))) return false;
    return true;
  }

  var getRotatedPos = (pos: IHexPos, rot: number): IHexPos => {
    if (rot === 0)
      return pos;
    return rotationsMap.get(rot).get(pos.q).get(pos.r);
  }

  // var rotatePos = (q: number, r: number, rot: number) => {
  //   // Only WmlTiles with rotation 0 can have q or r higher than 1 (or lower than -1),
  //   // This is why our rotationsMap supports only these values.
  //   if (rot === 0)
  //     return new HexPos(q, r);
  //   var v = rotationsMap.get(rot).get(q).get(r);
  //   var result = [0, 0, 0];
  //   result[(6 - rot) % 3] = rot % 2 === 0 ? q : -q;
  //   result[(7 - rot) % 3] = rot % 2 === 0 ? r : -r;
  //   result[(8 - rot) % 3] = rot % 2 === 0 ? -q - r : q + r;
  //   return v;
  // }

  var rotationsMap = new Map<number, Map<number, Map<number, HexPos>>>();

  export var prepareRotations = () => {
    for (var rot = 0; rot < 6; rot++) {
      var rotMap = new Map<number, Map<number, HexPos>>();
      rotationsMap.set(rot, rotMap);
      for (var q = -1; q <= 1; q++) {
        var iMap = new Map<number, HexPos>();
        rotMap.set(q, iMap);
        for (var r = -1; r <= 1; r++) {
          var result = [0, 0, 0];
          result[(6 - rot) % 3] = rot % 2 === 0 ? q : -q;
          result[(7 - rot) % 3] = rot % 2 === 0 ? r : -r;
          result[(8 - rot) % 3] = rot % 2 === 0 ? -q - r : q + r;
          iMap.set(r, new HexPos(result[0], result[1]));
        }
      }
    }
  }

  var replaceRotation = (input: string, rot: number, rotations: string[]) => {
    if (rotations === undefined)
      return input;
    return rotations === undefined ? input : input.replace("@R0", rotations[rot])
      .replace("@R1", rotations[(rot + 1) % 6])
      .replace("@R2", rotations[(rot + 2) % 6])
      .replace("@R3", rotations[(rot + 3) % 6])
      .replace("@R4", rotations[(rot + 4) % 6])
      .replace("@R5", rotations[(rot + 5) % 6])
  }


  var getImgName = (hex: Hex, img: WMLImage, tg: WMLTerrainGraphics, rot: number, translatedPostfix: string) => {

    var imgName: string;
    var num = img.variations.length;
    for (; ;) {
      num = hex.getRandom(0, num);
      var translatedName = tg.builder.toString(img.name, translatedPostfix);
      translatedName = translatedName.replace("@V", img.variations[num]);
      if (definitions.has(translatedName)) {
        imgName = img.name.replace("@V", img.variations[num]);
        break;
      }
      if (num === 0) {
        return undefined;
      }
    }
    return imgName;

  }

  var performRotatedTerrainGraphics = (tg: WMLTerrainGraphics, dp: IDrawParams, rot: number = 0) => {
    if (tg.probability !== 100 && dp.hex.getRandom(0, 101) > tg.probability)
      return;
    // we need to know coors of the leftmost hex.
    for (var i = 0; i < tg.tiles.length; i++) {
      var tile = tg.tiles[i];
      var rotHex = getRotatedPos(tile, rot);
      var hexPosQ = dp.hex.q + rotHex.q;
      var hexPosR = dp.hex.r + rotHex.r;
      var hex = dp.hexMap.getHexP(hexPosQ, hexPosR);

      if (hex === undefined)
        return;

      if (tile.type !== undefined && !tile.type.has(hex.terrain)) {
        return;
      }

      if (tile.overlay !== undefined && !tile.overlay.has(hex.overlay)) {
        return;
      }

      if (tile.fog !== undefined && tile.fog !== hex.fog) {
        return;
      }

      if (!checkFlags(rot, tg.rotations,
        tile.set_no_flag, hex.flags))
        return;
    }

    var drawables: IDrawable[] = [];

    for (var j = 0; j < tg.images.length; j++) {
      var img = tg.images[j];

      var translatedPostfix = img.postfix !== undefined ? replaceRotation(img.postfix, rot, tg.rotations) : "";

      var imgName = getImgName(dp.hex, img, tg, rot, translatedPostfix);
      // console.log("Name",imgName, img.name, translatedPostfix);
      if (imgName === undefined)
        return;
      var drawPos = {
        x: (36 * 1.5) * dp.hex.q - 36 + img.center.x,
        y: 36 * (2 * dp.hex.r + dp.hex.q) - 36 + img.center.y
      }

      var newBase = img.base !== undefined ? {
        x: drawPos.x,
        y: drawPos.y
      } : undefined;

      drawables.push(tg.builder.toDrawable(imgName, translatedPostfix, drawPos, img.layer, newBase));

    }

    for (var i = 0; i < tg.tiles.length; i++) {
      var tile = tg.tiles[i];

      var rotHex = getRotatedPos(tile, rot);

      var rotatedHex = dp.hexMap.getHexP(
        dp.hex.q + rotHex.q,
        dp.hex.r + rotHex.r);

      setFlags(rot, tg.rotations,
        tile.set_no_flag, rotatedHex.flags);
    }
    dp.drawables.push.apply(dp.drawables, drawables);
  }

  var performTerrainGraphics = (tg: WMLTerrainGraphics, dp: IDrawParams) => {
    if (tg.rotations !== undefined) {
      for (var i = 0; i < tg.rotations.length; i++) {
        performRotatedTerrainGraphics(tg, dp, i);
      }
    } else
      performRotatedTerrainGraphics(tg, dp);
  }

  export var rebuild = (hexMap: HexMap) => {
    prepareRotations();
    // clear old flags.

    hexMap.iterate(h => {
      h.flags.clear();
    })

    var drawables: IDrawable[] = [];

    var dp: IDrawParams = {
      hex: null,
      hexMap: hexMap,
      drawables: drawables
    }

    hexMap.tgGroup.tgs.forEach(tg => {
      tg.hexes.forEach(hex => {
        dp.hex = hex;
        performTerrainGraphics(tg, dp);
      });
    });

    var sum = 0;
    var sumTransition = 0;
    var count = 0;
    var winner: WMLTerrainGraphics;
    var winnerScore = 0;
    var transitionCount = 0;
    hexMap.tgGroup.tgs.forEach(tg => {
      sum += tg.hexes.size;
      count++;
      if (tg.hexes.size > winnerScore) {
        winner = tg;
        winnerScore = tg.hexes.size;
      }
      if (tg.transition !== undefined) {

        transitionCount++;
        sumTransition += tg.hexes.size;
      }
    });

    console.log("Winner!", winner, winnerScore);

    if (count > 0) {
      console.log("Tgs stats: transition/total: "
        + transitionCount + "/" + count
        + ", percentage of hexes per tg: " + 100 * sum / count / hexMap.hexes.size
        + ", tgs per hex: ", sum / hexMap.hexes.size + "/" + sumTransition / hexMap.hexes.size);
    }

    return drawables;
  }

} 
