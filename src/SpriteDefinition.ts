module WesnothTiles {
  'use strict';

  export interface IVector {
    x: number;
    y: number;
  }

  export interface IFrame {
    point: IVector;
    size: IVector;
  }
  // This class is responsible for storing sprite data.
  export class SpriteDefinition {

    constructor(public frame: IFrame, public spriteSource: IFrame, public sourceSize: IVector, public atlas: HTMLElement) {
    }
  }
} 
