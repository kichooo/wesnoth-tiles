function start() {
	var canvas = document.getElementById("map-canvas");
	var renderer = new WesnothTiles.Renderer(canvas);
    renderer.Resize(window.innerWidth, window.innerHeight);
    renderer.Redraw();
}