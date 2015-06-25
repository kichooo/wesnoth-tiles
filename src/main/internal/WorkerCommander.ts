module WesnothTiles.Internal {
  interface IDeferred {
    resolve: (Object) => void;
    reject: (string) => void;
  }

  'use strict';
  var id = 0;
  var deferreds = new Map <number, IDeferred>();
  var worker: Worker;

  export var loadWorker = () => {
    worker = new Worker("worker.js");

    worker.onmessage = (obj) => {
      var response: Internal.IWorkerResponse = obj.data;
      if (deferreds.has(response.id)) {
        deferreds.get(response.id).resolve(response.data);
        deferreds.delete(response.id);
      }
      
    }
  }

  export var sendCommand = (commandName: string, params?: Object): Promise<Object> => {          
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