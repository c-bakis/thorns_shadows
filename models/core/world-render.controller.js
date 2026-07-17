export default class WorldRenderController {
  constructor(world) {
    this.world = world;
  }

  /**
   * Handles draw.
   * @returns {void}
   */
  draw() {
    this.prepareFrame();
    this.drawWorldObjects();
    this.finalizeFrame();
  }

  /**
   * Clears frame and applies camera translation.
   * @returns {void}
   */
  prepareFrame() {
    this.world.ctx.clearRect(0, 0, this.world.ctx.canvas.width, this.world.ctx.canvas.height);
    this.world.updateBossIntro();
    this.world.updateCamera();
    this.world.ctx.translate(this.world.camera_x, this.world.camera_y);
  }

  /**
   * Draws world layers and runs gameplay updates.
   * @returns {void}
   */
  drawWorldObjects() {
    this.world.plattformGroundResolver.resolvePlatformGround();
    this.world.backgroundRenderer.drawAll(this.world.backgroundObjects);
    this.addObjToMap(this.world.tileset);
    this.addObjToMap(this.world.decorations);
    this.addObjToMap(this.world.collectables);

    if (!this.world.isGameplayFrozen()) {
      this.updateMagicAttacks();
    }
    this.addObjToMap(this.world.magicAttacks);

    this.addToMap(this.world.character);
    if (!this.world.isGameplayFrozen()) {
      this.updateEnemyPlatformLocks();
    }
    this.addObjToMap(this.world.enemies);

    if (!this.world.isGameplayFrozen()) {
      this.world.collisionSystem.run(Date.now());
    }
  }

  /**
   * Restores camera transform, draws UI and schedules next frame.
   * @returns {void}
   */
  finalizeFrame() {
    this.world.ctx.translate(-this.world.camera_x, -this.world.camera_y);
    this.world.statusBar.draw(this.world.ctx);
    if (this.world.pause) {
      return;
    }

    this.world.renderFrameId = requestAnimationFrame(() => this.draw());
  }

  /**
   * Handles update enemy platform locks.
   * @returns {void}
   */
  updateEnemyPlatformLocks() {
    this.world.enemies.forEach((enemy) => {
      if (typeof enemy.updatePlatformLock === "function") {
        enemy.updatePlatformLock(this.world.tileset);
      }
    });
  }

  /**
   * Handles retrieve background vertical padding.
   * @returns {number}
   */
  getBackgroundVerticalPadding() {
    return Math.max(0, this.world.cameraMaxUp);
  }

  /**
   * Handles update magic attacks.
   * @returns {void}
   */
  updateMagicAttacks() {
    this.world.magicAttacks = this.world.magicAttacks.filter((attack) => {
      if (!attack || attack.isConsumed) {
        return false;
      }

      if (typeof attack?.update === "function") {
        attack.update();
      }

      const levelEndX = this.world.level?.levelEndX ?? Infinity;
      const isOutOnRight = attack.x > levelEndX + 120;
      const isOutOnLeft = attack.x + attack.width < -120;
      return !isOutOnRight && !isOutOnLeft;
    });
  }

  /**
   * Handles add magic attack.
   * @param {object} attack
   * @returns {void}
   */
  addMagicAttack(attack) {
    if (!attack) {
      return;
    }

    this.world.magicAttacks.push(attack);
  }

  /**
   * Handles add obj to map.
   * @param {object[]} objects
   * @returns {void}
   */
  addObjToMap(objects) {
    objects.forEach((obj) => {
      this.addToMap(obj);
    });
  }

  /**
   * Handles add to map.
   * @param {object} drawableObject
   * @returns {void}
   */
  addToMap(drawableObject) {
    if (!drawableObject?.img) {
      return;
    }

    const isMirrored = this.mirrorObjectIfNeeded(drawableObject);
    if (this.isDrawableImageReady(drawableObject.img)) {
      this.drawDrawableObject(drawableObject);
    } else {
      this.queueDrawableObjectOnLoad(drawableObject);
    }

    if (isMirrored) {
      this.world.ctx.restore();
    }
  }

  /**
   * Returns true when an object image can be drawn immediately.
   * @param {HTMLImageElement} image
   * @returns {boolean}
   */
  isDrawableImageReady(image) {
    return image.complete && image.naturalWidth > 0;
  }

  /**
   * Draws an object and optional debug hitbox.
   * @param {object} drawableObject
   * @returns {void}
   */
  drawDrawableObject(drawableObject) {
    drawableObject.draw(this.world.ctx);
    if (typeof drawableObject.drawBoundingBox === "function") {
      drawableObject.drawBoundingBox(this.world.ctx);
    }
  }

  /**
   * Queues one-time fallback draw when image finishes loading.
   * @param {object} drawableObject
   * @returns {void}
   */
  queueDrawableObjectOnLoad(drawableObject) {
    drawableObject.img.onload = () => {
      if (drawableObject.img.naturalWidth > 0) {
        this.world.ctx.drawImage(
          drawableObject.img,
          drawableObject.x,
          drawableObject.y,
          drawableObject.width,
          drawableObject.height,
        );
      }
    };
    drawableObject.img.onerror = () =>
      console.error("Movable object image failed to load.");
  }

  /**
   * Handles mirror object if needed.
   * @param {object} movableObject
   * @returns {boolean}
   */
  mirrorObjectIfNeeded(movableObject) {
    if (!movableObject.otherDirection) {
      return false;
    }

    this.world.ctx.save();
    this.world.ctx.translate(movableObject.x + movableObject.width / 2, 0);
    this.world.ctx.scale(-1, 1);
    this.world.ctx.translate(-movableObject.x - movableObject.width / 2, 0);
    return true;
  }

  /**
   * Handles retrieve object box.
   * @param {object} object
   * @returns {object}
   */
  getObjectBox(object) {
    return typeof object?.getHitbox === "function"
      ? object.getHitbox()
      : {
          x: object.x,
          y: object.y,
          width: object.width,
          height: object.height,
        };
  }
}
