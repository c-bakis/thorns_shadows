import MovableObject from "../core/movable-object.class.js";

export default class MagicAttack extends MovableObject {

  speed = 6;
  attackDamage = 5;

  SPRITE_ANIMATION = {
    frameCount: 8,
    frameWidth: 100,
    frameHeight: 100,
    columns: 8,
  };

  currentImg = 0;
  animationCounter = 0;
  isConsumed = false;

  RIGHT_HAND_SPAWN_X_RATIO = 0.60;
  LEFT_HAND_SPAWN_X_RATIO = 0.34;
  HAND_SPAWN_Y_RATIO = 0.82;

  constructor(character) {
    super();
    this.world = character?.world;
    this.loadImage("img/character/wizard/fire_magic.png");
    this.width = 120;
    this.height = 100;
    this.speed = 4;
    this.damage = 10;
    this.hitboxOffsetX = 18;
    this.hitboxOffsetY = 25;
    this.hitboxWidth = 84;
    this.hitboxHeight = 40;
    this.spriteSheet = {
      frameWidth: this.SPRITE_ANIMATION.frameWidth,
      frameHeight: this.SPRITE_ANIMATION.frameHeight,
      frameCount: this.SPRITE_ANIMATION.frameCount,
      columns: this.SPRITE_ANIMATION.columns,
      currentFrame: 0,
    };

    const spawnPosition = this.getSpawnPosition(character);
    this.x = spawnPosition.x;
    this.y = spawnPosition.y;
    this.otherDirection = character.otherDirection;
  }

  /**
   * Calculates spawn coordinates near the character's casting hand.
   * @param {object} character
   * @returns {{x: number, y: number}}
   */
  getSpawnPosition(character) {
    const spawnAnchorX = character.otherDirection
      ? character.x + character.width * this.LEFT_HAND_SPAWN_X_RATIO
      : character.x + character.width * this.RIGHT_HAND_SPAWN_X_RATIO;
    const spawnAnchorY = character.y + character.height * this.HAND_SPAWN_Y_RATIO;

    return {
      x: character.otherDirection ? spawnAnchorX - this.width * 0.75 : spawnAnchorX,
      y: spawnAnchorY - this.height / 2,
    };
  }

  /**
   * Runs update.
   * @returns {void}
   */
  update() {
    this.x += this.otherDirection ? -this.speed : this.speed;
    this.animationCounter++;
    if (this.animationCounter % 3 === 0 && this.spriteSheet) {
      this.spriteSheet.currentFrame =
        (this.spriteSheet.currentFrame + 1) % this.spriteSheet.frameCount;
    }
  }
}
