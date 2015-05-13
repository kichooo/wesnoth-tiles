import Hex = WesnothTiles.Hex;
import ETerrain = WesnothTiles.ETerrain;
import EOverlay = WesnothTiles.EOverlay;

var map = new WesnothTiles.HexMap();
var renderer: WesnothTiles.Renderer;

function loadRandomMap(): void {
  for (var i = -18; i < 18; i++)
    for (var j = -18; j < 18; j++) {
      map.addHex(new Hex(i, j, Math.floor(Math.random() * 21)));
    }
  renderer.rebuild(map);
}

function loadRandomMapWithWoods(): void {
  for (var i = -18; i < 18; i++)
    for (var j = -18; j < 18; j++) {
      map.addHex(new Hex(i, j, ETerrain.GRASS_SEMI_DRY, ETerrain.VOID + 1 + Math.floor(Math.random() * 20)));
    }
  renderer.rebuild(map);
}

function loadChunksRandom(): void {
  for (var i = -17; i < 17; i++)
    for (var j = -17; j < 17; j++) {
      map.addHex(new Hex(i, j, ETerrain.GRASS_GREEN));
    }
  for (var i = 0; i < 160; i++) {
    var x = -17 + Math.floor(Math.random() * 34);
    var y = -17 + Math.floor(Math.random() * 34);

    var terrainCode = Math.floor(Math.random() * 21)
    map.addHex(new Hex(x, y, terrainCode));
    map.addHex(new Hex(x, y - 1, terrainCode));
    map.addHex(new Hex(x + 1, y - 1, terrainCode));
    map.addHex(new Hex(x + 1, y, terrainCode));
    map.addHex(new Hex(x, y + 1, terrainCode));
    map.addHex(new Hex(x - 1, y + 1, terrainCode));
    map.addHex(new Hex(x - 1, y, terrainCode));
  }
  renderer.rebuild(map);
}

function loadRing(radius, terrain): void {
  for (var i = 0; i < radius; i++) {
    map.addHex(new Hex(2 + i, -radius - 1, terrain));
    map.addHex(new Hex(2 + radius, i - radius - 1, terrain));
    map.addHex(new Hex(2 + radius - i, i - 1, terrain));
    map.addHex(new Hex(-2 - i, radius + 1, terrain));
    map.addHex(new Hex(-2 - radius, radius - i + 1, terrain));
    map.addHex(new Hex(-2 + i - radius, -i + 1, terrain));
  }

  // map.addHex(new Hex(1, -radius - 1, terrain));
  map.addHex(new Hex(1, -radius, terrain));
  map.addHex(new Hex(0, -radius, terrain));
  map.addHex(new Hex(-1, -radius + 1, terrain));
  map.addHex(new Hex(-2, -radius + 1, terrain));

  map.addHex(new Hex(-1, radius, terrain));
  map.addHex(new Hex(0, radius, terrain));
  map.addHex(new Hex(1, radius - 1, terrain));
  map.addHex(new Hex(2, radius - 1, terrain));
}

function loadDisk(): void {
  // map.addHex(new Hex(0, 0, ETerrain.ABYSS));
  loadRing(5, ETerrain.ABYSS);
  loadRing(6, ETerrain.ABYSS);

  for (var i = 0; i < 5; i++) {
    map.addHex(new Hex(-6, i + 1, ETerrain.WATER_OCEAN));
    map.addHex(new Hex(-5, i, ETerrain.WATER_OCEAN));

    map.addHex(new Hex(-4, i - 1, ETerrain.SAND_BEACH));
    // map.addHex(new Hex(2 + i, -radius - 2, ETerrain.MOUNTAIN_SNOW));
  }


  map.addHex(new Hex(5, -5, ETerrain.GRASS_DRY));
  map.addHex(new Hex(4, -5, ETerrain.GRASS_DRY, EOverlay.TRASH));
  map.addHex(new Hex(3, -5, ETerrain.GRASS_DRY, EOverlay.VILLAGE_ORC));
  map.addHex(new Hex(2, -5, ETerrain.GRASS_DRY));
  map.addHex(new Hex(4, -4, ETerrain.HILLS_DRY));

  map.addHex(new Hex(3, -4, ETerrain.SWAMP_MUD));
  map.addHex(new Hex(2, -4, ETerrain.SWAMP_MUD));
  map.addHex(new Hex(1, -4, ETerrain.SWAMP_MUD));

  map.addHex(new Hex(1, -3, ETerrain.MOUNTAIN_DRY));
  map.addHex(new Hex(2, -3, ETerrain.SWAMP_MUD));

  map.addHex(new Hex(0, -2, ETerrain.MOUNTAIN_DRY));


  map.addHex(new Hex(3, -3, ETerrain.HILLS_DRY));

  map.addHex(new Hex(6, -5, ETerrain.GRASS_DRY));
  map.addHex(new Hex(6, -4, ETerrain.FROZEN_SNOW));
  map.addHex(new Hex(6, -3, ETerrain.HILLS_SNOW, EOverlay.SNOW_FOREST));
  map.addHex(new Hex(6, -2, ETerrain.FROZEN_SNOW, EOverlay.SNOW_FOREST));
  map.addHex(new Hex(6, -1, ETerrain.FROZEN_SNOW, EOverlay.SNOW_FOREST));

  map.addHex(new Hex(4, -1, ETerrain.MOUNTAIN_SNOW));
  map.addHex(new Hex(3, -1, ETerrain.MOUNTAIN_SNOW));
  map.addHex(new Hex(4, -2, ETerrain.MOUNTAIN_SNOW));
  map.addHex(new Hex(5, -2, ETerrain.MOUNTAIN_SNOW));
  map.addHex(new Hex(2, 0, ETerrain.MOUNTAIN_SNOW));
  map.addHex(new Hex(3, 0, ETerrain.MOUNTAIN_SNOW));
  map.addHex(new Hex(5, -3, ETerrain.HILLS_SNOW));
  map.addHex(new Hex(4, -3, ETerrain.HILLS_DRY));
  map.addHex(new Hex(5, -4, ETerrain.GRASS_DRY));

  map.addHex(new Hex(5, -1, ETerrain.FROZEN_SNOW, EOverlay.SNOW_FOREST));
  map.addHex(new Hex(5, 0, ETerrain.FROZEN_SNOW));

  map.addHex(new Hex(4, 0, ETerrain.FROZEN_SNOW, EOverlay.VILLAGE_HUMAN));
  map.addHex(new Hex(4, 1, ETerrain.FROZEN_SNOW));

  map.addHex(new Hex(3, 1, ETerrain.FROZEN_ICE));
  map.addHex(new Hex(3, 2, ETerrain.FROZEN_ICE));

  map.addHex(new Hex(2, 1, ETerrain.FROZEN_ICE));
  map.addHex(new Hex(2, 2, ETerrain.FROZEN_ICE));
  map.addHex(new Hex(2, 3, ETerrain.FROZEN_ICE));

  map.addHex(new Hex(1, 2, ETerrain.FROZEN_ICE));
  map.addHex(new Hex(1, 3, ETerrain.FROZEN_ICE));

  map.addHex(new Hex(0, 3, ETerrain.WATER_OCEAN));
  map.addHex(new Hex(0, 4, ETerrain.WATER_OCEAN));

  map.addHex(new Hex(-3, 2, ETerrain.GRASS_GREEN));
  map.addHex(new Hex(-3, 3, ETerrain.GRASS_GREEN));
  map.addHex(new Hex(-3, 1, ETerrain.GRASS_SEMI_DRY));
  map.addHex(new Hex(-3, 0, ETerrain.GRASS_DRY, EOverlay.DETRITUS));
  map.addHex(new Hex(-3, -1, ETerrain.SAND_DESERT, EOverlay.OASIS));
  map.addHex(new Hex(-3, -2, ETerrain.HILLS_DESERT, EOverlay.PALM_DESERT));

  map.addHex(new Hex(-2, 2, ETerrain.GRASS_GREEN, EOverlay.WOODS_PINE));
  map.addHex(new Hex(-2, 3, ETerrain.GRASS_GREEN));
  map.addHex(new Hex(-2, 1, ETerrain.GRASS_SEMI_DRY, EOverlay.WOODS_PINE));
  map.addHex(new Hex(-2, 0, ETerrain.GRASS_DRY, EOverlay.LITER));
  map.addHex(new Hex(-2, -1, ETerrain.SAND_DESERT, EOverlay.DESERT_PLANTS));
  map.addHex(new Hex(-2, -2, ETerrain.SAND_DESERT, EOverlay.PALM_DESERT));
  map.addHex(new Hex(-2, -3, ETerrain.HILLS_DESERT, EOverlay.VILLAGE_DESERT));

  map.addHex(new Hex(-1, -3, ETerrain.HILLS_DESERT));
  map.addHex(new Hex(-1, -2, ETerrain.MOUNTAIN_DRY));

  map.addHex(new Hex(-1, 3, ETerrain.WATER_OCEAN));
  map.addHex(new Hex(-1, 1, ETerrain.GRASS_SEMI_DRY, EOverlay.WOODS_PINE));
  map.addHex(new Hex(-1, 2, ETerrain.GRASS_SEMI_DRY, EOverlay.VILLAGE_ELVEN));

  map.addHex(new Hex(0, 1, ETerrain.MOUNTAIN_BASIC));
  map.addHex(new Hex(0, 2, ETerrain.HILLS_REGULAR));

  map.addHex(new Hex(1, 1, ETerrain.FROZEN_SNOW));

  map.addHex(new Hex(2, -1, ETerrain.MOUNTAIN_BASIC));
  map.addHex(new Hex(3, -2, ETerrain.MOUNTAIN_BASIC));
  map.addHex(new Hex(1, 0, ETerrain.MOUNTAIN_BASIC));

  map.addHex(new Hex(1, -1, ETerrain.SWAMP_WATER));
  map.addHex(new Hex(2, -2, ETerrain.SWAMP_WATER, EOverlay.VILLAGE_SWAMP));
  map.addHex(new Hex(1, -2, ETerrain.SWAMP_WATER));
  map.addHex(new Hex(0, 0, ETerrain.SWAMP_WATER));


  map.addHex(new Hex(-1, 0, ETerrain.WATER_COAST_TROPICAL, EOverlay.VILLAGE_COAST));
  map.addHex(new Hex(-1, -1, ETerrain.WATER_COAST_TROPICAL));
  map.addHex(new Hex(0, -1, ETerrain.WATER_COAST_TROPICAL));

  map.addHex(new Hex(0, -3, ETerrain.MOUNTAIN_VOLCANO));
  map.addHex(new Hex(0, -4, ETerrain.SAND_DESERT));

  for (var i = 0; i < 4; i++) {
    map.addHex(new Hex(-2 - i, 4 + 1, ETerrain.WATER_OCEAN));
    map.addHex(new Hex(-1 - i, 4, ETerrain.WATER_OCEAN));
  }
  renderer.rebuild(map);
}

function loadCircle(map, terrain1, terrain2, overlay1, overlay2, x, y) {
  map.addHex(new Hex(x, y, terrain1, overlay1));
  map.addHex(new Hex(x, y - 1, terrain2, overlay2));
  map.addHex(new Hex(x + 1, y - 1, terrain2, overlay2));
  map.addHex(new Hex(x + 1, y, terrain2, overlay2));
  map.addHex(new Hex(x, y + 1, terrain2, overlay2));
  map.addHex(new Hex(x - 1, y + 1, terrain2, overlay2));
  map.addHex(new Hex(x - 1, y, terrain2, overlay2));
}

function start() {
  var timeStart = new Date();
  var canvas = <HTMLCanvasElement>document.getElementById("map-canvas");
  renderer = new WesnothTiles.Renderer(canvas);
  renderer.load().then(function() {
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



    var timeRebuildingStart = new Date();
    renderer.rebuild(map);
    console.log("Rebuilding took  ", (new Date().getTime() - timeRebuildingStart.getTime()) + "ms");
    renderer.Resize(window.innerWidth, window.innerHeight);
    var anim = () => {
      window.requestAnimationFrame(function() {
        renderer.redraw(map);
        anim();
      });
    };
    anim();
    console.log("All took: ", (new Date().getTime() - timeStart.getTime()) + "ms");
  });

}