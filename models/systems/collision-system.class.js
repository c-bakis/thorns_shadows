export default class CollisionSystem {
    constructor(world) {
        this.world = world;
    }

  get enemies() {
    return this.world.enemies ?? [];
  }

  get collectables() {
    return this.world.collectables ?? [];
  }

  get character() {
    return this.world.character;
  }

  get statusBar() {
    return this.world.statusBar;
  }

  getObjectBox(object) {
    return this.world.getObjectBox(object);
  }

    run(now) {
        this.checkCollectableCollisions();
        this.checkEnemyCollisions(now);
        this.cleanupDefeatedAndCollected();
    }

  checkEnemyCollisions(now) {
    for (const enemy of this.enemies) {
      if (this.shouldSkipEnemyCollision(enemy)) {
        continue;
      }

      this.checkSingleEnemyCollision(enemy, now);
    }
  }

  shouldSkipEnemyCollision(enemy) {
    return enemy?.isDefeated;
  }

  checkSingleEnemyCollision(enemy, now) {
    const isBodyColliding = this.isCharacterCollidingWithEnemy(enemy);
    const isAttackColliding = this.isCharacterAttackCollidingWithEnemy(
      enemy,
      isBodyColliding,
    );

    this.checkCharacterAttackOnEnemy(enemy, isAttackColliding, now);
    this.checkDamageOnCollision(enemy, isBodyColliding, now);
  }

  isCharacterCollidingWithEnemy(enemy) {
    const hasCollisionMethod =
      typeof this.character?.isCollidingWith === "function";

    return hasCollisionMethod
      ? this.character.isCollidingWith(enemy)
      : this.isCollidingAABB(this.character, enemy);
  }

  isCharacterAttackCollidingWithEnemy(enemy, fallbackCollision) {
    const attackHitbox =
      typeof this.character?.getAttackHitbox === "function"
        ? this.character.getAttackHitbox()
        : null;

    if (!attackHitbox) {
      return fallbackCollision;
    }

    const enemyBox = this.getObjectBox(enemy);
    return this.isBoxColliding(attackHitbox, enemyBox);
  }

  cleanupDefeatedAndCollected() {
    this.world.enemies = this.enemies.filter((enemy) => !enemy?.isDefeated);
    this.world.collectables = this.collectables.filter(
      (collectable) => !collectable?.collected,
    );
  }

  checkCollectableCollisions() {
    this.collectables.forEach((collectable) => {
      if (!this.isCharacterCollidingWithCollectable(collectable)) {
        return;
      }

      if (typeof collectable?.onCollect !== "function") {
        return;
      }

      collectable.onCollect(this.character);
      this.statusBar.setPercentage(this.character.mana, "mana");
    });
  }

  isCharacterCollidingWithCollectable(collectable) {
    return this.isCollidingAABB(this.character, collectable);
  }

  checkCharacterAttackOnEnemy(enemy, isColliding, now) {
    const canAttack =
      typeof this.character?.canDealDamageToEnemy === "function";
    if (!canAttack || !this.character.canDealDamageToEnemy(enemy, isColliding)) {
      return;
    }

    const damage = Number.isFinite(this.character?.attackDamage)
      ? this.character.attackDamage
      : 35;
    const sourceX = this.character.x + this.character.width / 2;
    const didTakeDamage =
      typeof enemy?.takeDamage === "function"
        ? enemy.takeDamage(damage, now, sourceX)
        : false;

    if (!didTakeDamage) {
      return;
    }

    this.character.registerEnemyHit(enemy);
    if ((enemy.energy ?? 0) <= 0) {
      enemy.isDefeated = true;
    }
  }

  checkDamageOnCollision(enemy, isColliding, now) {
    if (!isColliding || enemy?.isDefeated) {
      return;
    }

    if (typeof enemy?.canDealDamage === "function" && !enemy.canDealDamage()) {
      return;
    }

    const damage = Number.isFinite(enemy?.damage) ? enemy.damage : 10;
    const enemyBox = this.getObjectBox(enemy);
    const enemyCenterX = enemyBox.x + enemyBox.width / 2;
    const didTakeDamage = this.character.takeDamage(damage, now, enemyCenterX);

    if (didTakeDamage) {
      this.statusBar.setPercentage(this.character.energy, "health");
    }
  }

  // Backward-compat wrapper (falls noch irgendwo der alte Name genutzt wird)
  checkDemageOnCollision(enemy, isColliding, now) {
    this.checkDamageOnCollision(enemy, isColliding, now);
  }
  
  isCollidingAABB(a, b) {
    const boxA = this.getObjectBox(a);
    const boxB = this.getObjectBox(b);

    return (
      boxA.x < boxB.x + boxB.width &&
      boxA.x + boxA.width > boxB.x &&
      boxA.y < boxB.y + boxB.height &&
      boxA.y + boxA.height > boxB.y
    );
  }


  isBoxColliding(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

}