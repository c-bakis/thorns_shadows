import MovableObject from "../core/movable-object.class.js";
import CharacterCombat from "./character-combat.class.js";
import CharacterAnimator from "./character-animator.class.js";
import CharacterMovement from "./character-movement.class.js";

export default class Character extends MovableObject {
  speed = 10;
  attackDamage = 5;
  comboInputWindowMs = 850;
  mana = 20;
  maxMana = 100;
  experience = 0;
  maxExperience = 100;

  SPRITE_ANIMATIONS = {
    WALK: {
      path: "img/character/wizard/Walk.png",
      frameWidth: 128,
      frameHeight: 128,
      frameCount: 7,
    },
    RUN: {
      path: "img/character/wizard/Run.png",
      frameWidth: 128,
      frameHeight: 128,
      frameCount: 8,
    },
    JUMP: {
      path: "img/character/wizard/Jump.png",
      frameWidth: 128,
      frameHeight: 128,
      frameCount: 11,
    },
    ATTACK_1: {
      path: "img/character/wizard/Attack_1.png",
      frameWidth: 128,
      frameHeight: 128,
      frameCount: 10,
    },
    ATTACK_2: {
      path: "img/character/wizard/Attack_2.png",
      frameWidth: 128,
      frameHeight: 128,
      frameCount: 4,
    },
    ATTACK_3: {
      path: "img/character/wizard/Attack_3.png",
      frameWidth: 128,
      frameHeight: 128,
      frameCount: 7,
    },
    HURT: {
      path: "img/character/wizard/Hurt.png",
      frameWidth: 128,
      frameHeight: 128,
      frameCount: 4,
    },
    DEAD: {
      path: "img/character/wizard/Dead.png",
      frameWidth: 128,
      frameHeight: 128,
      frameCount: 4,
    },
  };

  ATTACK_DAMAGE_WINDOWS = {
    ATTACK_1: { startFrame: 6, endFrame: 8 },
    ATTACK_2: { startFrame: 2, endFrame: 3 },
    ATTACK_3: { startFrame: 4, endFrame: 6 },
  };

  ATTACK_SEQUENCE = ["ATTACK_1", "ATTACK_2", "ATTACK_3"];

  MAGIC_ATTACK = {
    ATTACK_1: { startFrame: 6, endFrame: 8 }
  };

  MAGIC_ATTACK_SEQUENCE = ["ATTACK_1"];

  currentImg = 0;
  animationCounter = 0;
  activeAnimation = "WALK";
  deathAnimationFinished = false;
  wasMagicAttackPressed = false;
  wasAttackPressed = false;
  combat;
  animator;
  movement;

  constructor() {
    super();
    this.hitboxOffsetX = 55;
    this.hitboxOffsetY = 75;
    this.hitboxWidth = 32;
    this.hitboxHeight = 100;

    const animationPaths = Object.values(this.SPRITE_ANIMATIONS).map(
      (config) => config.path,
    );
    this.loadImages(animationPaths);
    this.combat = new CharacterCombat(this);
    this.animator = new CharacterAnimator(this);
    this.movement = new CharacterMovement(this);
    this.switchAnimation("WALK");

    this.animate();
    this.applyGravity();
  }

  // --- Main loop ---

  /**
   * Runs animate.
   * @returns {void}
   */
  animate() {
    this.movement.animate();
  }

  /**
   * Runs tick.
   * @returns {void}
   */
  tick() {
    this.movement.tick();
  }

  // --- Input handling ---

  /**
   * Handles input.
   * @param {number} now
   * @returns {void}
   */
  handleInput(now) {
    this.movement.handleInput(now);
  }

  /**
   * Checks whether this object is attack pressed now.
   * @returns {boolean}
   */
  isAttackPressedNow() {
    return this.movement.isAttackPressedNow();
  }

  /**
   * Checks whether this object is magic attack pressed now.
   * @returns {boolean}
   */
  isMagicAttackPressedNow() {
    return this.movement.isMagicAttackPressedNow();
  }

  /**
   * Handles movement input.
   * @returns {void}
   */
  handleMovementInput() {
    this.movement.handleMovementInput();
  }

  /**
   * Handles jump input.
   * @returns {void}
   */
  handleJumpInput() {
    this.movement.handleJumpInput();
  }

  /**
   * Handles fall input.
   * @returns {void}
   */
  handleFallInput() {
    this.movement.handleFallInput();
  }

  /**
   * Handles horizontal input.
   * @returns {void}
   */
  handleHorizontalInput() {
    this.movement.handleHorizontalInput();
  }

  /**
   * Runs move character.
   * @returns {void}
   */
  moveCharacter() {
    this.movement.moveCharacter();
  }

  /**
   * Runs increase mana.
   * @param {object} amount
   * @returns {void}
   */
  increaseMana(amount) {
    if (!Number.isFinite(amount)) {
      return this.mana;
    }

    this.mana = Math.min(this.maxMana, this.mana + amount);
    return this.mana;
  }

  /**
   * Runs gain experience.
   * @param {object} amount
   * @returns {void}
   */
  gainExperience(amount) {
  if (!Number.isFinite(amount)) {
    return this.experience;
  }

  this.experience = Math.min(this.maxExperience, this.experience + amount);
  const percentageExp = (this.experience / this.maxExperience) * 100;
  this.world?.statusBar?.setPercentage(percentageExp, "exp");
  return this.experience;
}

  // --- Animation state machine ---

  /**
   * Updates animation.
   * @param {boolean} isMovingHorizontally
   * @param {boolean} isAirborne
   * @param {boolean} isHurt
   * @param {number} now
   * @returns {void}
   */
  updateAnimation(isMovingHorizontally, isAirborne, isHurt, now) {
    this.animator.updateAnimation(isMovingHorizontally, isAirborne, isHurt, now);
  }

  /**
   * Plays hurt animation.
   * @returns {void}
   */
  playHurtAnimation() {
    this.animator.playHurtAnimation();
  }

  /**
   * Plays jump animation.
   * @returns {void}
   */
  playJumpAnimation() {
    this.animator.playJumpAnimation();
  }

  /**
   * Plays run animation.
   * @returns {void}
   */
  playRunAnimation() {
    this.animator.playRunAnimation();
  }

  /**
   * Plays idle animation.
   * @returns {void}
   */
  playIdleAnimation() {
    this.animator.playIdleAnimation();
  }

  /**
   * Plays dead animation.
   * @returns {void}
   */
  playDeadAnimation() {
    this.animator.playDeadAnimation();
  }

  // --- Sprite sheet advancement ---

  /**
   * Advances looping animation.
   * @param {number} speed
   * @returns {void}
   */
  advanceLoopingAnimation(speed) {
    this.animator.advanceLoopingAnimation(speed);
  }

  /**
   * Advances one shot animation.
   * @param {number} speed
   * @returns {void}
   */
  advanceOneShotAnimation(speed) {
    return this.animator.advanceOneShotAnimation(speed);
  }

  /**
   * Switches animation.
   * @param {string} name
   * @returns {void}
   */
  switchAnimation(name) {
    this.animator.switchAnimation(name);
  }

  /**
   * Runs draw.
   * @param {CanvasRenderingContext2D} ctx
   * @returns {void}
   */
  draw(ctx) {
    const now = Date.now();

    if (this.isHitFlashing && now > this.hitFlashEndAt) {
      this.isHitFlashing = false;
    }

    if (this.isHitFlashing) {
      ctx.save();
      ctx.filter = "brightness(1.8)";
    }

    super.draw(ctx);

    if (this.isHitFlashing) {
      ctx.restore();
    }
  }

  // --- Attack hit detection ---

  /**
   * Checks whether this object is in attack damage frame.
   * @returns {boolean}
   */
  isInAttackDamageFrame() {
    return this.combat.isInAttackDamageFrame();
  }

  /**
   * Checks whether this object can deal damage to enemy.
   * @param {object} enemy
   * @param {boolean} isAttackColliding
   * @returns {boolean}
   */
  canDealDamageToEnemy(enemy, isAttackColliding) {
    return this.combat.canDealDamageToEnemy(enemy, isAttackColliding);
  }

  /**
   * Runs register enemy hit.
   * @param {object} enemy
   * @returns {void}
   */
  registerEnemyHit(enemy) {
    this.combat.registerEnemyHit(enemy);
  }

  /**
   * Retrieves attack hitbox.
   * @returns {object|null}
   */
  getAttackHitbox() {
    const reachX = 40;
    const reachY = 20;
    const w = (this.hitboxWidth ?? this.width) + reachX;
    const h = (this.hitboxHeight ?? this.height) - reachY;
    const offsetX = this.otherDirection
      ? (this.hitboxOffsetX ?? 0) - reachX
      : this.hitboxOffsetX ?? 0;
    const offsetY = (this.hitboxOffsetY ?? 0) + reachY / 2;

    return {
      x: this.x + offsetX,
      y: this.y + offsetY,
      width: w,
      height: h,
    };
  }

  /**
   * Handles game over.
   * @returns {void}
   */
  handleGameOver() {
    this.world.handleGameOver();
  }

}

