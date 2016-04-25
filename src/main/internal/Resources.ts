module WesnothTiles.Internal {
  'use strict';

  // This file is responsible for the loading of the graphics.
  const atlases = new Map<string, HTMLElement>();
  export const definitions = new Map<string, SpriteDefinition>();


  const provideAtlas = (name: string): Promise<void> => {
    const img = new Image();
    const promises: Promise<void>[] = [];
    promises.push(new Promise<void>((resolve, reject) => {
      img.src = config.path + name + ".png";
      img.onload = () => {
        if (atlases.has(name)) {
          console.error("That atlas was already loaded!", name);
          return;
        }
        atlases.set(name, img);
        resolve();
      }
      img.onerror = () => {
        reject();
      };
    }));

    promises.push(new Promise((resolve, reject) => {
      const req = new XMLHttpRequest();
      req.open('GET', config.path + name + ".json", true);
      req.onreadystatechange = function(aEvt) {
        if (req.readyState == 4) {
          if (req.status == 200) {
            const frames: IFrames = JSON.parse(req.responseText);
            resolve(frames);
          }
          else
            reject();
        }
      };
      req.send(null);


    }).then((frames: IFrames) => {
      frames.frames.forEach((d: IDefinition) => {
        const def = new SpriteDefinition({
          point: { x: d.frame.x, y: d.frame.y },
          size: { x: d.frame.w, y: d.frame.h }
        }, {
            point: { x: d.spriteSourceSize.x, y: d.spriteSourceSize.y },
            size: { x: d.spriteSourceSize.w, y: d.spriteSourceSize.h }
          }, { x: d.sourceSize.w, y: d.sourceSize.h }, img);
        if (definitions.has(d.filename)) {
          console.error("Frame name already included!", def);
          return;
        }
        definitions.set(d.filename, def);
      });
    }));

    return Promise.all<void>(promises)
      .then(() => { });
  }

  export const loadResources = (): Promise<void> => {
    const promises: Promise<void>[] = [];
    for (let i = 0; i < 2; i++) {
      promises.push(provideAtlas("hexes_" + i));
    }

    return Promise.all(promises).then(() => {});
  }


  interface IFrames {
    frames: IDefinition[];
  }

  interface IDefinition {
    filename: string;
    rotated: boolean;
    trimmed: boolean;
    frame: IXYWH;
    spriteSourceSize: IXYWH;
    sourceSize: IWH;
    pivot: IXY;
  }

  interface IXYWH {
    x: number;
    y: number;
    w: number;
    h: number;
  }

  export interface IXY {
    x: number;
    y: number;
  }

  interface IWH {
    w: number;
    h: number;
  }




}