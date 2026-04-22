import MovableObject from "../core/movable-object.class.js";

export default class Enemy extends MovableObject {
  aggroRangeX = 280;
  attackRangeX = 90;
  attackRangeY = 800;
  attackCooldownMs = 800;
  lastAttackAt = 0;

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
}