import MovableObject from "../core/movable-object.class.js";

export default class Enemy extends MovableObject {
  static DEFAULT_SPRITE_ANIMATIONS = {
    DEAD: {
      path: "img/enemies/dead.png",
      frameWidth: 90,
      frameHeight: 100,
      frameCount: 5,
      layout: "row",
    },
  };

  aggroRangeX = 280;
  attackRangeX = 90;
  attackRangeY = 800;
  attackCooldownMs = 800;
  lastAttackAt = 0;
  activeAnimation = null;
  animationCounter = 0;
  defeatAnimationFinished = false;
  defeatAnimationFinishedAt = null;
  defeatCleanupDelayMs = 250;

  SPRITE_ANIMATIONS = {
    ...Enemy.DEFAULT_SPRITE_ANIMATIONS,
  };

  /**
   * Retrieves character.
   * @returns {object|null}
   */
  getCharacter() {
    return this.world?.character ?? null;
  }

  /**
   * Retrieves center x.
   * @param {object} object
   * @returns {object|null}
   */
  getCenterX(object = this) {
    return object.x + object.width / 2;
  }

  /**
   * Retrieves center y.
   * @param {object} object
   * @returns {object|null}
   */
  getCenterY(object = this) {
    return object.y + object.height / 2;
  }

  /**
   * Retrieves distance to character.
   * @returns {object|null}
   */
  getDistanceToCharacter() {
    const character = this.getCharacter();
    if (!character) {
      return null;
    }

    const dx = Math.abs(this.getCenterX() - this.getCenterX(character));
    const dy = Math.abs(this.getCenterY() - this.getCenterY(character));
    return { dx, dy, character };
  }

  /**
   * Checks whether this object is character nearby.
   * @returns {boolean}
   */
  isCharacterNearby() {
    const dist = this.getDistanceToCharacter();
    if (!dist) {
      return false;
    }

    return dist.dx <= this.aggroRangeX && dist.dy <= this.attackRangeY;
  }

  /**
   * Checks whether this object is character in attack range.
   * @returns {boolean}
   */
  isCharacterInAttackRange() {
    const dist = this.getDistanceToCharacter();
    if (!dist) {
      return false;
    }

    return dist.dx <= this.attackRangeX && dist.dy <= this.attackRangeY;
  }

  /**
   * Runs face character.
   * @returns {void}
   */
  faceCharacter() {
    const character = this.getCharacter();
    if (!character) {
      return;
    }

    this.otherDirection = character.x < this.x;
  }

  canAttackCharacter(now = Date.now()) {
    return now - this.lastAttackAt >= this.attackCooldownMs;
  }

  markAttack(now = Date.now()) {
    this.lastAttackAt = now;
  }

  /**
   * Checks whether this object is defeated enemy.
   * @returns {boolean}
   */
  isDefeatedEnemy() {
    return this.isDefeated === true || this.energy <= 0;
  }

  /**
   * Runs mark defeated if needed.
   * @returns {void}
   */
  markDefeatedIfNeeded() {
    if (!this.isDefeatedEnemy()) {
      return false;
    }

    if (!this.isDefeated) {
      this.defeatAnimationFinished = false;
      this.defeatAnimationFinishedAt = null;
    }

    this.isDefeated = true;
    return true;
  }

  /**
   * Handles defeat animation.
   * @param {number} speed
   * @returns {void}
   */
  handleDefeatAnimation(speed = 14) {
    if (!this.markDefeatedIfNeeded()) {
      return false;
    }

    this.speed = 0;
    this.switchToDeadAnimationIfAvailable();

    if (this.shouldSkipDefeatFrameAdvance()) {
      return true;
    }

    if (!this.shouldAdvanceDefeatFrame(speed)) {
      return true;
    }

    if (this.tryAdvanceDefeatFrame()) {
      return true;
    }

    this.finishDefeatAnimation();
    return true;
  }

  shouldRemoveAfterDefeat(now = Date.now()) {
    if (!this.isReadyForDefeatCleanup()) {
      return false;
    }

    return this.hasDefeatCleanupDelayPassed(now);
  }

  /**
   * Runs draw.
   * @param {CanvasRenderingContext2D} ctx
   * @returns {void}
   */
  draw(ctx) {
    this.updateHitFlashState();
    this.applyHitFlashFilter(ctx);
    super.draw(ctx);
    this.restoreHitFlashFilter(ctx);
  }

  /**
   * Switches to dead animation if available.
   * @returns {void}
   */
  switchToDeadAnimationIfAvailable() {
    if (this.getAnimationConfig("DEAD")) {
      this.switchAnimation("DEAD");
    }
  }

  /**
   * Checks whether skip defeat frame advance.
   * @returns {boolean}
   */
  shouldSkipDefeatFrameAdvance() {
    return !this.spriteSheet || this.defeatAnimationFinished;
  }

  /**
   * Checks whether advance defeat frame.
   * @param {number} speed
   * @returns {boolean}
   */
  shouldAdvanceDefeatFrame(speed) {
    this.animationCounter++;
    return this.animationCounter % speed === 0;
  }

  /**
   * Runs try advance defeat frame.
   * @returns {void}
   */
  tryAdvanceDefeatFrame() {
    const endFrame = this.getCurrentAnimationEndFrame();
    if (this.spriteSheet.currentFrame >= endFrame) {
      return false;
    }

    this.spriteSheet.currentFrame++;
    return true;
  }

  /**
   * Finishes defeat animation.
   * @returns {void}
   */
  finishDefeatAnimation() {
    this.defeatAnimationFinished = true;
    this.defeatAnimationFinishedAt = Date.now();
    this.spriteSheet.currentFrame = this.getCurrentAnimationEndFrame();
  }

  /**
   * Retrieves current animation end frame.
   * @returns {object|null}
   */
  getCurrentAnimationEndFrame() {
    if (Number.isFinite(this.spriteSheet?.endFrame)) {
      return this.spriteSheet.endFrame;
    }

    return (this.spriteSheet?.frameCount ?? 1) - 1;
  }

  /**
   * Checks whether this object is ready for defeat cleanup.
   * @returns {boolean}
   */
  isReadyForDefeatCleanup() {
    return (
      this.isDefeated &&
      this.defeatAnimationFinished &&
      Number.isFinite(this.defeatAnimationFinishedAt)
    );
  }

  hasDefeatCleanupDelayPassed(now = Date.now()) {
    return now - this.defeatAnimationFinishedAt >= this.defeatCleanupDelayMs;
  }

  updateHitFlashState(now = Date.now()) {
    if (this.isHitFlashing && now > this.hitFlashEndAt) {
      this.isHitFlashing = false;
    }
  }

  /**
   * Applies hit flash filter.
   * @param {CanvasRenderingContext2D} ctx
   * @returns {void}
   */
  applyHitFlashFilter(ctx) {
    if (!this.isHitFlashing) {
      return;
    }

    ctx.save();
    ctx.filter = "brightness(1.8)";
  }

  /**
   * Runs restore hit flash filter.
   * @param {CanvasRenderingContext2D} ctx
   * @returns {void}
   */
  restoreHitFlashFilter(ctx) {
    if (this.isHitFlashing) {
      ctx.restore();
    }
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
    this.spriteSheet = this.buildSpriteSheetConfig(config);
  }

  /**
   * Runs ensure animation image.
   * @param {string} path
   * @returns {void}
   */
  ensureAnimationImage(path) {
    this.img = this.imgCache[path];
    if (!this.img) {
      this.loadImage(path);
    }
  }

  /**
   * Checks whether this object is animation already active.
   * @param {string} name
   * @returns {boolean}
   */
  isAnimationAlreadyActive(name) {
    return this.activeAnimation === name && this.spriteSheet;
  }

  /**
   * Retrieves animation config.
   * @param {string} name
   * @returns {object|null}
   */
  getAnimationConfig(name) {
    return this.SPRITE_ANIMATIONS?.[name] ?? Enemy.DEFAULT_SPRITE_ANIMATIONS[name];
  }

  /**
   * Runs prepare animation switch.
   * @param {string} name
   * @returns {void}
   */
  prepareAnimationSwitch(name) {
    this.activeAnimation = name;
    this.animationCounter = 0;
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
