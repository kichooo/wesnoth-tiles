// Worker. Meant to be run on another thread.

module WesnothTiles.Worker {
  'use strict';

  export var spriteNames = new Set<string>();

  var hexMaps = new Map<string, HexMap>();

  var ensureMap = (name: string): HexMap => {
    var map = hexMaps.get(name);
    if (map === undefined) {
      map = new HexMap();
      hexMaps.set(name, map);
    }
    return map;
  }

  export class Worker {
    constructor() {
      onmessage = (oEvent: MessageEvent) => {
        var order: Internal.IWorkerOrder = oEvent.data;

        var func = this[order.func];
        var result = func(order.data);
        var response: Internal.IWorkerResponse = {
          id: order.id,
          data: result,
        }

        postMessage(response);
      }
    }

    setTiles = (bundle: Internal.ISetTerrainBundle): void => {
      var map = ensureMap(bundle.mapName);
      if (bundle.loadingMode)
        map.setLoadingMode();
      bundle.tileChanges.forEach(change => {
        if (change.terrain === undefined || change.terrain === null) {
          map.removeTerrain(change.q, change.r);
        }
        map.setTerrain(change.q, change.r, change.terrain, change.overlay, change.fog);
      });
      map.unsetLoadingMode();
    }

    init = (definitions: string[]): void => {
      definitions.forEach(spriteName => spriteNames.add(spriteName));
    }

    rebuild = (mapName: string): Internal.DrawableData[]=> {
      var map = ensureMap(mapName);
      map.unsetLoadingMode();
      var drawables = rebuild(map);
      drawables.sort(sortFunc);

      return drawables;
    }

    getChecksum = (mapName: string): string => {
      var map = ensureMap(mapName);
      var drawables = this.rebuild(mapName);

      var checksum = 0;

      drawables.sort(sortFuncForChecksum);
      drawables.forEach(drawable => {
        checksum = murmurhash3(drawable.toString(), checksum);
      });

      return checksum.toString();
    }

    clear = (mapName: string): void => {
      ensureMap(mapName).clear();
    }
  }

  var sortFunc = (a: Internal.DrawableData, b: Internal.DrawableData) => {
    if (a.layer === b.layer) {
      if (a.base !== undefined && b.base !== undefined) {
        return a.base.y - b.base.y;
      }
      if (b.base !== undefined) {
        return a.layer < 0 ? -1 : 1;
      } else if (a.base !== undefined) {
        return b.layer < 0 ? 1 : -1;
      }
      return 0;
    }
    return a.layer - b.layer;
  };

  var sortFuncForChecksum = (a: Internal.DrawableData, b: Internal.DrawableData) => {
    if (a.layer === b.layer) {
      if (a.base !== undefined && b.base !== undefined) {
        if (a.base.y === b.base.y) {
          return a.toString() < b.toString() ? -1 : 1;
        }
        return a.base.y - b.base.y;
      }
      if (b.base !== undefined) {
        return a.layer < 0 ? -1 : 1;
      } else if (a.base !== undefined) {
        return b.layer < 0 ? 1 : -1;
      }
      return a.toString() < b.toString() ? -1 : 1;
    }
    return a.layer - b.layer;
  };

}

var worker = new WesnothTiles.Worker.Worker();

