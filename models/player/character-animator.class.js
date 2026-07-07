export default class CharacterAnimator {
  constructor(character) {
    this.character = character;
  }

  /**
   * Updates animation.
   * @param {boolean} isMovingHorizontally
   * @param {boolean} isAirborne
   * @param {boolean} isHurt
   * @param {number} now
   * @returns {void}
   */
  updateAnimation(isMovingHorizontally, isAirborne, isHurt, now) {
    if (this.character.energy <= 0) {
      this.character.combat.finishAttack();
      this.playDeadAnimation();
      return;
    }

    if (this.character.combat.isBusy()) {
      this.character.combat.playAttackAnimation(now);
      return;
    }

    if (isHurt) {
      this.playHurtAnimation();
      return;
    }

    if (isAirborne) {
      this.playJumpAnimation();
      return;
    }

    if (isMovingHorizontally) {
      this.playRunAnimation();
      return;
    }

    this.playIdleAnimation();
  }

  /**
   * Plays hurt animation.
   * @returns {void}
   */
  playHurtAnimation() {
    this.switchAnimation("HURT");
    this.advanceOneShotAnimation(10);
  }

  /**
   * Plays jump animation.
   * @returns {void}
   */
  playJumpAnimation() {
    this.switchAnimation("JUMP");
    this.advanceLoopingAnimation(8);
  }

  /**
   * Plays run animation.
   * @returns {void}
   */
  playRunAnimation() {
    this.switchAnimation("RUN");
    this.advanceLoopingAnimation(6);
  }

  /**
   * Plays idle animation.
   * @returns {void}
   */
  playIdleAnimation() {
    this.switchAnimation("WALK");
    this.character.stopAnimation();
  }

  /**
   * Plays dead animation.
   * @returns {void}
   */
  playDeadAnimation() {
    this.switchAnimation("DEAD");

    if (this.character.deathAnimationFinished) {
      this.character.spriteSheet.currentFrame =
        this.character.spriteSheet.frameCount - 1;
      return;
    }

    const finished = this.advanceOneShotAnimation(10);
    if (finished) {
      this.character.deathAnimationFinished = true;
      this.character.speedY = 0;
      this.character.handleGameOver();
    }
  }

  /**
   * Advances looping animation.
   * @param {number} speed
   * @returns {void}
   */
  advanceLoopingAnimation(speed) {
    if (!this.character.spriteSheet) {
      return;
    }

    this.character.animationCounter++;
    if (this.character.animationCounter % speed !== 0) {
      return;
    }

    this.character.spriteSheet.currentFrame =
      (this.character.spriteSheet.currentFrame + 1) %
      this.character.spriteSheet.frameCount;
  }

  /**
   * Advances one shot animation.
   * @param {number} speed
   * @returns {void}
   */
  advanceOneShotAnimation(speed) {
    if (!this.character.spriteSheet) {
      return false;
    }

    this.character.animationCounter++;
    if (this.character.animationCounter % speed !== 0) {
      return false;
    }

    const lastFrame = this.character.spriteSheet.frameCount - 1;
    if (this.character.spriteSheet.currentFrame < lastFrame) {
      this.character.spriteSheet.currentFrame++;
      return false;
    }

    return true;
  }

  /**
   * Switches animation.
   * @param {string} name
   * @returns {void}
   */
  switchAnimation(name) {
    if (this.character.activeAnimation === name && this.character.spriteSheet) {
      return;
    }

    const config = this.character.SPRITE_ANIMATIONS[name];
    if (!config) {
      return;
    }

    this.character.activeAnimation = name;
    this.character.animationCounter = 0;
    this.character.spriteSheet = {
      frameWidth: config.frameWidth,
      frameHeight: config.frameHeight,
      frameCount: config.frameCount,
      currentFrame: 0,
    };
    this.character.img = this.character.imgCache[config.path];

    if (!this.character.img) {
      this.character.loadImage(config.path);
    }
  }
}
