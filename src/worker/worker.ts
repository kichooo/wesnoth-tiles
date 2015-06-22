// Worker. Meant to be run on another thread.

module WesnothTiles.Worker {
  'use strict';


  export interface IWorkerOrder {
    // name of the function to execute.
    func: string; 
    // request id - unique for each call.
    id: number; 
    // additional parameters
    data?: Object; 
  }

  export interface IWorkerResponse {
    // request id - unique for each call - the same as in the WorkerOrder.
    id: number; 
    // response data.
    data?: Object;
    error?: string;
  }

  export interface ITileChange {
    q: number;
    r: number;
  }

  export class Worker {
    constructor() {
      onmessage = (oEvent: MessageEvent) => {
          var order: WesnothTiles.Worker.IWorkerOrder = oEvent.data;

          var func = this[order.func];          
          var result = func(order.data); 
          var response: IWorkerResponse = {
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

    setTiles = () => {

    }


  }
}

var worker = new WesnothTiles.Worker.Worker();