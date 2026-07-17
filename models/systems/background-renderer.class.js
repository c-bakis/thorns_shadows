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
      const { drawY, drawHeight } = this.getBackgroundDrawBounds(backgroundObject);
      const { startTileIndex, tilesToDraw } = this.getTileWindow(
        backgroundObject,
        tileWidth,
        parallaxCameraX,
      );

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
   * Returns vertical draw bounds for a repeated background layer.
   * @param {object} backgroundObject
   * @returns {{drawY: number, drawHeight: number}}
   */
  getBackgroundDrawBounds(backgroundObject) {
    const verticalPadding = this.world.getBackgroundVerticalPadding();
    return {
      drawY: backgroundObject.y - verticalPadding,
      drawHeight: backgroundObject.height + verticalPadding,
    };
  }

  /**
   * Resolves first visible tile index and tile count for the viewport.
   * @param {object} backgroundObject
   * @param {number} tileWidth
   * @param {number} parallaxCameraX
   * @returns {{startTileIndex: number, tilesToDraw: number}}
   */
  getTileWindow(backgroundObject, tileWidth, parallaxCameraX) {
    const cameraWorldX = -parallaxCameraX;
    const startTileIndex =
      Math.floor((cameraWorldX - backgroundObject.x) / tileWidth) - 1;
    const tilesToDraw = Math.ceil(this.world.canvas.width / tileWidth) + 3;
    return { startTileIndex, tilesToDraw };
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

    if (this.isLoadedImage(backgroundObject.img)) {
      this.drawRepeatedBackgroundLayer(backgroundObject);
      return;
    }

    this.queueBackgroundDrawOnLoad(backgroundObject);
  }

  /**
   * Returns true when an image is already available for drawing.
   * @param {HTMLImageElement} image
   * @returns {boolean}
   */
  isLoadedImage(image) {
    return image.complete && image.naturalWidth > 0;
  }

  /**
   * Queues one-time background draw callback after image load.
   * @param {object} backgroundObject
   * @returns {void}
   */
  queueBackgroundDrawOnLoad(backgroundObject) {
    backgroundObject.img.onload = () => {
      if (backgroundObject.img.naturalWidth > 0) {
        this.drawRepeatedBackgroundLayer(backgroundObject);
      }
    };
    backgroundObject.img.onerror = () =>
      console.error("Background image failed to load.");
  }
    }
