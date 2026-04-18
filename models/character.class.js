import MovableObject from "./movable-object.class.js";

export default class Character extends MovableObject {
  speed = 10;

  IMAGES_WALKING = [
    "img/character/wizard/Walk1.png",
    "img/character/wizard/Walk2.png",
    "img/character/wizard/Walk3.png",
    "img/character/wizard/Walk4.png",
  ];

  IMAGES_RUNNING = [
    "img/character/wizard/Run1.png",
    "img/character/wizard/Run2.png",
    "img/character/wizard/Run3.png",
    "img/character/wizard/Run4.png",
  ];

  IMAGES_JUMPING = [
    "img/character/wizard/Jump1.png",
    "img/character/wizard/Jump1.png",
    "img/character/wizard/Jump2.png",
    "img/character/wizard/Jump2.png",
  ];

  IMAGES_DYING = [
    "img/character/wizard/dead1.png",
    "img/character/wizard/dead2.png",
    "img/character/wizard/dead3.png",
  ];

  IMAGES_HURT = [
    "img/character/wizard/Hurt1.png",
    "img/character/wizard/Hurt2.png",
    "img/character/wizard/Hurt3.png",
    "img/character/wizard/Hurt4.png",
  ];

  currentImg = 0;
  animationCounter = 0;
  deathFrameIndex = 0;
  deathAnimationCounter = 0;
  deathAnimationFinished = false;

  constructor() {
    super();
    this.loadImage("img/character/wizard/Walk1.png");
    this.loadImages(this.IMAGES_RUNNING);
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_JUMPING);
    this.loadImages(this.IMAGES_DYING);

    this.animate();
    this.applyGravity();
  }

  animate() {
    setInterval(() => {
      const isJumpPressed = this.world.keyboard.SPACE || this.world.keyboard.UP;
      const isMovingHorizontally = this.world.keyboard.RIGHT || this.world.keyboard.LEFT;
      const isAirborne = this.isAboveGround();

      this.getCharacterState(isMovingHorizontally, isJumpPressed, isAirborne);
      this.getAnimationState(isMovingHorizontally, isJumpPressed, isAirborne);

    }, 1000 / 60);
  }

  getCharacterState(isMovingHorizontally, isJumpPressed, isAirborne) {
      if (this.energy <= 0) {
        this.speedY = 0;
        return;
      }

      if (!isAirborne && isJumpPressed) {
        this.jump(25);
      }

      if (this.world.keyboard.DOWN && this.isAboveGround()) {
        this.jump(-25);
      }

      if (this.world.keyboard.DOWN && !this.isAboveGround()) {
          this.resetPositionY(320);
      }

      if (isMovingHorizontally) {
        this.moveCharacter();
      }
  }

  getAnimationState(isMovingHorizontally, isJumpPressed, isAirborne) {
      if (this.energy <= 0) {
        this.playDeathAnimationOnce(10);
      } else if (this.isAboveGround()) {
        this.initiateAnimation(10, this.IMAGES_JUMPING);
      } else if (isMovingHorizontally) {
        this.initiateAnimation(6, this.IMAGES_RUNNING);
      } else {
        this.stopAnimation();
      }
  }

  playDeathAnimationOnce(speed) {
    if (this.deathAnimationFinished) {
      this.img.src = this.IMAGES_DYING[this.IMAGES_DYING.length - 1];
      return;
    }

    this.deathAnimationCounter++;
    if (this.deathAnimationCounter % speed !== 0) {
      return;
    }

    this.img.src = this.IMAGES_DYING[this.deathFrameIndex];
    this.deathFrameIndex++;

    if (this.deathFrameIndex >= this.IMAGES_DYING.length) {
      this.deathAnimationFinished = true;
      this.speedY = 0;
    }
  }

  moveCharacter() {
    if (this.world.keyboard.RIGHT && this.x < this.world.level.levelEndX) {
      this.moveRight();
    }
    if (this.world.keyboard.LEFT && this.x >= 80 ) {
      this.moveLeft();
    }
  }

}