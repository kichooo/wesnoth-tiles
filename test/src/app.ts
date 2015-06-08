import ETerrain = WesnothTiles.ETerrain;
import EOverlay = WesnothTiles.EOverlay;

var tilesMap: WesnothTiles.TilesMap;

function loadTestMap(): void {
  document.getElementById("checksumBlock").style.display = 'none';
  var timeRebuildingStart = new Date();
  tilesMap.clear();
  tilesMap.setLoadingMode();
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
      tilesMap.setTerrain(i, j, terrain, overlay);
    }
  var duration = timedRebuild();
  document.getElementById("checksum").textContent = tilesMap.getCheckSum();
  document.getElementById("expected").textContent = "expected: 2309706844";
  document.getElementById("duration").textContent = duration.toString();

  document.getElementById("checksumBlock").style.display = 'block';

  console.log("whole took",(new Date().getTime() - timeRebuildingStart.getTime()) + "ms");
}

function loadSingleCircle(): void {
  document.getElementById("checksumBlock").style.display = 'none'
  tilesMap.clear();

  loadCircle(ETerrain.GRASS_DRY, ETerrain.WATER_OCEAN, EOverlay.NONE, EOverlay.NONE, 0, 0);

  tilesMap.rebuild();
  document.getElementById("checksum").textContent = tilesMap.getCheckSum();
  document.getElementById("expected").textContent = "expected: none";
  document.getElementById("checksumBlock").style.display = 'block';
}

function loadRandomMap(): void {
  document.getElementById("checksumBlock").style.display = 'none'
  tilesMap.clear();
  tilesMap.setLoadingMode();
  for (var i = -18; i < 18; i++)
    for (var j = -18; j < 18; j++) {
      tilesMap.setTerrain(i, j, Math.floor(Math.random() * 22));
    }
  var duration = timedRebuild();
  document.getElementById("checksum").textContent = tilesMap.getCheckSum();
  document.getElementById("expected").textContent = "expected: none";
  document.getElementById("duration").textContent = duration.toString();

  document.getElementById("checksumBlock").style.display = 'block';
}

function loadRandomMapWithWoods(): void {
  document.getElementById("checksumBlock").style.display = 'none'
  tilesMap.clear();
  for (var i = -18; i < 18; i++)
    for (var j = -18; j < 18; j++) {
      tilesMap.setTerrain(i, j, ETerrain.GRASS_SEMI_DRY, ETerrain.VOID + 1 + Math.floor(Math.random() * 14));
    }
  tilesMap.rebuild();
}

function loadChunksRandom(): void {
  document.getElementById("checksumBlock").style.display = 'none'
  tilesMap.clear();
  for (var i = -17; i < 17; i++)
    for (var j = -17; j < 17; j++) {
      tilesMap.setTerrain(i, j, ETerrain.GRASS_GREEN);
    }
  for (var i = 0; i < 160; i++) {
    var x = -17 + Math.floor(Math.random() * 34);
    var y = -17 + Math.floor(Math.random() * 34);

    var terrainCode = Math.floor(Math.random() * 21)
    tilesMap.setTerrain(x, y, terrainCode);
    tilesMap.setTerrain(x, y - 1, terrainCode);
    tilesMap.setTerrain(x + 1, y - 1, terrainCode);
    tilesMap.setTerrain(x + 1, y, terrainCode);
    tilesMap.setTerrain(x, y + 1, terrainCode);
    tilesMap.setTerrain(x - 1, y + 1, terrainCode);
    tilesMap.setTerrain(x - 1, y, terrainCode);
  }
  tilesMap.rebuild();
}

function loadRing(radius, terrain): void {
  for (var i = 0; i < radius; i++) {
    tilesMap.setTerrain(2 + i, -radius - 1, terrain);
    tilesMap.setTerrain(2 + radius, i - radius - 1, terrain);
    tilesMap.setTerrain(2 + radius - i, i - 1, terrain);
    tilesMap.setTerrain(-2 - i, radius + 1, terrain);
    tilesMap.setTerrain(-2 - radius, radius - i + 1, terrain);
    tilesMap.setTerrain(-2 + i - radius, -i + 1, terrain);
  }

  // tilesMap.setTerrain(1, -radius - 1, terrain));
  tilesMap.setTerrain(1, -radius, terrain);
  tilesMap.setTerrain(0, -radius, terrain);
  tilesMap.setTerrain(-1, -radius + 1, terrain);
  tilesMap.setTerrain(-2, -radius + 1, terrain);

  tilesMap.setTerrain(-1, radius, terrain);
  tilesMap.setTerrain(0, radius, terrain);
  tilesMap.setTerrain(1, radius - 1, terrain);
  tilesMap.setTerrain(2, radius - 1, terrain);
}

function loadDisk(): void {
  document.getElementById("checksumBlock").style.display = 'none'
  tilesMap.clear();
  var timeRebuildingStart = new Date();
  tilesMap.setLoadingMode();
  loadRing(5, ETerrain.ABYSS);
  loadRing(6, ETerrain.ABYSS);
  loadRing(7, ETerrain.VOID);

  for (var i = 0; i < 5; i++) {
    tilesMap.setTerrain(-6, i + 1, ETerrain.WATER_OCEAN);
    tilesMap.setTerrain(-5, i, ETerrain.WATER_OCEAN);

    tilesMap.setTerrain(-4, i - 1, ETerrain.SAND_BEACH);
    // tilesMap.setTerrain(2 + i, -radius - 2, ETerrain.MOUNTAIN_SNOW);
  }


  tilesMap.setTerrain(5, -5, ETerrain.GRASS_DRY);
  tilesMap.setTerrain(4, -5, ETerrain.GRASS_DRY, EOverlay.TRASH);
  tilesMap.setTerrain(3, -5, ETerrain.GRASS_DRY, EOverlay.VILLAGE_ORC);
  tilesMap.setTerrain(2, -5, ETerrain.GRASS_DRY);
  tilesMap.setTerrain(4, -4, ETerrain.HILLS_DRY);

  tilesMap.setTerrain(3, -4, ETerrain.SWAMP_MUD);
  tilesMap.setTerrain(2, -4, ETerrain.SWAMP_MUD);
  tilesMap.setTerrain(1, -4, ETerrain.SWAMP_MUD);

  tilesMap.setTerrain(1, -3, ETerrain.MOUNTAIN_DRY);
  tilesMap.setTerrain(2, -3, ETerrain.SWAMP_MUD);

  tilesMap.setTerrain(0, -2, ETerrain.MOUNTAIN_DRY);


  tilesMap.setTerrain(3, -3, ETerrain.HILLS_DRY);

  tilesMap.setTerrain(6, -5, ETerrain.GRASS_DRY);
  tilesMap.setTerrain(6, -4, ETerrain.FROZEN_SNOW);
  tilesMap.setTerrain(6, -3, ETerrain.HILLS_SNOW, EOverlay.SNOW_FOREST);
  tilesMap.setTerrain(6, -2, ETerrain.FROZEN_SNOW, EOverlay.SNOW_FOREST);
  tilesMap.setTerrain(6, -1, ETerrain.FROZEN_SNOW, EOverlay.SNOW_FOREST);

  tilesMap.setTerrain(4, -1, ETerrain.MOUNTAIN_SNOW);
  tilesMap.setTerrain(3, -1, ETerrain.MOUNTAIN_SNOW);
  tilesMap.setTerrain(4, -2, ETerrain.MOUNTAIN_SNOW);
  tilesMap.setTerrain(5, -2, ETerrain.MOUNTAIN_SNOW);
  tilesMap.setTerrain(2, 0, ETerrain.MOUNTAIN_SNOW);
  tilesMap.setTerrain(3, 0, ETerrain.MOUNTAIN_SNOW);
  tilesMap.setTerrain(5, -3, ETerrain.HILLS_SNOW);
  tilesMap.setTerrain(4, -3, ETerrain.HILLS_DRY);
  tilesMap.setTerrain(5, -4, ETerrain.GRASS_DRY);

  tilesMap.setTerrain(5, -1, ETerrain.FROZEN_SNOW, EOverlay.SNOW_FOREST);
  tilesMap.setTerrain(5, 0, ETerrain.FROZEN_SNOW);

  tilesMap.setTerrain(4, 0, ETerrain.FROZEN_SNOW, EOverlay.VILLAGE_HUMAN);
  tilesMap.setTerrain(4, 1, ETerrain.FROZEN_SNOW);

  tilesMap.setTerrain(3, 1, ETerrain.FROZEN_ICE);
  tilesMap.setTerrain(3, 2, ETerrain.FROZEN_ICE);

  tilesMap.setTerrain(2, 1, ETerrain.FROZEN_ICE);
  tilesMap.setTerrain(2, 2, ETerrain.FROZEN_ICE);
  tilesMap.setTerrain(2, 3, ETerrain.FROZEN_ICE);

  tilesMap.setTerrain(1, 2, ETerrain.FROZEN_ICE);
  tilesMap.setTerrain(1, 3, ETerrain.FROZEN_ICE);

  tilesMap.setTerrain(0, 3, ETerrain.WATER_OCEAN);
  tilesMap.setTerrain(0, 4, ETerrain.WATER_OCEAN);

  tilesMap.setTerrain(-3, 2, ETerrain.GRASS_GREEN);
  tilesMap.setTerrain(-3, 3, ETerrain.GRASS_GREEN);
  tilesMap.setTerrain(-3, 1, ETerrain.GRASS_SEMI_DRY);
  tilesMap.setTerrain(-3, 0, ETerrain.GRASS_DRY, EOverlay.DETRITUS);
  tilesMap.setTerrain(-3, -1, ETerrain.SAND_DESERT, EOverlay.OASIS);
  tilesMap.setTerrain(-3, -2, ETerrain.HILLS_DESERT, EOverlay.PALM_DESERT);

  tilesMap.setTerrain(-2, 2, ETerrain.GRASS_GREEN, EOverlay.WOODS_PINE);
  tilesMap.setTerrain(-2, 3, ETerrain.GRASS_GREEN);
  tilesMap.setTerrain(-2, 1, ETerrain.GRASS_SEMI_DRY, EOverlay.WOODS_PINE);
  tilesMap.setTerrain(-2, 0, ETerrain.GRASS_DRY, EOverlay.LITER);
  tilesMap.setTerrain(-2, -1, ETerrain.SAND_DESERT, EOverlay.DESERT_PLANTS);
  tilesMap.setTerrain(-2, -2, ETerrain.SAND_DESERT, EOverlay.PALM_DESERT);
  tilesMap.setTerrain(-2, -3, ETerrain.HILLS_DESERT, EOverlay.VILLAGE_DESERT);

  tilesMap.setTerrain(-1, -3, ETerrain.HILLS_DESERT);
  tilesMap.setTerrain(-1, -2, ETerrain.MOUNTAIN_DRY);

  tilesMap.setTerrain(-1, 3, ETerrain.WATER_OCEAN);
  tilesMap.setTerrain(-1, 1, ETerrain.GRASS_SEMI_DRY, EOverlay.WOODS_PINE);
  tilesMap.setTerrain(-1, 2, ETerrain.GRASS_SEMI_DRY, EOverlay.VILLAGE_ELVEN);

  tilesMap.setTerrain(0, 1, ETerrain.MOUNTAIN_BASIC);
  tilesMap.setTerrain(0, 2, ETerrain.HILLS_REGULAR);

  tilesMap.setTerrain(1, 1, ETerrain.FROZEN_SNOW);

  tilesMap.setTerrain(2, -1, ETerrain.MOUNTAIN_BASIC);
  tilesMap.setTerrain(3, -2, ETerrain.MOUNTAIN_BASIC);
  tilesMap.setTerrain(1, 0, ETerrain.MOUNTAIN_BASIC);

  tilesMap.setTerrain(1, -1, ETerrain.SWAMP_WATER);
  tilesMap.setTerrain(2, -2, ETerrain.SWAMP_WATER, EOverlay.VILLAGE_SWAMP);
  tilesMap.setTerrain(1, -2, ETerrain.SWAMP_WATER);
  tilesMap.setTerrain(0, 0, ETerrain.SWAMP_WATER);


  tilesMap.setTerrain(-1, 0, ETerrain.WATER_COAST_TROPICAL, EOverlay.VILLAGE_COAST);
  tilesMap.setTerrain(-1, -1, ETerrain.WATER_COAST_TROPICAL);
  tilesMap.setTerrain(0, -1, ETerrain.WATER_COAST_TROPICAL);

  tilesMap.setTerrain(0, -3, ETerrain.MOUNTAIN_VOLCANO);
  tilesMap.setTerrain(0, -4, ETerrain.SAND_DESERT);

  for (var i = 0; i < 4; i++) {
    tilesMap.setTerrain(-2 - i, 4 + 1, ETerrain.WATER_OCEAN);
    tilesMap.setTerrain(-1 - i, 4, ETerrain.WATER_OCEAN);
  }
  var duration = timedRebuild();

  console.log("whole took",(new Date().getTime() - timeRebuildingStart.getTime()) + "ms");

  document.getElementById("checksum").textContent = tilesMap.getCheckSum();
  document.getElementById("expected").textContent = "expected: 2200860578";
  document.getElementById("duration").textContent = duration.toString();
  document.getElementById("checksumBlock").style.display = 'block'
}

function timedRebuild(): number {
  var timeRebuildingStart = new Date();
  tilesMap.rebuild();
  return new Date().getTime() - timeRebuildingStart.getTime();
}

function loadCircle(terrain1, terrain2, overlay1, overlay2, x, y) {
  tilesMap.setTerrain(x, y, terrain1, overlay1);
  tilesMap.setTerrain(x, y - 1, terrain2, overlay2);
  tilesMap.setTerrain(x + 1, y - 1, terrain2, overlay2);
  tilesMap.setTerrain(x + 1, y, terrain2, overlay2);
  tilesMap.setTerrain(x, y + 1, terrain2, overlay2);
  tilesMap.setTerrain(x - 1, y + 1, terrain2, overlay2);
  tilesMap.setTerrain(x - 1, y, terrain2, overlay2);
}

function start() {
  var timeStart = new Date();
  var canvas = <HTMLCanvasElement>document.getElementById("map-canvas");
  tilesMap = new WesnothTiles.TilesMap(canvas);
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


    tilesMap.resize(window.innerWidth, window.innerHeight);
    var anim = () => {
      window.requestAnimationFrame(() => {
        tilesMap.redraw();
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