function start() {
	var canvas = document.getElementById("map-canvas");
	var map = new WesnothTiles.Map(canvas);
    map.Resize(window.innerWidth, window.innerHeight);
    map.Redraw();
}