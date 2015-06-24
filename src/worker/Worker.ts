// Worker. Meant to be run on another thread.

module WesnothTiles.Worker {
  'use strict';

  export class Worker {
    private spriteNames = new Set<string>();

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

    testCall = (jeb: number) => {
      jeb += 25;
      return jeb;
    }

    setTiles = (tileChanges: Internal.ITileChange[]) => {
      console.log("Setting tiles in worker");
    }

    init = (definitions: string[]) => {
      definitions.forEach(spriteName => this.spriteNames.add(spriteName));
    }

  }
}

var worker = new WesnothTiles.Worker.Worker();