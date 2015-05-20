import ETerrain = WesnothTiles.ETerrain;
import EOverlay = WesnothTiles.EOverlay;

var renderer: WesnothTiles.TilesMap;

function loadRandomMap(): void {
  for (var i = -18; i < 18; i++)
    for (var j = -18; j < 18; j++) {
      renderer.setTerrain(i, j, Math.floor(Math.random() * 21));
    }
  renderer.rebuild();
}

function loadRandomMapWithWoods(): void {
  for (var i = -18; i < 18; i++)
    for (var j = -18; j < 18; j++) {
      renderer.setTerrain(i, j, ETerrain.GRASS_SEMI_DRY, ETerrain.VOID + 1 + Math.floor(Math.random() * 14));
    }
  renderer.rebuild();
}

function loadChunksRandom(): void {
  for (var i = -17; i < 17; i++)
    for (var j = -17; j < 17; j++) {
      renderer.setTerrain(i, j, ETerrain.GRASS_GREEN);
    }
  for (var i = 0; i < 160; i++) {
    var x = -17 + Math.floor(Math.random() * 34);
    var y = -17 + Math.floor(Math.random() * 34);

    var terrainCode = Math.floor(Math.random() * 21)
    renderer.setTerrain(x, y, terrainCode);
    renderer.setTerrain(x, y - 1, terrainCode);
    renderer.setTerrain(x + 1, y - 1, terrainCode);
    renderer.setTerrain(x + 1, y, terrainCode);
    renderer.setTerrain(x, y + 1, terrainCode);
    renderer.setTerrain(x - 1, y + 1, terrainCode);
    renderer.setTerrain(x - 1, y, terrainCode);
  }
  renderer.rebuild();
}

function loadRing(radius, terrain): void {
  for (var i = 0; i < radius; i++) {
    renderer.setTerrain(2 + i, -radius - 1, terrain);
    renderer.setTerrain(2 + radius, i - radius - 1, terrain);
    renderer.setTerrain(2 + radius - i, i - 1, terrain);
    renderer.setTerrain(-2 - i, radius + 1, terrain);
    renderer.setTerrain(-2 - radius, radius - i + 1, terrain);
    renderer.setTerrain(-2 + i - radius, -i + 1, terrain);
  }

  // renderer.setTerrain(1, -radius - 1, terrain));
  renderer.setTerrain(1, -radius, terrain);
  renderer.setTerrain(0, -radius, terrain);
  renderer.setTerrain(-1, -radius + 1, terrain);
  renderer.setTerrain(-2, -radius + 1, terrain);

  renderer.setTerrain(-1, radius, terrain);
  renderer.setTerrain(0, radius, terrain);
  renderer.setTerrain(1, radius - 1, terrain);
  renderer.setTerrain(2, radius - 1, terrain);
}

function loadDisk(): void {
  loadRing(5, ETerrain.ABYSS);
  loadRing(6, ETerrain.ABYSS);

  for (var i = 0; i < 5; i++) {
    renderer.setTerrain(-6, i + 1, ETerrain.WATER_OCEAN);
    renderer.setTerrain(-5, i, ETerrain.WATER_OCEAN);

    renderer.setTerrain(-4, i - 1, ETerrain.SAND_BEACH);
    // renderer.setTerrain(2 + i, -radius - 2, ETerrain.MOUNTAIN_SNOW);
  }


  renderer.setTerrain(5, -5, ETerrain.GRASS_DRY);
  renderer.setTerrain(4, -5, ETerrain.GRASS_DRY, EOverlay.TRASH);
  renderer.setTerrain(3, -5, ETerrain.GRASS_DRY, EOverlay.VILLAGE_ORC);
  renderer.setTerrain(2, -5, ETerrain.GRASS_DRY);
  renderer.setTerrain(4, -4, ETerrain.HILLS_DRY);

  renderer.setTerrain(3, -4, ETerrain.SWAMP_MUD);
  renderer.setTerrain(2, -4, ETerrain.SWAMP_MUD);
  renderer.setTerrain(1, -4, ETerrain.SWAMP_MUD);

  renderer.setTerrain(1, -3, ETerrain.MOUNTAIN_DRY);
  renderer.setTerrain(2, -3, ETerrain.SWAMP_MUD);

  renderer.setTerrain(0, -2, ETerrain.MOUNTAIN_DRY);


  renderer.setTerrain(3, -3, ETerrain.HILLS_DRY);

  renderer.setTerrain(6, -5, ETerrain.GRASS_DRY);
  renderer.setTerrain(6, -4, ETerrain.FROZEN_SNOW);
  renderer.setTerrain(6, -3, ETerrain.HILLS_SNOW, EOverlay.SNOW_FOREST);
  renderer.setTerrain(6, -2, ETerrain.FROZEN_SNOW, EOverlay.SNOW_FOREST);
  renderer.setTerrain(6, -1, ETerrain.FROZEN_SNOW, EOverlay.SNOW_FOREST);

  renderer.setTerrain(4, -1, ETerrain.MOUNTAIN_SNOW);
  renderer.setTerrain(3, -1, ETerrain.MOUNTAIN_SNOW);
  renderer.setTerrain(4, -2, ETerrain.MOUNTAIN_SNOW);
  renderer.setTerrain(5, -2, ETerrain.MOUNTAIN_SNOW);
  renderer.setTerrain(2, 0, ETerrain.MOUNTAIN_SNOW);
  renderer.setTerrain(3, 0, ETerrain.MOUNTAIN_SNOW);
  renderer.setTerrain(5, -3, ETerrain.HILLS_SNOW);
  renderer.setTerrain(4, -3, ETerrain.HILLS_DRY);
  renderer.setTerrain(5, -4, ETerrain.GRASS_DRY);

  renderer.setTerrain(5, -1, ETerrain.FROZEN_SNOW, EOverlay.SNOW_FOREST);
  renderer.setTerrain(5, 0, ETerrain.FROZEN_SNOW);

  renderer.setTerrain(4, 0, ETerrain.FROZEN_SNOW, EOverlay.VILLAGE_HUMAN);
  renderer.setTerrain(4, 1, ETerrain.FROZEN_SNOW);

  renderer.setTerrain(3, 1, ETerrain.FROZEN_ICE);
  renderer.setTerrain(3, 2, ETerrain.FROZEN_ICE);

  renderer.setTerrain(2, 1, ETerrain.FROZEN_ICE);
  renderer.setTerrain(2, 2, ETerrain.FROZEN_ICE);
  renderer.setTerrain(2, 3, ETerrain.FROZEN_ICE);

  renderer.setTerrain(1, 2, ETerrain.FROZEN_ICE);
  renderer.setTerrain(1, 3, ETerrain.FROZEN_ICE);

  renderer.setTerrain(0, 3, ETerrain.WATER_OCEAN);
  renderer.setTerrain(0, 4, ETerrain.WATER_OCEAN);

  renderer.setTerrain(-3, 2, ETerrain.GRASS_GREEN);
  renderer.setTerrain(-3, 3, ETerrain.GRASS_GREEN);
  renderer.setTerrain(-3, 1, ETerrain.GRASS_SEMI_DRY);
  renderer.setTerrain(-3, 0, ETerrain.GRASS_DRY, EOverlay.DETRITUS);
  renderer.setTerrain(-3, -1, ETerrain.SAND_DESERT, EOverlay.OASIS);
  renderer.setTerrain(-3, -2, ETerrain.HILLS_DESERT, EOverlay.PALM_DESERT);

  renderer.setTerrain(-2, 2, ETerrain.GRASS_GREEN, EOverlay.WOODS_PINE);
  renderer.setTerrain(-2, 3, ETerrain.GRASS_GREEN);
  renderer.setTerrain(-2, 1, ETerrain.GRASS_SEMI_DRY, EOverlay.WOODS_PINE);
  renderer.setTerrain(-2, 0, ETerrain.GRASS_DRY, EOverlay.LITER);
  renderer.setTerrain(-2, -1, ETerrain.SAND_DESERT, EOverlay.DESERT_PLANTS);
  renderer.setTerrain(-2, -2, ETerrain.SAND_DESERT, EOverlay.PALM_DESERT);
  renderer.setTerrain(-2, -3, ETerrain.HILLS_DESERT, EOverlay.VILLAGE_DESERT);

  renderer.setTerrain(-1, -3, ETerrain.HILLS_DESERT);
  renderer.setTerrain(-1, -2, ETerrain.MOUNTAIN_DRY);

  renderer.setTerrain(-1, 3, ETerrain.WATER_OCEAN);
  renderer.setTerrain(-1, 1, ETerrain.GRASS_SEMI_DRY, EOverlay.WOODS_PINE);
  renderer.setTerrain(-1, 2, ETerrain.GRASS_SEMI_DRY, EOverlay.VILLAGE_ELVEN);

  renderer.setTerrain(0, 1, ETerrain.MOUNTAIN_BASIC);
  renderer.setTerrain(0, 2, ETerrain.HILLS_REGULAR);

  renderer.setTerrain(1, 1, ETerrain.FROZEN_SNOW);

  renderer.setTerrain(2, -1, ETerrain.MOUNTAIN_BASIC);
  renderer.setTerrain(3, -2, ETerrain.MOUNTAIN_BASIC);
  renderer.setTerrain(1, 0, ETerrain.MOUNTAIN_BASIC);

  renderer.setTerrain(1, -1, ETerrain.SWAMP_WATER);
  renderer.setTerrain(2, -2, ETerrain.SWAMP_WATER, EOverlay.VILLAGE_SWAMP);
  renderer.setTerrain(1, -2, ETerrain.SWAMP_WATER);
  renderer.setTerrain(0, 0, ETerrain.SWAMP_WATER);


  renderer.setTerrain(-1, 0, ETerrain.WATER_COAST_TROPICAL, EOverlay.VILLAGE_COAST);
  renderer.setTerrain(-1, -1, ETerrain.WATER_COAST_TROPICAL);
  renderer.setTerrain(0, -1, ETerrain.WATER_COAST_TROPICAL);

  renderer.setTerrain(0, -3, ETerrain.MOUNTAIN_VOLCANO);
  renderer.setTerrain(0, -4, ETerrain.SAND_DESERT);

  for (var i = 0; i < 4; i++) {
    renderer.setTerrain(-2 - i, 4 + 1, ETerrain.WATER_OCEAN);
    renderer.setTerrain(-1 - i, 4, ETerrain.WATER_OCEAN);
  }
  renderer.rebuild();
}

function loadCircle(map, terrain1, terrain2, overlay1, overlay2, x, y) {
  renderer.setTerrain(x, y, terrain1, overlay1);
  renderer.setTerrain(x, y - 1, terrain2, overlay2);
  renderer.setTerrain(x + 1, y - 1, terrain2, overlay2);
  renderer.setTerrain(x + 1, y, terrain2, overlay2);
  renderer.setTerrain(x, y + 1, terrain2, overlay2);
  renderer.setTerrain(x - 1, y + 1, terrain2, overlay2);
  renderer.setTerrain(x - 1, y, terrain2, overlay2);
}

function start() {
  var timeStart = new Date();
  var canvas = <HTMLCanvasElement>document.getElementById("map-canvas");
  renderer = new WesnothTiles.TilesMap(canvas);
  renderer.load().then(() => {
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
    renderer.rebuild();
    console.log("Rebuilding took  ", (new Date().getTime() - timeRebuildingStart.getTime()) + "ms");
    renderer.Resize(window.innerWidth, window.innerHeight);
    var anim = () => {
      window.requestAnimationFrame(() => {
        renderer.redraw();
        anim();
      });
    };
    anim();
    console.log("All took: ", (new Date().getTime() - timeStart.getTime()) + "ms");
  });

}