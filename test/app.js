function start() {
  var canvas = document.getElementById("map-canvas");
  var renderer = new WesnothTiles.Renderer(canvas);

  renderer.load().then(function() {
    renderer.addHex(new WesnothTiles.Hex(0, 0, 1));
    renderer.addHex(new WesnothTiles.Hex(1, 0, 1));
    renderer.addHex(new WesnothTiles.Hex(2, 0, 1));
    renderer.addHex(new WesnothTiles.Hex(3, 0, 1));

    renderer.addHex(new WesnothTiles.Hex(0, 1, 1));
    renderer.addHex(new WesnothTiles.Hex(1, 1, 1));
    renderer.addHex(new WesnothTiles.Hex(2, 1, 1));
    renderer.addHex(new WesnothTiles.Hex(3, 1, 1));

    renderer.addHex(new WesnothTiles.Hex(0, 2, 1));
    renderer.addHex(new WesnothTiles.Hex(1, 2, 1));
    renderer.addHex(new WesnothTiles.Hex(2, 2, 1));
    renderer.addHex(new WesnothTiles.Hex(3, 2, 1));

    renderer.Resize(window.innerWidth, window.innerHeight);
    renderer.redraw();
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