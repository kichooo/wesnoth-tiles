function loadRandomMap(map) {
  for (var i = -18; i < 18; i++)
    for (var j = -18; j < 18; j++) {
      map.addHex(new WesnothTiles.Hex(i, j, Math.floor(Math.random() * 21)));
    }
}

function loadChunksRandom(map) {
  for (var i = -17; i < 17; i++)
    for (var j = -17; j < 17; j++) {
      map.addHex(new WesnothTiles.Hex(i, j, WesnothTiles.ETerrain.GRASS_GREEN));
    }
  for (var i = 0; i < 160; i++) {
    var x = -17 + Math.floor(Math.random() * 34);
    var y = -17 + Math.floor(Math.random() * 34);

    var terrainCode = Math.floor(Math.random() * 21)
    map.addHex(new WesnothTiles.Hex(x, y, terrainCode));
    map.addHex(new WesnothTiles.Hex(x, y - 1, terrainCode));
    map.addHex(new WesnothTiles.Hex(x + 1, y - 1, terrainCode));
    map.addHex(new WesnothTiles.Hex(x + 1, y, terrainCode));
    map.addHex(new WesnothTiles.Hex(x, y + 1, terrainCode));
    map.addHex(new WesnothTiles.Hex(x - 1, y + 1, terrainCode));
    map.addHex(new WesnothTiles.Hex(x - 1, y, terrainCode));
  }
}

function loadRing(map, radius, terrain) {
  for (var i = 0; i < radius; i++) {
    map.addHex(new WesnothTiles.Hex(2 + i, -radius - 1, terrain));
    map.addHex(new WesnothTiles.Hex(2 + radius, i - radius - 1, terrain));
    map.addHex(new WesnothTiles.Hex(2 + radius - i, i - 1, terrain));
    map.addHex(new WesnothTiles.Hex(-2 - i, radius + 1, terrain));
    map.addHex(new WesnothTiles.Hex(-2 - radius, radius - i + 1, terrain));
    map.addHex(new WesnothTiles.Hex(-2 + i - radius, -i + 1, terrain));
  }

  // map.addHex(new WesnothTiles.Hex(1, -radius - 1, terrain));
  map.addHex(new WesnothTiles.Hex(1, -radius, terrain));
  map.addHex(new WesnothTiles.Hex(0, -radius, terrain));
  map.addHex(new WesnothTiles.Hex(-1, -radius + 1, terrain));
  map.addHex(new WesnothTiles.Hex(-2, -radius + 1, terrain));

  map.addHex(new WesnothTiles.Hex(-1, radius, terrain));
  map.addHex(new WesnothTiles.Hex(0, radius, terrain));
  map.addHex(new WesnothTiles.Hex(1, radius - 1, terrain));
  map.addHex(new WesnothTiles.Hex(2, radius - 1, terrain));
}

function loadDisk(map) {
  // map.addHex(new WesnothTiles.Hex(0, 0, WesnothTiles.ETerrain.ABYSS));
  loadRing(map, 5, WesnothTiles.ETerrain.ABYSS);
  loadRing(map, 6, WesnothTiles.ETerrain.ABYSS);

  for (var i = 0; i < 5; i++) {
    map.addHex(new WesnothTiles.Hex(-6, i + 1, WesnothTiles.ETerrain.WATER_OCEAN));
    map.addHex(new WesnothTiles.Hex(-5, i, WesnothTiles.ETerrain.WATER_OCEAN));

    map.addHex(new WesnothTiles.Hex(-4, i - 1, WesnothTiles.ETerrain.SAND_BEACH));
    // map.addHex(new WesnothTiles.Hex(2 + i, -radius - 2, WesnothTiles.ETerrain.MOUNTAIN_SNOW));
  }


  map.addHex(new WesnothTiles.Hex(5, -5, WesnothTiles.ETerrain.GRASS_DRY));
  map.addHex(new WesnothTiles.Hex(4, -5, WesnothTiles.ETerrain.GRASS_DRY));
  map.addHex(new WesnothTiles.Hex(3, -5, WesnothTiles.ETerrain.GRASS_DRY));
  map.addHex(new WesnothTiles.Hex(2, -5, WesnothTiles.ETerrain.GRASS_DRY));
  map.addHex(new WesnothTiles.Hex(4, -4, WesnothTiles.ETerrain.HILLS_DRY));

  map.addHex(new WesnothTiles.Hex(3, -4, WesnothTiles.ETerrain.SWAMP_MUD));
  map.addHex(new WesnothTiles.Hex(2, -4, WesnothTiles.ETerrain.SWAMP_MUD));
  map.addHex(new WesnothTiles.Hex(1, -4, WesnothTiles.ETerrain.SWAMP_MUD));

  map.addHex(new WesnothTiles.Hex(1, -3, WesnothTiles.ETerrain.MOUNTAIN_DRY));
  map.addHex(new WesnothTiles.Hex(2, -3, WesnothTiles.ETerrain.SWAMP_MUD));

  map.addHex(new WesnothTiles.Hex(0, -2, WesnothTiles.ETerrain.MOUNTAIN_DRY));


  map.addHex(new WesnothTiles.Hex(3, -3, WesnothTiles.ETerrain.HILLS_DRY));

  map.addHex(new WesnothTiles.Hex(6, -5, WesnothTiles.ETerrain.GRASS_DRY));
  map.addHex(new WesnothTiles.Hex(6, -4, WesnothTiles.ETerrain.FROZEN_SNOW));
  map.addHex(new WesnothTiles.Hex(6, -3, WesnothTiles.ETerrain.HILLS_SNOW, WesnothTiles.EOverlay.SNOW_FOREST));
  map.addHex(new WesnothTiles.Hex(6, -2, WesnothTiles.ETerrain.FROZEN_SNOW, WesnothTiles.EOverlay.SNOW_FOREST));
  map.addHex(new WesnothTiles.Hex(6, -1, WesnothTiles.ETerrain.FROZEN_SNOW, WesnothTiles.EOverlay.SNOW_FOREST));

  map.addHex(new WesnothTiles.Hex(4, -1, WesnothTiles.ETerrain.MOUNTAIN_SNOW));
  map.addHex(new WesnothTiles.Hex(3, -1, WesnothTiles.ETerrain.MOUNTAIN_SNOW));
  map.addHex(new WesnothTiles.Hex(4, -2, WesnothTiles.ETerrain.MOUNTAIN_SNOW));
  map.addHex(new WesnothTiles.Hex(5, -2, WesnothTiles.ETerrain.MOUNTAIN_SNOW));
  map.addHex(new WesnothTiles.Hex(2, 0, WesnothTiles.ETerrain.MOUNTAIN_SNOW));
  map.addHex(new WesnothTiles.Hex(3, 0, WesnothTiles.ETerrain.MOUNTAIN_SNOW));
  map.addHex(new WesnothTiles.Hex(5, -3, WesnothTiles.ETerrain.HILLS_SNOW));
  map.addHex(new WesnothTiles.Hex(4, -3, WesnothTiles.ETerrain.HILLS_DRY));
  map.addHex(new WesnothTiles.Hex(5, -4, WesnothTiles.ETerrain.GRASS_DRY));

  map.addHex(new WesnothTiles.Hex(5, -1, WesnothTiles.ETerrain.FROZEN_SNOW, WesnothTiles.EOverlay.SNOW_FOREST));
  map.addHex(new WesnothTiles.Hex(5, 0, WesnothTiles.ETerrain.FROZEN_SNOW));

  map.addHex(new WesnothTiles.Hex(4, 0, WesnothTiles.ETerrain.FROZEN_SNOW));
  map.addHex(new WesnothTiles.Hex(4, 1, WesnothTiles.ETerrain.FROZEN_SNOW));

  map.addHex(new WesnothTiles.Hex(3, 1, WesnothTiles.ETerrain.FROZEN_ICE));
  map.addHex(new WesnothTiles.Hex(3, 2, WesnothTiles.ETerrain.FROZEN_ICE));

  map.addHex(new WesnothTiles.Hex(2, 1, WesnothTiles.ETerrain.FROZEN_ICE));
  map.addHex(new WesnothTiles.Hex(2, 2, WesnothTiles.ETerrain.FROZEN_ICE));
  map.addHex(new WesnothTiles.Hex(2, 3, WesnothTiles.ETerrain.FROZEN_ICE));

  map.addHex(new WesnothTiles.Hex(1, 2, WesnothTiles.ETerrain.FROZEN_ICE));
  map.addHex(new WesnothTiles.Hex(1, 3, WesnothTiles.ETerrain.FROZEN_ICE));

  map.addHex(new WesnothTiles.Hex(0, 3, WesnothTiles.ETerrain.WATER_OCEAN));
  map.addHex(new WesnothTiles.Hex(0, 4, WesnothTiles.ETerrain.WATER_OCEAN));

  map.addHex(new WesnothTiles.Hex(-3, 2, WesnothTiles.ETerrain.GRASS_GREEN));
  map.addHex(new WesnothTiles.Hex(-3, 3, WesnothTiles.ETerrain.GRASS_GREEN));
  map.addHex(new WesnothTiles.Hex(-3, 1, WesnothTiles.ETerrain.GRASS_SEMI_DRY));
  map.addHex(new WesnothTiles.Hex(-3, 0, WesnothTiles.ETerrain.GRASS_DRY));
  map.addHex(new WesnothTiles.Hex(-3, -1, WesnothTiles.ETerrain.SAND_DESERT, WesnothTiles.EOverlay.PALM_DESERT));
  map.addHex(new WesnothTiles.Hex(-3, -2, WesnothTiles.ETerrain.HILLS_DESERT, WesnothTiles.EOverlay.PALM_DESERT));

  map.addHex(new WesnothTiles.Hex(-2, 2, WesnothTiles.ETerrain.GRASS_GREEN, WesnothTiles.EOverlay.WOODS_PINE));
  map.addHex(new WesnothTiles.Hex(-2, 3, WesnothTiles.ETerrain.GRASS_GREEN));
  map.addHex(new WesnothTiles.Hex(-2, 1, WesnothTiles.ETerrain.GRASS_SEMI_DRY, WesnothTiles.EOverlay.WOODS_PINE));
  map.addHex(new WesnothTiles.Hex(-2, 0, WesnothTiles.ETerrain.GRASS_DRY));
  map.addHex(new WesnothTiles.Hex(-2, -1, WesnothTiles.ETerrain.SAND_DESERT, WesnothTiles.EOverlay.PALM_DESERT));
  map.addHex(new WesnothTiles.Hex(-2, -2, WesnothTiles.ETerrain.SAND_DESERT));
  map.addHex(new WesnothTiles.Hex(-2, -3, WesnothTiles.ETerrain.HILLS_DESERT));

  map.addHex(new WesnothTiles.Hex(-1, -3, WesnothTiles.ETerrain.HILLS_DESERT));
  map.addHex(new WesnothTiles.Hex(-1, -2, WesnothTiles.ETerrain.MOUNTAIN_DRY));

  map.addHex(new WesnothTiles.Hex(-1, 3, WesnothTiles.ETerrain.WATER_OCEAN));
  map.addHex(new WesnothTiles.Hex(-1, 1, WesnothTiles.ETerrain.GRASS_SEMI_DRY, WesnothTiles.EOverlay.WOODS_PINE));
  map.addHex(new WesnothTiles.Hex(-1, 2, WesnothTiles.ETerrain.GRASS_SEMI_DRY));

  map.addHex(new WesnothTiles.Hex(0, 1, WesnothTiles.ETerrain.MOUNTAIN_BASIC));
  map.addHex(new WesnothTiles.Hex(0, 2, WesnothTiles.ETerrain.HILLS_REGULAR));

  map.addHex(new WesnothTiles.Hex(1, 1, WesnothTiles.ETerrain.FROZEN_SNOW));

  map.addHex(new WesnothTiles.Hex(2, -1, WesnothTiles.ETerrain.MOUNTAIN_BASIC));
  map.addHex(new WesnothTiles.Hex(3, -2, WesnothTiles.ETerrain.MOUNTAIN_BASIC));
  map.addHex(new WesnothTiles.Hex(1, 0, WesnothTiles.ETerrain.MOUNTAIN_BASIC));

  map.addHex(new WesnothTiles.Hex(1, -1, WesnothTiles.ETerrain.SWAMP_WATER));
  map.addHex(new WesnothTiles.Hex(2, -2, WesnothTiles.ETerrain.SWAMP_WATER));
  map.addHex(new WesnothTiles.Hex(1, -2, WesnothTiles.ETerrain.SWAMP_WATER));
  map.addHex(new WesnothTiles.Hex(0, 0, WesnothTiles.ETerrain.SWAMP_WATER));


  map.addHex(new WesnothTiles.Hex(-1, 0, WesnothTiles.ETerrain.WATER_COAST_TROPICAL));
  map.addHex(new WesnothTiles.Hex(-1, -1, WesnothTiles.ETerrain.WATER_COAST_TROPICAL));
  map.addHex(new WesnothTiles.Hex(0, -1, WesnothTiles.ETerrain.WATER_COAST_TROPICAL));

  map.addHex(new WesnothTiles.Hex(0, -3, WesnothTiles.ETerrain.MOUNTAIN_VOLCANO));
  map.addHex(new WesnothTiles.Hex(0, -4, WesnothTiles.ETerrain.SAND_DESERT));

  for (var i = 0; i < 4; i++) {
    map.addHex(new WesnothTiles.Hex(-2 - i, 4 + 1, WesnothTiles.ETerrain.WATER_OCEAN));
    map.addHex(new WesnothTiles.Hex(-1 - i, 4, WesnothTiles.ETerrain.WATER_OCEAN));
  }
}

function loadCircle(map, terrain1, terrain2, overlay1, overlay2, x, y) {
  map.addHex(new WesnothTiles.Hex(x, y, terrain1, overlay1));

  map.addHex(new WesnothTiles.Hex(x, y - 1, terrain2, overlay2));
  map.addHex(new WesnothTiles.Hex(x + 1, y - 1, terrain2, overlay2));
  map.addHex(new WesnothTiles.Hex(x + 1, y, terrain2, overlay2));
  map.addHex(new WesnothTiles.Hex(x, y + 1, terrain2, overlay2));
  map.addHex(new WesnothTiles.Hex(x - 1, y + 1, terrain2, overlay2));
  map.addHex(new WesnothTiles.Hex(x - 1, y, terrain2, overlay2));
}

function start() {
  var canvas = document.getElementById("map-canvas");
  var renderer = new WesnothTiles.Renderer(canvas);
  renderer.load().then(function() {

    var map = new WesnothTiles.HexMap();
    // loadChunksRandom(map);
    // loadRandomMap(map);
    // loadCircle(map, WesnothTiles.ETerrain.ABYSS, WesnothTiles.ETerrain.GRASS_GREEN, -2, 0);
    // loadCircle(map, WesnothTiles.ETerrain.GRASS_GREEN, WesnothTiles.ETerrain.GRASS_GREEN, WesnothTiles.EOverlay.WOODS_PINE, WesnothTiles.EOverlay.WOODS_PINE, 2, -2);
    // loadCircle(map, WesnothTiles.ETerrain.GRASS_GREEN, WesnothTiles.ETerrain.ABYSS, 2, -2);
    loadDisk(map);
    // var min = 0;
    // var max = 0;
    // for (var i = -18; i < 18; i++)
    //   for (var j = -18; j < 18; j++) {
    //     var x = i / 4;
    //     var y = j / 4;

    //     // var code = Math.sqrt(x * x + y * y) + x * Math.sin(Math.sqrt(x * x + y * y));
    //     var code = Math.sin(-1 + (Math.sqrt(Math.abs(x + y)) + Math.sqrt(Math.abs(y * x))) / 2);
    //     if (code > max) max = code;
    //     if (code < min) min = code;
    //   }
    // var spread = max - min;
    // for (var i = -18; i < 18; i++)
    //   for (var j = -18; j < 18; j++) {
    //     var x = i / 4;
    //     var y = j / 4;

    //     var code = Math.sin(-1 + (Math.sqrt(Math.abs(x + y)) + Math.sqrt(Math.abs(y * x))) / 2);
    //     code = (code - min) * 20 / spread;

    //     map.addHex(new WesnothTiles.Hex(i, j, Math.round(Math.max(0, Math.min(code, 20)))));
    //     // map.addHex(new WesnothTiles.Hex(i, j, Math.round(Math.sqrt(Math.abs(j * j * i * i * i / 5 + i / 5 + i * 2 * j + j))) % 10));
    //     // map.addHex(new WesnothTiles.Hex(i, j, 0 + Math.floor(Math.random() * 20)));
    //     // map.addHex(new WesnothTiles.Hex(i, j, 4));
    //     // map.addHex(new WesnothTiles.Hex(i, j, Math.round(Math.sqrt(Math.abs(i * i/2 + i * 2 * j * j + j))) % 4 + 4));        
    //   }


    // map.addHex(new WesnothTiles.Hex(0, 0, WesnothTiles.ETerrain.MOUNTAIN_SNOW));

    // map.addHex(new WesnothTiles.Hex(0, -1, WesnothTiles.ETerrain.SAND_DESERT));
    // map.addHex(new WesnothTiles.Hex(1, -1, WesnothTiles.ETerrain.SAND_DESERT));
    // map.addHex(new WesnothTiles.Hex(1, 0, WesnothTiles.ETerrain.SAND_DESERT));
    // map.addHex(new WesnothTiles.Hex(0, 1, WesnothTiles.ETerrain.SAND_DESERT));
    // map.addHex(new WesnothTiles.Hex(-1, 1, WesnothTiles.ETerrain.SAND_DESERT));
    // map.addHex(new WesnothTiles.Hex(-1, 0, WesnothTiles.ETerrain.SAND_DESERT));


    // // map.addHex(new WesnothTiles.Hex(0, -1, WesnothTiles.ETerrain.GRASS_GREEN));
    // // map.addHex(new WesnothTiles.Hex(1, -1, WesnothTiles.ETerrain.GRASS_GREEN));
    // // map.addHex(new WesnothTiles.Hex(1, 0, WesnothTiles.ETerrain.GRASS_GREEN));
    // // map.addHex(new WesnothTiles.Hex(0, 1, WesnothTiles.ETerrain.GRASS_GREEN));
    // // map.addHex(new WesnothTiles.Hex(-1, 1, WesnothTiles.ETerrain.GRASS_GREEN));
    // // map.addHex(new WesnothTiles.Hex(-1, 0, WesnothTiles.ETerrain.GRASS_GREEN));

    // for (var i = 0; i < 5; i++) {
    //   map.addHex(new WesnothTiles.Hex(i, 0 + 2, WesnothTiles.ETerrain.MOUNTAIN_DRY));
    //   map.addHex(new WesnothTiles.Hex(i + 1, -1 + 2, WesnothTiles.ETerrain.MOUNTAIN_DRY));
    // }

    // for (var i = 0; i < 5; i++) {
    //   map.addHex(new WesnothTiles.Hex(-i, i - 3, WesnothTiles.ETerrain.MOUNTAIN_BASIC));
    //   map.addHex(new WesnothTiles.Hex(1 - i, i - 3, WesnothTiles.ETerrain.MOUNTAIN_BASIC));
    // }

    // for (var i = 0; i < 2; i++) {
    //   map.addHex(new WesnothTiles.Hex(i + 4, -2, WesnothTiles.ETerrain.MOUNTAIN_SNOW));
    //   map.addHex(new WesnothTiles.Hex(i + 1 + 4, -1 - 2, WesnothTiles.ETerrain.MOUNTAIN_SNOW));
    // }

    // for (var i = 0; i < 3; i++) {
    //   map.addHex(new WesnothTiles.Hex(-i - 6, i, WesnothTiles.ETerrain.MOUNTAIN_DRY));
    // }

    // // map.addHex(new WesnothTiles.Hex(-2, 1, WesnothTiles.ETerrain.GRASS_GREEN));


    renderer.rebuild(map);
    renderer.Resize(window.innerWidth, window.innerHeight);
    var anim = function() {
      window.requestAnimationFrame(function() {
        renderer.redraw(map);
        anim();
      });
    };
    anim();
  });

}