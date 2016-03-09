// Worker. Meant to be run on another thread.

module WesnothTiles.Worker {
  'use strict';

  export const spriteNames = new Set<string>();

  const hexMaps = new Map<number, HexMap>();

  const ensureMap = (mapId: number): HexMap => {
    let map = hexMaps.get(mapId);
    if (map === undefined) {
      map = new HexMap();
      hexMaps.set(mapId, map);
    }
    return map;
  }

  export class Worker {
    constructor() {
      onmessage = (oEvent: MessageEvent) => {
        const order: Internal.IWorkerOrder = oEvent.data;

        const func = this[order.func];
        const result = func(order.data);
        const response: Internal.IWorkerResponse = {
          id: order.id,
          data: result,
        }

        postMessage(response);
      }
    }

    setTiles = (bundle: Internal.ISetTerrainBundle): void => {
      const map = ensureMap(bundle.mapId);
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
      const map = ensureMap(mapId);
      map.unsetLoadingMode();
      const drawables = rebuild(map);
      drawables.sort(sortFunc);

      return drawables;
    }

    getChecksum = (mapId: number): string => {
      const map = ensureMap(mapId);
      const drawables = this.rebuild(mapId);

      let checksum = 0;

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

  const sortFunc = (a: Internal.DrawableData, b: Internal.DrawableData) => {
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

  const sortFuncForChecksum = (a: Internal.DrawableData, b: Internal.DrawableData) => {
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

const worker = new WesnothTiles.Worker.Worker();

