module WesnothTiles {
  'use strict';



  export class Renderer<HexType extends Hex> {
    private ctx: CanvasRenderingContext2D;
    private resources = new Resources();


    constructor(private canvas: HTMLCanvasElement) {
      this.ctx = this.canvas.getContext('2d');
    }

    redraw(hexMap: HexMap): void {
      console.log("Redraw.");
      this.ctx.beginPath();
      this.ctx.rect(0, this.canvas.height / 2 - 5, this.canvas.width, 10);
      this.ctx.fillStyle = 'yellow';
      this.ctx.fill();
      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = 'gray';
      this.ctx.stroke();

      var drawMap = drawTiles(hexMap);

      drawMap.forEach(hex => {
        hex.tiles.sort((a: ImageToDraw, b: ImageToDraw) => {
          return a.layer - b.layer;
        });
        for (var i = 0; i < hex.tiles.length; i++) {
          this.resources.drawSprite(hex.tiles[i].name, {
            x: hex.tiles[i].point.x + this.canvas.width / 2 + (36 * 1.5) * hex.q - 36,
            y: hex.tiles[i].point.y + this.canvas.height / 2 + 35 * (2 * hex.r + hex.q) - 36
          }, this.ctx);
        }
      });

      // hexMap.iterate((hex: Hex) => {
      //   this.pushTileImages(imagesToDraw, hexMap, hex);
      // });

      // var imagesToDraw: ImageToDraw[] = [];

      // hexMap.iterate((hex: Hex) => {
      //   this.pushTileImages(imagesToDraw, hexMap, hex);
      // });

      // imagesToDraw.sort((a: ImageToDraw, b: ImageToDraw) => {
      //   return a.layer - b.layer;
      // });
      // // this.resources.drawSprite("hills/regular.png", {x: 300, y: 336}, this.ctx);
      // for (var i = 0; i < imagesToDraw.length; i++) {
      //   this.resources.drawSprite(imagesToDraw[i].name, imagesToDraw[i].point, this.ctx);
      // }
    }

    private pushTileImages(images: ImageToDraw[], hexMap: HexMap, hex: Hex) {
      if (hex.terrain === ETerrain.HILLS_REGULAR) {
        images.push(new ImageToDraw("hills/regular.png", {
          x: this.canvas.width / 2 + (36 * 1.5) * hex.q - 36, 
          y: this.canvas.height / 2 + 35 * (2 * hex.r + hex.q) - 36
        }, -500));

        var bottom = hexMap.getHex(new HexPos(hex.q, hex.r + 1));
        if (bottom !== undefined && bottom.terrain !== ETerrain.HILLS_REGULAR) {
          images.push(new ImageToDraw("hills/regular-n.png", {
            x: this.canvas.width / 2 + (36 * 1.5) * bottom.q - 36, 
            y: this.canvas.height / 2 + 35 * (2 * bottom.r + bottom.q) - 36
          }, -180));
        }

        var north = hexMap.getHex(new HexPos(hex.q, hex.r - 1));
        if (north !== undefined && north.terrain !== ETerrain.HILLS_REGULAR) {
          images.push(new ImageToDraw("hills/regular-s.png", {
            x: this.canvas.width / 2 + (36 * 1.5) * north.q - 36, 
            y: this.canvas.height / 2 + 35 * (2 * north.r + north.q) - 36
          }, -180));
        }

        var sw = hexMap.getHex(new HexPos(hex.q - 1, hex.r +1));
        if (sw !== undefined && sw.terrain !== ETerrain.HILLS_REGULAR) {
          images.push(new ImageToDraw("hills/regular-ne.png", {
            x: this.canvas.width / 2 + (36 * 1.5) * sw.q - 36, 
            y: this.canvas.height / 2 + 35 * (2 * sw.r + sw.q) - 36
          }, -180));
        }

        var ne = hexMap.getHex(new HexPos(hex.q + 1, hex.r - 1));
        if (ne !== undefined && ne.terrain !== ETerrain.HILLS_REGULAR) {
          images.push(new ImageToDraw("hills/regular-sw.png", {
            x: this.canvas.width / 2 + (36 * 1.5) * ne.q - 36, 
            y: this.canvas.height / 2 + 35 * (2 * ne.r + ne.q) - 36
          }, -180));
        }

      }

      if (hex.terrain === ETerrain.HILLS_DRY) {
        images.push(new ImageToDraw("hills/dry.png", {
          x: this.canvas.width / 2 + (36 * 1.5) * hex.q - 36, 
          y: this.canvas.height / 2 + 35 * (2 * hex.r + hex.q) - 36
        }, -500));

        var bottom = hexMap.getHex(new HexPos(hex.q, hex.r + 1));
        if (bottom !== undefined && bottom.terrain === ETerrain.HILLS_DESERT) {
          images.push(new ImageToDraw("hills/dry-n.png", {
            x: this.canvas.width / 2 + (36 * 1.5) * bottom.q - 36, 
            y: this.canvas.height / 2 + 35 * (2 * bottom.r + bottom.q) - 36
          }, -183));
        }

        var north = hexMap.getHex(new HexPos(hex.q, hex.r - 1));
        if (north !== undefined && north.terrain === ETerrain.HILLS_REGULAR) {
          images.push(new ImageToDraw("hills/dry-s.png", {
            x: this.canvas.width / 2 + (36 * 1.5) * north.q - 36, 
            y: this.canvas.height / 2 + 35 * (2 * north.r + north.q) - 36
          }, -183));
        }

        var sw = hexMap.getHex(new HexPos(hex.q - 1, hex.r +1));
        if (sw !== undefined && sw.terrain === ETerrain.HILLS_DESERT) {
          images.push(new ImageToDraw("hills/dry-ne.png", {
            x: this.canvas.width / 2 + (36 * 1.5) * sw.q - 36, 
            y: this.canvas.height / 2 + 35 * (2 * sw.r + sw.q) - 36
          }, -183));
        }

        var ne = hexMap.getHex(new HexPos(hex.q + 1, hex.r - 1));
        if (ne !== undefined && ne.terrain === ETerrain.HILLS_REGULAR) {
          images.push(new ImageToDraw("hills/dry-sw.png", {
            x: this.canvas.width / 2 + (36 * 1.5) * ne.q - 36, 
            y: this.canvas.height / 2 + 35 * (2 * ne.r + ne.q) - 36
          }, -183));
        }
      }

      if (hex.terrain === ETerrain.HILLS_DESERT) {
        images.push(new ImageToDraw("hills/desert.png", {
          x: this.canvas.width / 2 + (36 * 1.5) * hex.q - 36, 
          y: this.canvas.height / 2 + 35 * (2 * hex.r + hex.q) - 36
        }, -500));

        var bottom = hexMap.getHex(new HexPos(hex.q, hex.r + 1));
        if (bottom !== undefined && bottom.terrain !== ETerrain.HILLS_DESERT) {
          images.push(new ImageToDraw("hills/desert-n.png", {
            x: this.canvas.width / 2 + (36 * 1.5) * bottom.q - 36, 
            y: this.canvas.height / 2 + 35 * (2 * bottom.r + bottom.q) - 36
          }, -184));
        }

        var north = hexMap.getHex(new HexPos(hex.q, hex.r - 1));
        if (north !== undefined && north.terrain !== ETerrain.HILLS_DESERT) {
          images.push(new ImageToDraw("hills/desert-s.png", {
            x: this.canvas.width / 2 + (36 * 1.5) * north.q - 36, 
            y: this.canvas.height / 2 + 35 * (2 * north.r + north.q) - 36
          }, -184));
        }

        var sw = hexMap.getHex(new HexPos(hex.q - 1, hex.r +1));
        if (sw !== undefined && sw.terrain !== ETerrain.HILLS_DESERT) {
          images.push(new ImageToDraw("hills/desert-ne.png", {
            x: this.canvas.width / 2 + (36 * 1.5) * sw.q - 36, 
            y: this.canvas.height / 2 + 35 * (2 * sw.r + sw.q) - 36
          }, -184));
        }

        var ne = hexMap.getHex(new HexPos(hex.q + 1, hex.r - 1));
        if (ne !== undefined && ne.terrain !== ETerrain.HILLS_DESERT) {
          images.push(new ImageToDraw("hills/desert-sw.png", {
            x: this.canvas.width / 2 + (36 * 1.5) * ne.q - 36, 
            y: this.canvas.height / 2 + 35 * (2 * ne.r + ne.q) - 36
          }, -184));
        }

      }
    }


    Resize(width: number, height: number): void {    
      this.canvas.width = width;
      this.canvas.height = height;
    }


    load(): Promise {
      return this.resources.loadResources();
    }

  }

  class ImageToDraw {
    constructor(public name: string, public point: IXY, public layer: number) {
    }
  };
} 
