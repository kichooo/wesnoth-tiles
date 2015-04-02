function loadRandomMap(map) {
  for (var i = -18; i < 18; i++)
    for (var j = -18; j < 18; j++) {
      map.addHex(new WesnothTiles.Hex(i, j, Math.floor(Math.random() * 20)));
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

    var terrainCode = Math.floor(Math.random() * 20)
    map.addHex(new WesnothTiles.Hex(x, y, terrainCode));
    map.addHex(new WesnothTiles.Hex(x, y - 1, terrainCode));
    map.addHex(new WesnothTiles.Hex(x + 1, y - 1, terrainCode));
    map.addHex(new WesnothTiles.Hex(x + 1, y, terrainCode));
    map.addHex(new WesnothTiles.Hex(x, y + 1, terrainCode));
    map.addHex(new WesnothTiles.Hex(x - 1, y + 1, terrainCode));
    map.addHex(new WesnothTiles.Hex(x - 1, y, terrainCode));
  }
}

function start() {
  var canvas = document.getElementById("map-canvas");
  var renderer = new WesnothTiles.Renderer(canvas);
  renderer.load().then(function() {

    var map = new WesnothTiles.HexMap();
    loadChunksRandom(map);
    // loadRandomMap(map);
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