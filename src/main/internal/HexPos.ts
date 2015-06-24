// module WesnothTiles.Internal {
//   'use strict';

//   export interface IHexPos {
//     q: number;
//     r: number;
//   }


//   // Worth noting - we use Axial coordinate system from:
//   // http://www.redblobgames.com/grids/hexagons/
//   // (contrary to Wesnoth, which use offset system).
//   export class HexPos implements IHexPos {
//     str: string;
//     constructor(public q: number, public r: number) {
//       this.str = q + "," + r;
//     }

//     static toString(q: number, r: number) {
//       return q + "," + r;
//     }

//   }
// } 
