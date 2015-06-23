// Worker. Meant to be run on another thread.

module WesnothTiles.Internal {
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
}