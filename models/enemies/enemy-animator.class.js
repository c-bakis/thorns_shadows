export default class EnemyAnimator {
    constructor(enemy) {
        this.enemy = enemy;
    }

  /**
   * Switches animation.
   * @param {string} name
   * @returns {void}
   */
  switchAnimation(name) {
    if (this.shouldSkipAnimationSwitch(name)) {
      return;
    }

    const config = this.getAnimationConfig(name);
    if (!config) {
      return;
    }

    this.applyAnimationConfig(name, config);
    this.ensureAnimationImage(config.path);
  }

  /**
   * Checks whether skip animation switch.
   * @param {string} name
   * @returns {boolean}
   */
  shouldSkipAnimationSwitch(name) {
    return this.isAnimationAlreadyActive(name);
  }

  /**
   * Applies animation config.
   * @param {string} name
   * @param {object} config
   * @returns {void}
   */
  applyAnimationConfig(name, config) {
    this.prepareAnimationSwitch(name);
    this.enemy.spriteSheet = this.buildSpriteSheetConfig(config);
  }

  /**
   * Runs ensure animation image.
   * @param {string} path
   * @returns {void}
   */
  ensureAnimationImage(path) {
    this.enemy.img = this.enemy.imgCache[path];
    if (!this.enemy.img) {
      this.enemy.loadImage(path);
    }
  }

  /**
   * Checks whether this object is animation already active.
   * @param {string} name
   * @returns {boolean}
   */
  isAnimationAlreadyActive(name) {
    return this.enemy.activeAnimation === name && this.enemy.spriteSheet;
  }

  /**
   * Retrieves animation config.
   * @param {string} name
   * @returns {object|null}
   */
  getAnimationConfig(name) {
    return this.enemy.SPRITE_ANIMATIONS?.[name]
      ?? this.enemy.constructor?.DEFAULT_SPRITE_ANIMATIONS?.[name]
      ?? null;
  }

  /**
   * Runs prepare animation switch.
   * @param {string} name
   * @returns {void}
   */
  prepareAnimationSwitch(name) {
    this.enemy.activeAnimation = name;
    this.enemy.animationCounter = 0;
  }

  /**
   * Runs build sprite sheet config.
   * @param {object} config
   * @returns {object|null}
   */
  buildSpriteSheetConfig(config) {
    const frameRange = this.resolveFrameRange(config);
    const sheetFrameCount = this.resolveSheetFrameCount(config, frameRange.endFrame);
    const columns = this.resolveColumns(config, sheetFrameCount);

    return this.createSpriteSheet(config, frameRange, sheetFrameCount, columns);
  }

  /**
   * Creates sprite sheet.
   * @param {object} config
   * @param {object} frameRange
   * @param {object} sheetFrameCount
   * @param {object} columns
   * @returns {object|null}
   */
  createSpriteSheet(config, frameRange, sheetFrameCount, columns) {
    return {
      frameWidth: config.frameWidth,
      frameHeight: config.frameHeight,
      frameCount: sheetFrameCount,
      columns,
      sourceY: config.sourceY,
      startRow: config.startRow ?? 0,
      layout: config.layout ?? "row",
      startFrame: frameRange.startFrame,
      endFrame: frameRange.endFrame,
      currentFrame: frameRange.startFrame,
      speed: config.speed,
    };
  }

  /**
   * Runs resolve frame range.
   * @param {object} config
   * @returns {object|null}
   */
  resolveFrameRange(config) {
    const startFrame = Number.isFinite(config.startFrame) ? config.startFrame : 0;
    const endFrame = Number.isFinite(config.endFrame)
      ? config.endFrame
      : startFrame + config.frameCount - 1;

    return { startFrame, endFrame };
  }

  /**
   * Runs resolve sheet frame count.
   * @param {object} config
   * @param {number} endFrame
   * @returns {object|null}
   */
  resolveSheetFrameCount(config, endFrame) {
    return Number.isFinite(config.sheetFrameCount)
      ? config.sheetFrameCount
      : endFrame + 1;
  }

  /**
   * Runs resolve columns.
   * @param {object} config
   * @param {object} sheetFrameCount
   * @returns {object|null}
   */
  resolveColumns(config, sheetFrameCount) {
    if (Number.isFinite(config.columns)) {
      return config.columns;
    }

    if (Number.isFinite(config.sourceY)) {
      return sheetFrameCount;
    }

    return 1;
  }

}