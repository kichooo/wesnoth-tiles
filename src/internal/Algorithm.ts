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
      set_no_flags.forEach(flag => {
        // console.log("Setting flag", flag, replaceRotation(flag, rot, rotations), hexPos.toString());
        flags.set(replaceRotation(flag, rot, rotations), true);
      });
  }

  var checkFlags = (rot: number, rotations: string[], 
    set_no_flags: string[], flags: Map<string, boolean>) => {

    var ok = true;

    // Check if all needed set_no_flags are in place      
    if (set_no_flags !== undefined)
      set_no_flags.forEach(flag => {
        // console.log("Checking for flag", flag, replaceRotation(flag, rot, rotations), hexPos.toString());
        if (flags.has(replaceRotation(flag, rot, rotations))) ok = false;
      });
    return ok;
  }

  var rotatePos = (q: number, r: number, rot: number) => {
    var result = [0, 0, 0];

    result[(6 - rot) % 3] = rot % 2 === 0 ? q : -q;
    result[(7 - rot) % 3] = rot % 2 === 0 ? r : -r;
    result[(8 - rot) % 3] = rot % 2 === 0 ? -q - r : q + r;
    return new HexPos(result[0], result[1]);
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
    // console.log("Performing macro for rotation", dp.hex.toString(), rot);
    var chance = dp.hex.getRandom(0, 101);
    if (chance > tg.probability)
      return;
    // we need to know coors of the leftmost hex.
    if (tg.tiles !== undefined) {
      for (var i = 0; i < tg.tiles.length; i++) {
        var tile = tg.tiles[i];
        var rotHex = rotatePos(tile.q, tile.r, rot);
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

      for (var i = 0; i < tg.tiles.length; i++) {
        var tile = tg.tiles[i];
        var rotHex = rotatePos(tile.q, tile.r, rot);
        var hexPosQ = dp.hex.q + rotHex.q;
        var hexPosR = dp.hex.r + rotHex.r;
        if (tile.images !== undefined) {
          for (var j = 0; j < tile.images.length; j++) {
            var img = tile.images[j];

            var translatedPostfix = img.postfix !== undefined ? replaceRotation(img.postfix, rot, tg.rotations) : "";

            var imgName = getImgName(dp.hex, img, tg, rot, translatedPostfix);
            // console.log("Name",imgName, img.name, translatedPostfix);
            if (imgName === undefined)
              return;
            var pos = {
              x: (36 * 1.5) * hexPosQ,
              y: 36 * (2 * hexPosR + hexPosQ)
            }

            var newBase = img.base !== undefined ? {
              x: pos.x + img.base.x,
              y: pos.y + img.base.y
            } : undefined;            
            // console.log("Adding", imgName, img.name);

            drawables.push(tg.builder.toDrawable(imgName, translatedPostfix, pos, img.layer, newBase));

          }

        }
      }
      if (tg.images !== undefined) {
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
      }

      for (var i = 0; i < tg.tiles.length; i++) {
        var tile = tg.tiles[i];
        var rotHex = rotatePos(tile.q, tile.r, rot);
        var rotatedHex = dp.hexMap.getHexP(dp.hex.q + rotHex.q, dp.hex.r + rotHex.r);
        setFlags(rot, tg.rotations,
          tile.set_no_flag, rotatedHex.flags);
      }
      dp.drawables.push.apply(dp.drawables, drawables);
    }
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
