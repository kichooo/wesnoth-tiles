// Drawing algoritm. Pretty complicated, although much simplified compared to Wesnoth (which is much more powerful).

/// <reference path="Macros.ts"/>

module WesnothTiles {
  'use strict';

  interface IDrawParams {
    hex: Hex;
    hexMap: HexMap;
    flags: Flags;
    drawables: IDrawable[];
  }

  interface Flags extends Map<string, Map<string, boolean>> { };

  var setFlags = (rot: number, rotations: string[], hexPos: HexPos,
    set_no_flags: string[], set_no_flags_tg: string[], flags: Flags) => {

    var hexFlags = flags.get(hexPos.toString());

    if (set_no_flags !== undefined)
      set_no_flags.forEach(flag => {
        // console.log("Setting flag", flag, replaceRotation(flag, rot, rotations), hexPos.toString());
        hexFlags.set(replaceRotation(flag, rot, rotations), true);
      });
    if (set_no_flags_tg !== undefined)
      set_no_flags_tg.forEach(flag => {
        hexFlags.set(replaceRotation(flag, rot, rotations), true);
      });
  }

  var checkFlags = (rot: number, rotations: string[], hexPos: HexPos,
    set_no_flags: string[], set_no_flags_tg: string[],
    flags: Flags) => {

    var hexFlags = flags.get(hexPos.toString());

    var ok = true;

    // Check if all needed set_no_flags are in place      
    if (set_no_flags !== undefined)
      set_no_flags.forEach(flag => {
        // console.log("Checking for flag", flag, replaceRotation(flag, rot, rotations), hexPos.toString());
        if (hexFlags.has(replaceRotation(flag, rot, rotations))) ok = false;
      });
    if (set_no_flags_tg !== undefined)
      set_no_flags_tg.forEach(flag => {
        if (hexFlags.has(replaceRotation(flag, rot, rotations))) ok = false;
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


  var getImgName = (img: WMLImage, tg: WMLTerrainGraphics, rot: number, translatedPostfix: string) => {

    var imgName: string;
    var num = img.variations.length;
    for (; ;) {
      num = Math.floor(Math.random() * num);
      var translatedName = tg.builder.toString(img.name, translatedPostfix);
      translatedName = translatedName.replace("@V", img.variations[num]);
      if (Resources.definitions.has(translatedName)) {
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
    var chance = Math.floor(Math.random() * 101);
    if (chance > tg.probability)
      return;
    // we need to know coors of the leftmost hex.
    if (tg.tiles !== undefined) {
      for (var i = 0; i < tg.tiles.length; i++) {
        var tile = tg.tiles[i];
        var rotHex = rotatePos(tile.q, tile.r, rot);
        var hexPos = new HexPos(dp.hex.q + rotHex.q, dp.hex.r + rotHex.r);
        var hex = dp.hexMap.getHex(hexPos);

        if (hex === undefined)
          return;

        if (!dp.flags.has(hexPos.toString()))
          dp.flags.set(hexPos.toString(), new Map<string, boolean>());

        if (tile.type !== undefined && !tile.type.has(hex.terrain)) {
          return;
        }

        if (tile.overlay !== undefined && !tile.overlay.has(hex.overlay)) {
          return;
        }

        if (!checkFlags(rot, tg.rotations, hexPos,
          tile.set_no_flag, tg.set_no_flag, dp.flags))
          return;
      }

      var drawables: IDrawable[] = [];

      for (var i = 0; i < tg.tiles.length; i++) {
        var tile = tg.tiles[i];
        var rotHex = rotatePos(tile.q, tile.r, rot);
        var hexPos = new HexPos(dp.hex.q + rotHex.q, dp.hex.r + rotHex.r);
        if (tile.images !== undefined) {
          for (var j = 0; j < tile.images.length; j++) {
            var img = tile.images[j];

            var translatedPostfix = img.postfix !== undefined ? replaceRotation(img.postfix, rot, tg.rotations) : "";

            var imgName = getImgName(img, tg, rot, translatedPostfix);
            // console.log("Name",imgName, img.name, translatedPostfix);
            if (imgName === undefined)
              return;
            var pos = {
              x: (36 * 1.5) * hexPos.q,
              y: 36 * (2 * hexPos.r + hexPos.q)
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

          var imgName = getImgName(img, tg, rot, translatedPostfix);
          // console.log("Name",imgName, img.name, translatedPostfix);
          if (imgName === undefined)
            return;
          var hexQ = dp.hex.q;
          var hexR = dp.hex.r;
          var drawPos = {
            x: (36 * 1.5) * hexQ - 36 + img.center.x,
            y: 36 * (2 * hexR + hexQ) - 36 + img.center.y
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
        var hexPos = new HexPos(dp.hex.q + rotHex.q, dp.hex.r + rotHex.r);
        setFlags(rot, tg.rotations, hexPos,
          tile.set_no_flag, tg.set_no_flag, dp.flags);
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



    var flags = new Map<string, Map<string, boolean>>();


    var drawables: IDrawable[] = [];

    var dp: IDrawParams = {
      hex: null,
      hexMap: hexMap,
      flags: flags,
      drawables: drawables
    }

    // console.log("Macros count: ", terrainGraphics.length + " macros.");

    hexMap.tgGroup.tgs.forEach(tg => {
      tg.hexes.forEach(hex => {
        dp.hex = hex;
        performTerrainGraphics(tg, dp);
      });
    });

    var sum = 0;
    var count = 0;
    hexMap.tgGroup.tgs.forEach(tg => {
      sum += tg.hexes.size;
      count++;
    });

    if (count > 0) {
      console.log("Tgs stats: count: " + count + ", percentage of hexes per tg: " + 100 * sum / count / hexMap.hexes.size);
    }

    return drawables;
  }

} 
