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

  get magicAttacks() {
    return this.world.magicAttacks ?? [];
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
        this.checkMagicAttackCollisions(now);
      this.cleanupDefeatedAndCollected(now);
    }

  checkMagicAttackCollisions(now) {
    for (const attack of this.magicAttacks) {
      if (this.shouldSkipMagicAttack(attack)) {
        continue;
      }

      this.checkSingleMagicAttack(attack, now);
    }
  }

  shouldSkipMagicAttack(attack) {
    return !attack || attack.isConsumed;
  }

  checkSingleMagicAttack(attack, now) {
    for (const enemy of this.enemies) {
      if (this.shouldSkipMagicTarget(attack, enemy)) {
        continue;
      }

      const didTakeDamage = this.applyMagicAttackDamage(attack, enemy, now);
      if (!didTakeDamage) {
        continue;
      }

      this.markMagicAttackHit(attack, enemy);
      break;
    }
  }

  shouldSkipMagicTarget(attack, enemy) {
    return enemy?.isDefeated || !this.isCollidingAABB(attack, enemy);
  }

  applyMagicAttackDamage(attack, enemy, now) {
    const damage = this.getMagicAttackDamage(attack);
    const sourceX = this.getAttackCenterX(attack);
    return typeof enemy?.takeDamage === "function"
      ? enemy.takeDamage(damage, now, sourceX)
      : false;
  }

  getMagicAttackDamage(attack) {
    if (Number.isFinite(attack?.damage)) {
      return attack.damage;
    }

    if (Number.isFinite(attack?.attackDamage)) {
      return attack.attackDamage;
    }

    return 10;
  }

  getAttackCenterX(attack) {
    const attackBox = this.getObjectBox(attack);
    return attackBox.x + attackBox.width / 2;
  }

  markMagicAttackHit(attack, enemy) {
    if ((enemy.energy ?? 0) <= 0) {
      this.markEnemyDefeated(enemy);
    }

    attack.isConsumed = true;
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

  cleanupDefeatedAndCollected(now = Date.now()) {
    this.world.enemies = this.enemies.filter((enemy) => {
      if (typeof enemy?.shouldRemoveAfterDefeat === "function") {
        const shouldRemove = enemy.shouldRemoveAfterDefeat(now);
        if (shouldRemove) {
          this.notifyEnemyRemoved(enemy);
        }

        return !shouldRemove;
      }

      const shouldKeep = !enemy?.isDefeated;
      if (!shouldKeep) {
        this.notifyEnemyRemoved(enemy);
      }

      return shouldKeep;
    });
    this.world.collectables = this.collectables.filter(
      (collectable) => !collectable?.collected,
    );
  }

  notifyEnemyRemoved(enemy) {
    if (typeof this.world?.handleEnemyRemoved === "function") {
      this.world.handleEnemyRemoved(enemy);
    }
  }

  checkCollectableCollisions() {
    this.collectables.forEach((collectable) => {
      if (!this.isCharacterCollidingWithCollectable(collectable)) {
        return;
      }

      if (this.character.mana >= this.character.maxMana) {
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

  applyDamageToEnemy(enemy, damage, now) {

    const sourceX = this.character.x + this.character.width / 2;
    const didTakeDamage =
      typeof enemy?.takeDamage === "function"
        ? enemy.takeDamage(damage, now, sourceX)
        : false;
        return didTakeDamage;
  }

  playEnemyHitSfx(didTakeDamage) {
    if(didTakeDamage) {
      this.character.world?.audioManager?.playSfx?.(
        this.character.world?.audioManager?.landingHitSoundPath,
        { volume: 0.11 },
      );
    }
  }

  checkCharacterAttackOnEnemy(enemy, isColliding, now) {
    const canAttack =
      typeof this.character?.canDealDamageToEnemy === "function";
    if (!canAttack || !this.character.canDealDamageToEnemy(enemy, isColliding)) {
      return;
    }
    const damage = Number.isFinite(this.character?.attackDamage) 
    ? this.character.attackDamage : 35;
    const didTakeDamage = this.applyDamageToEnemy(enemy, damage, now);

    this.playEnemyHitSfx(didTakeDamage);

    if (!didTakeDamage) {
      return;
    }

    this.character.registerEnemyHit(enemy);
    if ((enemy.energy ?? 0) <= 0) {
      this.markEnemyDefeated(enemy, { grantExperience: true });
    }
  }

  markEnemyDefeated(enemy, options = {}) {
    if (!enemy || enemy.isDefeated) return;

    enemy.isDefeated = true;

    if (options.grantExperience) {
      const experiencePoints = Number.isFinite(enemy.experiencePoints)
        ? enemy.experiencePoints
        : 0;
      this.character.gainExperience(experiencePoints);
    }

    if (typeof this.world?.handleEnemyDefeat === "function") {
      this.world.handleEnemyDefeat(enemy);
    }
  }

  checkDamageOnCollision(enemy, isColliding, now) {
    if (!isColliding || enemy?.isDefeated) {
      return;
    }

    if (typeof enemy?.canDealDamage === "function" && !enemy.canDealDamage()) {
      return;
    }

    const didTakeDamage = this.applyCollisionDamageToCharacter(enemy, now);
    if (!didTakeDamage) {
      return;
    }

    this.updateCharacterHealthUi();
    this.playCharacterHurtSfx();
  }

  applyCollisionDamageToCharacter(enemy, now) {
    const damage = this.getEnemyCollisionDamage(enemy);
    const enemyCenterX = this.getEnemyCenterX(enemy);
    return this.character.takeDamage(damage, now, enemyCenterX);
  }

  getEnemyCollisionDamage(enemy) {
    return Number.isFinite(enemy?.damage) ? enemy.damage : 10;
  }

  getEnemyCenterX(enemy) {
    const enemyBox = this.getObjectBox(enemy);
    return enemyBox.x + enemyBox.width / 2;
  }

  updateCharacterHealthUi() {
    this.statusBar.setPercentage(this.character.energy, "health");
  }

  playCharacterHurtSfx() {
    this.character.world?.audioManager?.playSfx?.(
      this.character.world?.audioManager?.getHurtSoundPath,
      { volume: 0.125 },
    );
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