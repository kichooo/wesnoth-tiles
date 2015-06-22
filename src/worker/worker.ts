// Worker. Meant to be run on another thread.

module WesnothTiles.Worker {
  'use strict';




}



    // var WorkerThread = (function () {
    //     function WorkerThread() {
    //     }
    //     return WorkerThread;
    // })();
    // self.onmessage = function (e) {
    //     console.log("client received message = " + e.data);
    //     var mc = new myClass.MyClass();
    //     console.log("worker thread toUpper = " + mc.toUpper("dave"));
    //     self.postMessage("from client");
    // };
    
onmessage = function (oEvent) {
  oEvent.data.jeb = 123
  postMessage(oEvent);
};