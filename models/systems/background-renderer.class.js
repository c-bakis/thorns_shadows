export default class BackgroundRenderer {
    constructor(world) {
        this.world = world;
    }

    /**
     * Draws all.
     * @param {object[]} backgroundObjects
     * @returns {void}
     */
    drawAll(backgroundObjects) {
        this.addRepeatingBackgroundsToMap(backgroundObjects);
    }

        /**
         * Runs add repeating backgrounds to map.
         * @param {object[]} backgroundObjects
         * @returns {void}
         */
        addRepeatingBackgroundsToMap(backgroundObjects) {
    backgroundObjects.forEach((backgroundObject) => {
      this.addRepeatingBackgroundToMap(backgroundObject);
    });
  }

  /**
   * Retrieves repeated background config.
   * @param {object} backgroundObject
   * @returns {object|null}
   */
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

  /**
   * Draws repeated background tiles.
   * @param {object} backgroundObject
   * @param {object} config
   * @returns {void}
   */
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
        const snappedTileX = Math.round(tileX);
        const drawWidth = Math.ceil(backgroundObject.width) + 1;
        this.world.ctx.drawImage(
          backgroundObject.img,
          snappedTileX,
          drawY,
          drawWidth,
          drawHeight,
        );
      }
    }

    /**
     * Draws repeated background layer.
     * @param {object} backgroundObject
     * @returns {void}
     */
    drawRepeatedBackgroundLayer(backgroundObject) {
      const config = this.getRepeatedBackgroundConfig(backgroundObject);
      this.drawRepeatedBackgroundTiles(backgroundObject, config);
    }

  /**
   * Runs add repeating background to map.
   * @param {object} backgroundObject
   * @returns {void}
   */
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
