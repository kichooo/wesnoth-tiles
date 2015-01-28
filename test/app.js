function start() {
  var img = new Image();
  img.src = "hexes_1.png"
  img.onload = function() {
    var canvas = document.getElementById("map-canvas");
    var renderer = new WesnothTiles.Renderer(canvas);

    var def = new WesnothTiles.SpriteDefinition({
      point: {
        x: 1342,
        y: 660
      },
      size: {
        x: 72,
        y: 72
      }
    }, {
      point: {
        x: 0,
        y: 0
      },
      size: {
        x: 72,
        y: 72
      }
    }, {
      x: 72,
      y: 72
    }, img);

    mapa = new Map();
    mapa.set("hills/regular.png", def);

    renderer.provideAtlas("hexes_1", img, mapa);
    renderer.Resize(window.innerWidth, window.innerHeight);
    renderer.redraw();
  }

}

// "filename": "hills/regular.png",
// "frame": {"x":1342,"y":660,"w":72,"h":72},
// "rotated": false,
// "trimmed": false,
// "spriteSourceSize": {"x":0,"y":0,"w":72,"h":72},
// "sourceSize": {"w":72,"h":72},
// "pivot": {"x":0.5,"y":0.5}