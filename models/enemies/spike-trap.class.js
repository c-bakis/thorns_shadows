import Enemy from "./enemy.class.js";

export default class SpikeTrap extends Enemy {
  constructor(config = {}) {
    super();

    this.x = Number.isFinite(config.x) ? config.x : 0;
    this.y = Number.isFinite(config.y) ? config.y : 0;
    this.width = Number.isFinite(config.width) ? config.width : 64;
    this.height = Number.isFinite(config.height) ? config.height : 32;

    this.damage = Number.isFinite(config.damage) ? config.damage : 15;
    this.energy = Number.POSITIVE_INFINITY;
    this.experiencePoints = 0;
    this.speed = 0;
    this.aggroRangeX = 0;
    this.attackRangeX = 0;
    this.attackRangeY = 0;

    const hitbox = config.hitbox ?? {};
    this.hitboxOffsetX = Number.isFinite(hitbox.offsetX) ? hitbox.offsetX : 2;
    this.hitboxOffsetY = Number.isFinite(hitbox.offsetY) ? hitbox.offsetY : 10;
    this.hitboxWidth = Number.isFinite(hitbox.width) ? hitbox.width : Math.max(1, this.width - 4);
    this.hitboxHeight = Number.isFinite(hitbox.height) ? hitbox.height : Math.max(1, this.height - 12);
  }

  takeDamage() {
    return false;
  }
}