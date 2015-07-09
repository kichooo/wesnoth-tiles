// Worker. Meant to be run on another thread.

module WesnothTiles.Worker {
  'use strict';

  export var spriteNames = new Set<string>();

  var hexMaps = new Map<number, HexMap>();

  var ensureMap = (mapId: number): HexMap => {
    var map = hexMaps.get(mapId);
    if (map === undefined) {
      map = new HexMap();
      hexMaps.set(mapId, map);
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
      var map = ensureMap(bundle.mapId);
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

    rebuild = (mapId: number): Internal.DrawableData[]=> {
      var map = ensureMap(mapId);
      map.unsetLoadingMode();
      var drawables = rebuild(map);
      drawables.sort(sortFunc);

      return drawables;
    }

    getChecksum = (mapId: number): string => {
      var map = ensureMap(mapId);
      var drawables = this.rebuild(mapId);

      var checksum = 0;

      drawables.sort(sortFuncForChecksum);
      drawables.forEach(drawable => {
        checksum = murmurhash3(drawable.toString(), checksum);
      });

      return checksum.toString();
    }

    clear = (mapId: number): void => {
      ensureMap(mapId).clear();
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

