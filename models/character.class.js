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
    "img/character/wizard/Death1.png",
    "img/character/wizard/Death2.png",
    "img/character/wizard/Death3.png",
    "img/character/wizard/Death4.png",
  ];

  IMAGES_HURT = [
    "img/character/wizard/Hurt1.png",
    "img/character/wizard/Hurt2.png",
    "img/character/wizard/Hurt3.png",
    "img/character/wizard/Hurt4.png",
  ];

  currentImg = 0;
  animationCounter = 0;

  constructor() {
    super();
    this.loadImage("img/character/wizard/Walk1.png");
    this.loadImages(this.IMAGES_RUNNING);
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_JUMPING);

    this.animate();
    this.applyGravity();
  }

  animate() {
    setInterval(() => {
      if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
        this.moveCharacter();
        this.animationCounter++;
        if (this.animationCounter % 6 === 0) {
          this.playAnimation(this.IMAGES_RUNNING);
        }
      } else {
        this.animationCounter = 0;
        this.currentImg = 0;
        this.img.src = this.IMAGES_WALKING[0];
      }
    }, 1000 / 60);
  }

  playAnimation(images) {
    const i = this.currentImg % images.length;
    const path = images[i];
    this.img.src = path;
    this.currentImg++;
  }

  moveCharacter() {
    if (this.world.keyboard.RIGHT && this.x < this.world.level.levelEndX) {
      this.x += this.speed;
      this.otherDirection = false;
    }
    if (this.world.keyboard.LEFT && this.x >= 80 ) {
      this.x -= this.speed;
        this.otherDirection = true;
    }
  }
}
