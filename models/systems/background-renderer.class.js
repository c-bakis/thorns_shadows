export default class BackgroundRenderer {
    constructor(world) {
        this.world = world;
    }

    drawAll(backgroundObjects) {
        this.addRepeatingBackgroundsToMap(backgroundObjects);
    }

        addRepeatingBackgroundsToMap(backgroundObjects) {
    backgroundObjects.forEach((backgroundObject) => {
      this.addRepeatingBackgroundToMap(backgroundObject);
    });
  }

  getRepeatedBackgroundConfig(backgroundObject) {
      const parallaxFactor = backgroundObject.parallaxFactor ?? 1;
      const parallaxCameraX = this.world.camera_x * parallaxFactor;
      const parallaxOffset = this.world.camera_x * (parallaxFactor - 1);
      const tileWidth = backgroundObject.width;
      const verticalPadding = this.world.getBackgroundVerticalPadding();
      const drawY = backgroundObject.y - verticalPadding;
      const drawHeight = backgroundObject.height + verticalPadding;
      const cameraWorldX = -parallaxCameraX;
      const startTileIndex =
        Math.floor((cameraWorldX - backgroundObject.x) / tileWidth) - 1;
      const tilesToDraw = Math.ceil(this.world.canvas.width / tileWidth) + 3;

      return {
        parallaxOffset,
        tileWidth,
        drawY,
        drawHeight,
        startTileIndex,
        tilesToDraw,
      };
  }

  drawRepeatedBackgroundTiles(backgroundObject, config) {
    const {
      parallaxOffset,
      tileWidth,
      drawY,
      drawHeight,
      startTileIndex,
      tilesToDraw,
    } = config;

      for (let i = 0; i < tilesToDraw; i++) {
        const tileX =
          backgroundObject.x +
          (startTileIndex + i) * tileWidth +
          parallaxOffset;
        this.world.ctx.drawImage(
          backgroundObject.img,
          tileX,
          drawY,
          backgroundObject.width,
          drawHeight,
        );
      }
    }

    drawRepeatedBackgroundLayer(backgroundObject) {
      const config = this.getRepeatedBackgroundConfig(backgroundObject);
      this.drawRepeatedBackgroundTiles(backgroundObject, config);
    }

  addRepeatingBackgroundToMap(backgroundObject) {
    if (!backgroundObject?.img) {
      return;
    }

    if (
      backgroundObject.img.complete &&
      backgroundObject.img.naturalWidth > 0
    ) {
      this.drawRepeatedBackgroundLayer(backgroundObject);
    } else {
      backgroundObject.img.onload = () => {
        if (backgroundObject.img.naturalWidth > 0) {
          this.drawRepeatedBackgroundLayer(backgroundObject);
        }
      };
      backgroundObject.img.onerror = () =>
        console.error("Background image failed to load.");
    }
  }
    }