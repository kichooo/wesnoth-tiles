/// <reference path="wesnoth-tiles.d.ts"/>

import ETerrain = WesnothTiles.ETerrain;
import EOverlay = WesnothTiles.EOverlay;

var tilesMap: WesnothTiles.TilesMap;
var redraw = true;

function createTestMap(): Promise<void> {
  return tilesMap.clear().then(() => {
    var mapBuilder = tilesMap.getBuilder("test", true);
    var rng = new Rng(1337);

    for (var i = -18; i < 18; i++)
      for (var j = -18; j < 18; j++) {
        var terrain = rng.nextRange(0, ETerrain.VOID + 1);
        var overlay = EOverlay.NONE;

        if (terrain === ETerrain.GRASS_LEAF_LITTER)
          overlay = rng.nextRange(EOverlay.WOODS_PINE, EOverlay.MUSHROOMS);
        if ((terrain === ETerrain.GRASS_GREEN
          || terrain === ETerrain.GRASS_DRY
          || terrain === ETerrain.SAND_DESERT
          || terrain === ETerrain.GRASS_SEMI_DRY
          || terrain === ETerrain.FROZEN_SNOW)
          && rng.nextRange(0, 3) === 0)
          overlay = rng.nextRange(EOverlay.MUSHROOMS, EOverlay.NONE + 1);
        mapBuilder = mapBuilder.setTile(i, j, terrain, overlay);
      }
    return mapBuilder.promise();  
  });

  // return tilesMap.clear().then(() => tilesMap.setLoadingMode()).then(() => {
  //   var rng = new Rng(1337);
  //   var tiles: WesnothTiles.ITileChange[] = [];
  //   for (var i = -18; i < 18; i++)
  //     for (var j = -18; j < 18; j++) {
  //       var terrain = rng.nextRange(0, ETerrain.VOID + 1);
  //       var overlay = EOverlay.NONE;

  //       if (terrain === ETerrain.GRASS_LEAF_LITTER)
  //         overlay = rng.nextRange(EOverlay.WOODS_PINE, EOverlay.MUSHROOMS);
  //       if ((terrain === ETerrain.GRASS_GREEN
  //         || terrain === ETerrain.GRASS_DRY
  //         || terrain === ETerrain.SAND_DESERT
  //         || terrain === ETerrain.GRASS_SEMI_DRY
  //         || terrain === ETerrain.FROZEN_SNOW)
  //         && rng.nextRange(0, 3) === 0)
  //         overlay = rng.nextRange(EOverlay.MUSHROOMS, EOverlay.NONE + 1);
  //       tiles.push({
  //         q: i,
  //         r: j,
  //         terrain: terrain,
  //         overlay: overlay
  //       });
  //     }
  //   return tilesMap.setTiles(tiles);
  // });
}

function loadTestMap(): void {
  document.getElementById("checksumBlock").style.display = 'none';
  var start = new Date();
  createTestMap().then(() => tilesMap.rebuild("test")).then(() => {
      document.getElementById("checksum").textContent = "";
      tilesMap.getCheckSum("test")
        .then(checksum => document.getElementById("checksum").textContent = checksum);
      document.getElementById("expected").textContent = "expected: 1386360853";
      document.getElementById("duration").textContent = (new Date().getTime() - start.getTime()).toString();

      document.getElementById("checksumBlock").style.display = 'block';
    });
}

function loadSingleCircle(): void {
  document.getElementById("checksumBlock").style.display = 'none';
  var start = new Date();
  tilesMap.clear("test").then(() => {
    var builder = tilesMap.getBuilder("test", true);
    builder = loadCircle(builder, ETerrain.GRASS_DRY, ETerrain.WATER_OCEAN, EOverlay.NONE, EOverlay.NONE, 0, 0);
    return builder.promise();
  }).then(() => tilesMap.rebuild("test")).then(() => {
    document.getElementById("checksum").textContent = "";
    tilesMap.getCheckSum("test")
      .then(checksum => document.getElementById("checksum").textContent = checksum);
    document.getElementById("expected").textContent = "expected: none";
    document.getElementById("duration").textContent = (new Date().getTime() - start.getTime()).toString();
    document.getElementById("checksumBlock").style.display = 'block';  
  });
  
}

function benchmark(): void {
  document.getElementById("checksumBlock").style.display = 'none';
  redraw = false;
  var timer = new Date();
  createTestMap().then(() => {
    var promise: Promise<void> = tilesMap.rebuild("test");
    for (var i = 0; i < 39; i++) {
      promise = promise.then(() => { return tilesMap.rebuild("test"); });
    }    
    return promise;  
  }).then(() => {
    var duration = (new Date().getTime() - timer.getTime()) / 40;
    document.getElementById("checksum").textContent = "";
    tilesMap.getCheckSum("test")
      .then(checksum => document.getElementById("checksum").textContent = checksum);
    document.getElementById("expected").textContent = "expected: 3643646740";
    document.getElementById("duration").textContent = duration.toString();

    document.getElementById("checksumBlock").style.display = 'block';

    redraw = true;
  });
}

function loadRandomMap(): void {
  document.getElementById("checksumBlock").style.display = 'none'
  var start = new Date();
  tilesMap.clear("test").then(() => {
    var builder = tilesMap.getBuilder("test", true);
    for (var i = -18; i < 18; i++)
      for (var j = -18; j < 18; j++) {
        builder = builder.setTile(i, j, Math.floor(Math.random() * 22));
      }
    return builder.promise();
  })
    .then(() => tilesMap.rebuild("test")).then(() => {
    document.getElementById("checksum").textContent = "";
    tilesMap.getCheckSum("test")
     .then(checksum => document.getElementById("checksum").textContent = checksum);
    document.getElementById("expected").textContent = "expected: none";
    document.getElementById("duration").textContent = (new Date().getTime() - start.getTime()).toString();

    document.getElementById("checksumBlock").style.display = 'block';
  });
}

function loadRandomMapWithWoods(): void {
  document.getElementById("checksumBlock").style.display = 'none';
  var start = new Date();
  tilesMap.clear("test").then(() => {
    var builder = tilesMap.getBuilder("default", true);
    for (var i = -18; i < 18; i++)
      for (var j = -18; j < 18; j++) {
        builder = builder.setTile(i, j, ETerrain.GRASS_SEMI_DRY, ETerrain.VOID + 1 + Math.floor(Math.random() * 14));
      }          
    return builder.promise();
  }).then(() => tilesMap.rebuild()).then(() => {
    document.getElementById("checksum").textContent = "none";
    document.getElementById("expected").textContent = "expected: none";
    document.getElementById("duration").textContent = (new Date().getTime() - start.getTime()).toString();
    document.getElementById("checksumBlock").style.display = 'block';
  });
}

// function loadChunksRandom(): void {
//   document.getElementById("checksumBlock").style.display = 'none'
//   redraw = false;
//   tilesMap.clear().then(() => {
//     var builder = tilesMap.loadingMode();
//     for (var i = -17; i < 17; i++)
//       for (var j = -17; j < 17; j++) {
//         builder = builder.setTile(i, j, ETerrain.GRASS_GREEN);
//       }
//     for (var i = 0; i < 160; i++) {
//       var x = -17 + Math.floor(Math.random() * 34);
//       var y = -17 + Math.floor(Math.random() * 34);

//       var terrainCode = Math.floor(Math.random() * 21)
//       builder = builder.setTile(x, y, terrainCode)
//         .setTile(x, y - 1, terrainCode)
//         .setTile(x + 1, y - 1, terrainCode)
//         .setTile(x + 1, y, terrainCode)
//         .setTile(x, y + 1, terrainCode)
//         .setTile(x - 1, y + 1, terrainCode)
//         .setTile(x - 1, y, terrainCode)
//     }
//   });
//   tilesMap.rebuild(). then(() => {
//     redraw = true;
//   });
// }

function loadRing(mapBuilder: WesnothTiles.MapBuilder, radius, terrain): WesnothTiles.MapBuilder {
  for (var i = 0; i < radius; i++) {
    mapBuilder = mapBuilder.setTile(2 + i, -radius - 1, terrain)
      .setTile(2 + radius, i - radius - 1, terrain)
      .setTile(2 + radius - i, i - 1, terrain)
      .setTile(-2 - i, radius + 1, terrain)
      .setTile(-2 - radius, radius - i + 1, terrain)
      .setTile(-2 + i - radius, -i + 1, terrain);
  }

  // tilesMap.setTerrain(1, -radius - 1, terrain));
  return mapBuilder.setTile(1, -radius, terrain)
    .setTile(0, -radius, terrain)
    .setTile(-1, -radius + 1, terrain)
    .setTile(-2, -radius + 1, terrain)
    .setTile(-1, radius, terrain)
    .setTile(0, radius, terrain)
    .setTile(1, radius - 1, terrain)
    .setTile(2, radius - 1, terrain);
}

function loadDisk(): void {
  document.getElementById("checksumBlock").style.display = 'none';
  var start = new Date();
  tilesMap.clear("test").then(() => {
    var mapBuilder = tilesMap.getBuilder("test", true);
    mapBuilder = loadRing(mapBuilder, 5, ETerrain.ABYSS);
    mapBuilder = loadRing(mapBuilder, 6, ETerrain.ABYSS);
    mapBuilder = loadRing(mapBuilder, 7, ETerrain.VOID);

    for (var i = 0; i < 5; i++) {
      mapBuilder = mapBuilder.setTile(-6, i + 1, ETerrain.WATER_OCEAN)
        .setTile(-5, i, ETerrain.WATER_OCEAN)
        .setTile(-4, i - 1, ETerrain.SAND_BEACH);
    }


    mapBuilder = mapBuilder.setTile(5, -5, ETerrain.GRASS_DRY)
      .setTile(4, -5, ETerrain.GRASS_DRY, EOverlay.TRASH)
      .setTile(3, -5, ETerrain.GRASS_DRY, EOverlay.VILLAGE_ORC)
      .setTile(2, -5, ETerrain.GRASS_DRY)
      .setTile(4, -4, ETerrain.HILLS_DRY)

      .setTile(3, -4, ETerrain.SWAMP_MUD)
      .setTile(2, -4, ETerrain.SWAMP_MUD)
      .setTile(1, -4, ETerrain.SWAMP_MUD)

      .setTile(1, -3, ETerrain.MOUNTAIN_DRY)
      .setTile(2, -3, ETerrain.SWAMP_MUD)

      .setTile(0, -2, ETerrain.MOUNTAIN_DRY)


      .setTile(3, -3, ETerrain.HILLS_DRY)

      .setTile(6, -5, ETerrain.GRASS_DRY)
      .setTile(6, -4, ETerrain.FROZEN_SNOW)
      .setTile(6, -3, ETerrain.HILLS_SNOW, EOverlay.SNOW_FOREST)
      .setTile(6, -2, ETerrain.FROZEN_SNOW, EOverlay.SNOW_FOREST)
      .setTile(6, -1, ETerrain.FROZEN_SNOW, EOverlay.SNOW_FOREST)

      .setTile(4, -1, ETerrain.MOUNTAIN_SNOW)
      .setTile(3, -1, ETerrain.MOUNTAIN_SNOW)
      .setTile(4, -2, ETerrain.MOUNTAIN_SNOW)
      .setTile(5, -2, ETerrain.MOUNTAIN_SNOW)
      .setTile(2, 0, ETerrain.MOUNTAIN_SNOW)
      .setTile(3, 0, ETerrain.MOUNTAIN_SNOW)
      .setTile(5, -3, ETerrain.HILLS_SNOW)
      .setTile(4, -3, ETerrain.HILLS_DRY)
      .setTile(5, -4, ETerrain.GRASS_DRY)

      .setTile(5, -1, ETerrain.FROZEN_SNOW, EOverlay.SNOW_FOREST)
      .setTile(5, 0, ETerrain.FROZEN_SNOW)

      .setTile(4, 0, ETerrain.FROZEN_SNOW, EOverlay.VILLAGE_HUMAN)
      .setTile(4, 1, ETerrain.FROZEN_SNOW)

      .setTile(3, 1, ETerrain.FROZEN_ICE)
      .setTile(3, 2, ETerrain.FROZEN_ICE)

      .setTile(2, 1, ETerrain.FROZEN_ICE)
      .setTile(2, 2, ETerrain.FROZEN_ICE)
      .setTile(2, 3, ETerrain.FROZEN_ICE)

      .setTile(1, 2, ETerrain.FROZEN_ICE)
      .setTile(1, 3, ETerrain.FROZEN_ICE)

      .setTile(0, 3, ETerrain.WATER_OCEAN)
      .setTile(0, 4, ETerrain.WATER_OCEAN)

      .setTile(-3, 2, ETerrain.GRASS_GREEN)
      .setTile(-3, 3, ETerrain.GRASS_GREEN)
      .setTile(-3, 1, ETerrain.GRASS_SEMI_DRY)
      .setTile(-3, 0, ETerrain.GRASS_DRY, EOverlay.DETRITUS)
      .setTile(-3, -1, ETerrain.SAND_DESERT, EOverlay.OASIS)
      .setTile(-3, -2, ETerrain.HILLS_DESERT, EOverlay.PALM_DESERT)

      .setTile(-2, 2, ETerrain.GRASS_GREEN, EOverlay.WOODS_PINE)
      .setTile(-2, 3, ETerrain.GRASS_GREEN)
      .setTile(-2, 1, ETerrain.GRASS_SEMI_DRY, EOverlay.WOODS_PINE)
      .setTile(-2, 0, ETerrain.GRASS_DRY, EOverlay.LITER)
      .setTile(-2, -1, ETerrain.SAND_DESERT, EOverlay.DESERT_PLANTS)
      .setTile(-2, -2, ETerrain.SAND_DESERT, EOverlay.PALM_DESERT)
      .setTile(-2, -3, ETerrain.HILLS_DESERT, EOverlay.VILLAGE_DESERT)

      .setTile(-1, -3, ETerrain.HILLS_DESERT)
      .setTile(-1, -2, ETerrain.MOUNTAIN_DRY)

      .setTile(-1, 3, ETerrain.WATER_OCEAN)
      .setTile(-1, 1, ETerrain.GRASS_SEMI_DRY, EOverlay.WOODS_PINE)
      .setTile(-1, 2, ETerrain.GRASS_SEMI_DRY, EOverlay.VILLAGE_ELVEN)

      .setTile(0, 1, ETerrain.MOUNTAIN_BASIC)
      .setTile(0, 2, ETerrain.HILLS_REGULAR)

      .setTile(1, 1, ETerrain.FROZEN_SNOW)

      .setTile(2, -1, ETerrain.MOUNTAIN_BASIC)
      .setTile(3, -2, ETerrain.MOUNTAIN_BASIC)
      .setTile(1, 0, ETerrain.MOUNTAIN_BASIC)

      .setTile(1, -1, ETerrain.SWAMP_WATER)
      .setTile(2, -2, ETerrain.SWAMP_WATER, EOverlay.VILLAGE_SWAMP)
      .setTile(1, -2, ETerrain.SWAMP_WATER)
      .setTile(0, 0, ETerrain.SWAMP_WATER)


      .setTile(-1, 0, ETerrain.WATER_COAST_TROPICAL, EOverlay.VILLAGE_COAST)
      .setTile(-1, -1, ETerrain.WATER_COAST_TROPICAL)
      .setTile(0, -1, ETerrain.WATER_COAST_TROPICAL)

      .setTile(0, -3, ETerrain.MOUNTAIN_VOLCANO)
      .setTile(0, -4, ETerrain.SAND_DESERT);

    for (var i = 0; i < 4; i++) {
      mapBuilder = mapBuilder.setTile(-2 - i, 4 + 1, ETerrain.WATER_OCEAN)
        .setTile(-1 - i, 4, ETerrain.WATER_OCEAN);
    }
    return mapBuilder.promise();
  }).then(() => tilesMap.rebuild("test")).then(() => {
      document.getElementById("checksum").textContent = "";
      tilesMap.getCheckSum("test")
        .then(checksum => document.getElementById("checksum").textContent = checksum);
      document.getElementById("expected").textContent = "expected: 18469171";
      document.getElementById("duration").textContent = (new Date().getTime() - start.getTime()).toString();
      document.getElementById("checksumBlock").style.display = 'block';
    });  ;
  
  
}

function loadCircle(builder: WesnothTiles.MapBuilder, terrain1, terrain2, overlay1, overlay2, x, y): WesnothTiles.MapBuilder {
  return builder.setTile(x, y, terrain1, overlay1)
    .setTile(x, y - 1, terrain2, overlay2)
    .setTile(x + 1, y - 1, terrain2, overlay2)
    .setTile(x + 1, y, terrain2, overlay2)
    .setTile(x, y + 1, terrain2, overlay2)
    .setTile(x - 1, y + 1, terrain2, overlay2)
    .setTile(x - 1, y, terrain2, overlay2);
}

function start() {
  var timeStart = new Date();
  var leftCanvas = <HTMLCanvasElement>document.getElementById("map-canvas-left");
  var rightCanvas = <HTMLCanvasElement>document.getElementById("map-canvas-right");
  var leftCtx = leftCanvas.getContext('2d');
  var rightCtx = rightCanvas.getContext('2d');
  tilesMap = new WesnothTiles.TilesMap();
  tilesMap.load().then(() => {
    // loadChunksRandom(map);
    // loadRandomMapWithWoods(map);
    // loadRandomMap(map);
    // loadCircle(map, ETerrain.ABYSS, ETerrain.GRASS_GREEN, -2, 0);
    // loadCircle(map, ETerrain.GRASS_GREEN, ETerrain.GRASS_GREEN,
    //   EOverlay.VILLAGE_DESERT, EOverlay.NONE, 2, -2);
    // loadCircle(map, ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL,
    //   EOverlay.NONE, EOverlay.NONE, 3, 0);
    // loadCircle(map, ETerrain.GRASS_GREEN, ETerrain.ABYSS, 2, -2);
    loadDisk();
    // loadSingleCircle();

    leftCanvas.width = leftCanvas.parentElement.clientWidth/2;
    leftCanvas.height = leftCanvas.parentElement.clientHeight;

    rightCanvas.width = rightCanvas.parentElement.clientWidth/2;
    rightCanvas.height = rightCanvas.parentElement.clientHeight;
    var anim = () => {
      window.requestAnimationFrame(() => {
        if (redraw) {
          leftCtx.clearRect(0, 0, leftCanvas.width, leftCanvas.height);
          tilesMap.redraw("test", leftCtx, Math.floor(leftCanvas.width / 2), Math.floor(leftCanvas.height / 2));
        }
        anim();
      });
    };
    anim();
  });

}


class Rng {
  // LCG using GCC's constants
  private m = 0x80000000; // 2**31;
  private a = 1103515245;
  private c = 12345;

  private state: number;

  constructor(private seed: number) {
    this.state = seed;
  }

  nextInt() {
    this.state = (this.a * this.state + this.c) % this.m;
    return this.state;
  }

  nextFloat() {
    // returns in range [0,1]
    return this.nextInt() / (this.m - 1);
  }

  nextRange(start: number, end: number) {
    // returns in range [start, end): including start, excluding end
    // can't modulu nextInt because of weak randomness in lower bits
    var rangeSize = end - start;
    var randomUnder1 = this.nextInt() / this.m;
    return start + Math.floor(randomUnder1 * rangeSize);
  }
}