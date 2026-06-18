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

  getCharacter() {
    return this.world?.character ?? null;
  }

  getCenterX(object = this) {
    return object.x + object.width / 2;
  }

  getCenterY(object = this) {
    return object.y + object.height / 2;
  }

  getDistanceToCharacter() {
    const character = this.getCharacter();
    if (!character) {
      return null;
    }

    const dx = Math.abs(this.getCenterX() - this.getCenterX(character));
    const dy = Math.abs(this.getCenterY() - this.getCenterY(character));
    return { dx, dy, character };
  }

  isCharacterNearby() {
    const dist = this.getDistanceToCharacter();
    if (!dist) {
      return false;
    }

    return dist.dx <= this.aggroRangeX && dist.dy <= this.attackRangeY;
  }

  isCharacterInAttackRange() {
    const dist = this.getDistanceToCharacter();
    if (!dist) {
      return false;
    }

    return dist.dx <= this.attackRangeX && dist.dy <= this.attackRangeY;
  }

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

  isDefeatedEnemy() {
    return this.isDefeated === true || this.energy <= 0;
  }

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

  handleDefeatAnimation(speed = 14) {
    if (!this.markDefeatedIfNeeded()) {
      return false;
    }

    this.speed = 0;

    if (this.getAnimationConfig("DEAD")) {
      this.switchAnimation("DEAD");
    }

    if (!this.spriteSheet || this.defeatAnimationFinished) {
      return true;
    }

    this.animationCounter++;
    if (this.animationCounter % speed !== 0) {
      return true;
    }

    const endFrame = Number.isFinite(this.spriteSheet.endFrame)
      ? this.spriteSheet.endFrame
      : this.spriteSheet.frameCount - 1;

    if (this.spriteSheet.currentFrame < endFrame) {
      this.spriteSheet.currentFrame++;
      return true;
    }

    this.defeatAnimationFinished = true;
    this.defeatAnimationFinishedAt = Date.now();
    this.spriteSheet.currentFrame = endFrame;
    return true;
  }

  shouldRemoveAfterDefeat(now = Date.now()) {
    if (!this.isDefeated || !this.defeatAnimationFinished) {
      return false;
    }

    if (!Number.isFinite(this.defeatAnimationFinishedAt)) {
      return false;
    }

    return now - this.defeatAnimationFinishedAt >= this.defeatCleanupDelayMs;
  }

  switchAnimation(name) {
    if (this.shouldKeepCurrentAnimation(name)) {
      return;
    }

    const config = this.getAnimationConfig(name);
    if (!config) {
      return;
    }

    this.prepareAnimationSwitch(name);
    this.spriteSheet = this.buildSpriteSheetConfig(config);
    this.img = this.imgCache[config.path];

    if (!this.img) {
      this.loadImage(config.path);
    }
  }

  shouldKeepCurrentAnimation(name) {
    return this.activeAnimation === name && this.spriteSheet;
  }

  getAnimationConfig(name) {
    return this.SPRITE_ANIMATIONS?.[name] ?? Enemy.DEFAULT_SPRITE_ANIMATIONS[name];
  }

  prepareAnimationSwitch(name) {
    this.activeAnimation = name;
    this.animationCounter = 0;
  }

  buildSpriteSheetConfig(config) {
    const frameRange = this.resolveFrameRange(config);
    const sheetFrameCount = this.resolveSheetFrameCount(config, frameRange.endFrame);
    const columns = this.resolveColumns(config, sheetFrameCount);

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
    };
  }

  resolveFrameRange(config) {
    const startFrame = Number.isFinite(config.startFrame) ? config.startFrame : 0;
    const endFrame = Number.isFinite(config.endFrame)
      ? config.endFrame
      : startFrame + config.frameCount - 1;

    return { startFrame, endFrame };
  }

  resolveSheetFrameCount(config, endFrame) {
    return Number.isFinite(config.sheetFrameCount)
      ? config.sheetFrameCount
      : endFrame + 1;
  }

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