function start() {
  var canvas = document.getElementById("map-canvas");
  var renderer = new WesnothTiles.Renderer(canvas);

  renderer.load().then(function() {

    var map = new WesnothTiles.HexMap();

    for (var i = -20; i < 20; i++)
      for (var j = -20; j < 20; j++) {
        map.addHex(new WesnothTiles.Hex(i, j, Math.round(Math.sqrt(Math.abs(i * i/2 + i /5 + i * 2 * j + j))) % 8));        
        // map.addHex(new WesnothTiles.Hex(i, j, Math.round(Math.sqrt(Math.abs(i * i/2 + i * 2 * j * j + j))) % 4 + 4));        
      }

    // map.addHex(new WesnothTiles.Hex(-1, -4, 0));
    // map.addHex(new WesnothTiles.Hex(0, -4, 3));
    // map.addHex(new WesnothTiles.Hex(1, -4, 3));
    // map.addHex(new WesnothTiles.Hex(2, -4, 3));
    // map.addHex(new WesnothTiles.Hex(3, -4, 3));

    // map.addHex(new WesnothTiles.Hex(-1, -3, 1));
    // map.addHex(new WesnothTiles.Hex(0, -3, 2));
    // map.addHex(new WesnothTiles.Hex(1, -3, 2));
    // map.addHex(new WesnothTiles.Hex(2, -3, 2));
    // map.addHex(new WesnothTiles.Hex(3, -3, 2));

    // map.addHex(new WesnothTiles.Hex(-1, -2, 2));
    // map.addHex(new WesnothTiles.Hex(0, -2, 0));
    // map.addHex(new WesnothTiles.Hex(1, -2, 0));
    // map.addHex(new WesnothTiles.Hex(2, -2, 0));
    // map.addHex(new WesnothTiles.Hex(3, -2, 0));

    // map.addHex(new WesnothTiles.Hex(-1, -1, 3));
    // map.addHex(new WesnothTiles.Hex(0, -1, 0));
    // map.addHex(new WesnothTiles.Hex(1, -1, 0));
    // map.addHex(new WesnothTiles.Hex(2, -1, 0));
    // map.addHex(new WesnothTiles.Hex(3, -1, 0));

    // map.addHex(new WesnothTiles.Hex(-1, 0, 2));
    // map.addHex(new WesnothTiles.Hex(0, 0, 1));
    // map.addHex(new WesnothTiles.Hex(1, 0, 1));
    // map.addHex(new WesnothTiles.Hex(2, 0, 1));
    // map.addHex(new WesnothTiles.Hex(3, 0, 1));

    // map.addHex(new WesnothTiles.Hex(-1, 1, 1));
    // map.addHex(new WesnothTiles.Hex(0, 1, 1));
    // map.addHex(new WesnothTiles.Hex(1, 1, 1));
    // map.addHex(new WesnothTiles.Hex(2, 1, 1));
    // map.addHex(new WesnothTiles.Hex(3, 1, 1));

    // map.addHex(new WesnothTiles.Hex(-1, 2, 0));
    // map.addHex(new WesnothTiles.Hex(0, 2, 2));
    // map.addHex(new WesnothTiles.Hex(1, 2, 2));
    // map.addHex(new WesnothTiles.Hex(2, 2, 2));
    // map.addHex(new WesnothTiles.Hex(3, 2, 2));

    // map.addHex(new WesnothTiles.Hex(-1, 3, 1));
    // map.addHex(new WesnothTiles.Hex(0, 3, 2));
    // map.addHex(new WesnothTiles.Hex(1, 3, 2));
    // map.addHex(new WesnothTiles.Hex(2, 3, 2));
    // map.addHex(new WesnothTiles.Hex(3, 3, 2));

    renderer.Resize(window.innerWidth, window.innerHeight);
    renderer.redraw(map);
  });
  // var img = new Image();
  // img.src = "hexes_1.png"
  // img.onload = function() {


  //   var def = new WesnothTiles.SpriteDefinition({
  //     point: {
  //       x: 1342,
  //       y: 660
  //     },
  //     size: {
  //       x: 72,
  //       y: 72
  //     }
  //   }, {
  //     point: {
  //       x: 0,
  //       y: 0
  //     },
  //     size: {
  //       x: 72,
  //       y: 72
  //     }
  //   }, {
  //     x: 72,
  //     y: 72
  //   }, img);

  //   mapa = new Map();
  //   mapa.set("hills/regular.png", def);

  //   renderer.provideAtlas("hexes_1", img, mapa);

  // }

}

// "filename": "hills/regular.png",
// "frame": {"x":1342,"y":660,"w":72,"h":72},
// "rotated": false,
// "trimmed": false,
// "spriteSourceSize": {"x":0,"y":0,"w":72,"h":72},
// "sourceSize": {"w":72,"h":72},
// "pivot": {"x":0.5,"y":0.5}