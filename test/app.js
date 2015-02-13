function start() {
  var canvas = document.getElementById("map-canvas");
  var renderer = new WesnothTiles.Renderer(canvas);

  renderer.load().then(function() {

    var map = new WesnothTiles.HexMap();

    for (var i = -20; i < 20; i++)
      for (var j = -20; j < 20; j++) {
        // map.addHex(new WesnothTiles.Hex(i, j, Math.round(Math.sqrt(Math.abs(j * j * i * i * i / 5 + i / 5 + i * 2 * j + j))) % 10));
        map.addHex(new WesnothTiles.Hex(i, j, Math.floor(Math.random() * 12)));
        // map.addHex(new WesnothTiles.Hex(i, j, Math.round(Math.sqrt(Math.abs(i * i/2 + i * 2 * j * j + j))) % 4 + 4));        
      }

    // map.addHex(new WesnothTiles.Hex(-1, -4, 0));
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