module WesnothTiles.Internal {
  interface IDeferred {
    resolve: (Object) => void;
    reject: (string) => void;
  }

  'use strict';
  let id = 0;
  let worker: Worker;
  const deferreds = new Map<number, IDeferred>();

  export const loadWorker = () => {
    const blob = new Blob([workerString], {type: 'application/javascript'});

    worker = new Worker(URL.createObjectURL(blob));    


    worker.onmessage = (obj) => {
      const response: Internal.IWorkerResponse = obj.data;
      if (deferreds.has(response.id)) {
        deferreds.get(response.id).resolve(response.data);
        deferreds.delete(response.id);
      }

    }
  }

  export const sendCommand = <T>(commandName: string, params?: Object): Promise<T> => {
    return new Promise<Object>((resolve, reject) => {
      deferreds.set(id, {
        resolve: resolve,
        reject: reject
      });
      worker.postMessage({
        id: id,
        func: commandName,
        data: params
      });
      id++;
    });
  }
}