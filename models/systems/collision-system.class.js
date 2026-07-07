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

  /**
   * Retrieves object box.
   * @param {object} object
   * @returns {object}
   */
  getObjectBox(object) {
    return this.world.getObjectBox(object);
  }

    /**
     * Runs run.
     * @param {number} now
     * @returns {void}
     */
    run(now) {
        this.checkCollectableCollisions();
        this.checkEnemyCollisions(now);
        this.checkMagicAttackCollisions(now);
      this.cleanupDefeatedAndCollected(now);
    }

  /**
   * Runs check magic attack collisions.
   * @param {number} now
   * @returns {void}
   */
  checkMagicAttackCollisions(now) {
    for (const attack of this.magicAttacks) {
      if (this.shouldSkipMagicAttack(attack)) {
        continue;
      }

      this.checkSingleMagicAttack(attack, now);
    }
  }

  /**
   * Checks whether skip magic attack.
   * @param {object} attack
   * @returns {boolean}
   */
  shouldSkipMagicAttack(attack) {
    return !attack || attack.isConsumed;
  }

  /**
   * Runs check single magic attack.
   * @param {object} attack
   * @param {number} now
   * @returns {void}
   */
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

  /**
   * Checks whether skip magic target.
   * @param {object} attack
   * @param {object} enemy
   * @returns {boolean}
   */
  shouldSkipMagicTarget(attack, enemy) {
    return enemy?.isDefeated || !this.isCollidingAABB(attack, enemy);
  }

  /**
   * Applies magic attack damage.
   * @param {object} attack
   * @param {object} enemy
   * @param {number} now
   * @returns {void}
   */
  applyMagicAttackDamage(attack, enemy, now) {
    const damage = this.getMagicAttackDamage(attack);
    const sourceX = this.getAttackCenterX(attack);
    return typeof enemy?.takeDamage === "function"
      ? enemy.takeDamage(damage, now, sourceX)
      : false;
  }
  
  /**
   * Plays correct sfx.
   * @param {string} path
   * @param {object} maxDurationMs
   * @returns {void}
   */
  playCorrectSfx(path, { volume = 0.125, maxDurationMs = 800 } = {}) {
    this.character.world?.audioManager?.playSfx?.(
      path,
      { volume: volume }, { maxDurationMs: maxDurationMs }
    );
  }

  /**
   * Retrieves magic attack damage.
   * @param {object} attack
   * @returns {object|null}
   */
  getMagicAttackDamage(attack) {
    if (Number.isFinite(attack?.damage)) {
      return attack.damage;
    }

    if (Number.isFinite(attack?.attackDamage)) {
      return attack.attackDamage;
    }

    return 10;
  }

  /**
   * Retrieves attack center x.
   * @param {object} attack
   * @returns {object|null}
   */
  getAttackCenterX(attack) {
    const attackBox = this.getObjectBox(attack);
    return attackBox.x + attackBox.width / 2;
  }

  /**
   * Runs mark magic attack hit.
   * @param {object} attack
   * @param {object} enemy
   * @returns {void}
   */
  markMagicAttackHit(attack, enemy) {
    if ((enemy.energy ?? 0) <= 0) {
      this.markEnemyDefeated(enemy);
    }

    attack.isConsumed = true;
    this.playCorrectSfx(this.character.world?.audioManager?.fireHitSoundPath, { volume: 0.125, maxDurationMs: 800 });
  }

  /**
   * Runs check enemy collisions.
   * @param {number} now
   * @returns {void}
   */
  checkEnemyCollisions(now) {
    for (const enemy of this.enemies) {
      if (this.shouldSkipEnemyCollision(enemy)) {
        continue;
      }

      this.checkSingleEnemyCollision(enemy, now);
    }
  }

  /**
   * Checks whether skip enemy collision.
   * @param {object} enemy
   * @returns {boolean}
   */
  shouldSkipEnemyCollision(enemy) {
    return enemy?.isDefeated;
  }

  /**
   * Runs check single enemy collision.
   * @param {object} enemy
   * @param {number} now
   * @returns {void}
   */
  checkSingleEnemyCollision(enemy, now) {
    const isBodyColliding = this.isCharacterCollidingWithEnemy(enemy);
    const isAttackColliding = this.isCharacterAttackCollidingWithEnemy(
      enemy,
      isBodyColliding,
    );

    this.checkCharacterAttackOnEnemy(enemy, isAttackColliding, now);
    this.checkDamageOnCollision(enemy, isBodyColliding, now);
  }

  /**
   * Checks whether this object is character colliding with enemy.
   * @param {object} enemy
   * @returns {boolean}
   */
  isCharacterCollidingWithEnemy(enemy) {
    const hasCollisionMethod =
      typeof this.character?.isCollidingWith === "function";

    return hasCollisionMethod
      ? this.character.isCollidingWith(enemy)
      : this.isCollidingAABB(this.character, enemy);
  }

  /**
   * Checks whether this object is character attack colliding with enemy.
   * @param {object} enemy
   * @param {object} fallbackCollision
   * @returns {boolean}
   */
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

  /**
   * Runs mark enemy defeated.
   * @param {object} enemy
   * @param {object} options
   * @returns {boolean}
   */
  removeOrKeepEnemy(enemy) {
    if(typeof enemy?.shouldRemoveAfterDefeat === "function") {
      const shouldRemove = enemy.shouldRemoveAfterDefeat();
      if(shouldRemove) {
        this.notifyEnemyRemoved(enemy);
      }
      return !shouldRemove;
    }
    const shouldKeep = !enemy?.isDefeated;
    if(!shouldKeep) {
      this.notifyEnemyRemoved(enemy);
    }
    return shouldKeep;

  }

  /**
   * Cleans up defeated enemies and collected items.
   * @param {number} now
   */
  cleanupDefeatedAndCollected(now = Date.now()) {
    this.world.enemies = this.enemies.filter((enemy) => {
      return this.removeOrKeepEnemy(enemy);
    });
    this.world.collectables = this.collectables.filter(
      (collectable) => !collectable?.collected,
    );
  }

  /**
   * Runs notify enemy removed.
   * @param {object} enemy
   * @returns {void}
   */
  notifyEnemyRemoved(enemy) {
    if (typeof this.world?.handleEnemyRemoved === "function") {
      this.world.handleEnemyRemoved(enemy);
    }
  }

  /**
   * Runs check collectable collisions.
   * @returns {void}
   */
  checkCollectableCollisions() {
    this.collectables.forEach((collectable) => {
      if (!this.checkIfCharacterCanCollect(collectable)) {
        return;
      }

      collectable.onCollect(this.character);
      this.statusBar.setPercentage(this.character.mana, "mana");
      this.playCorrectSfx(this.character.world?.audioManager?.collectItemSoundPath, { volume: 0.25 });
    });
  }

  /**
   * Checks whether this object is character can collect.
   * @param {object} collectable 
   * @returns {boolean}
   */
  checkIfCharacterCanCollect(collectable) {
    if (!this.isCharacterCollidingWithCollectable(collectable)) {
      return false;
    }
    if (this.character.mana >= this.character.maxMana) {
      return false;
    }
    if (typeof collectable?.onCollect !== "function") {
      return false;
    }
    return true;
  }

  /**
   * Checks whether this object is character colliding with collectable.
   * @param {object} collectable
   * @returns {boolean}
   */
  isCharacterCollidingWithCollectable(collectable) {
    return this.isCollidingAABB(this.character, collectable);
  }

  /**
   * Applies damage to enemy.
   * @param {object} enemy
   * @param {object} damage
   * @param {number} now
   * @returns {void}
   */
  applyDamageToEnemy(enemy, damage, now) {

    const sourceX = this.character.x + this.character.width / 2;
    const didTakeDamage =
      typeof enemy?.takeDamage === "function"
        ? enemy.takeDamage(damage, now, sourceX)
        : false;
        return didTakeDamage;
  }

  /**
   * Plays enemy hit sfx.
   * @param {object} didTakeDamage
   * @returns {void}
   */
  playEnemyHitSfx(didTakeDamage) {
    if(didTakeDamage) {
      this.character.world?.audioManager?.playSfx?.(
        this.character.world?.audioManager?.landingHitSoundPath,
        { volume: 0.11 },
      );
    }
  }

  /**
   * Runs check character attack on enemy.
   * @param {object} enemy
   * @param {boolean} isColliding
   * @param {number} now
   * @returns {void}
   */
  checkCharacterAttackOnEnemy(enemy, isColliding, now) {
    const canAttack = this.checkIfCanDealDamageToEnemy(enemy, isColliding);
    if (!canAttack) return;

    const damage = Number.isFinite(this.character?.attackDamage) 
    ? this.character.attackDamage : 35;
    const didTakeDamage = this.applyDamageToEnemy(enemy, damage, now);

    this.playEnemyHitSfx(didTakeDamage);

    if (!didTakeDamage) return;

    this.character.registerEnemyHit(enemy);
    if ((enemy.energy ?? 0) <= 0) {
      this.markEnemyDefeated(enemy, { grantExperience: true });
    }
  }

  /**
   * Runs check if can deal damage to enemy.
   * @param {object} enemy 
   * @param {boolean} isColliding 
   * @returns {boolean}
   */
  checkIfCanDealDamageToEnemy(enemy, isColliding) {
    const canAttack =
      typeof this.character?.canDealDamageToEnemy === "function";
    if (!canAttack || !this.character.canDealDamageToEnemy(enemy, isColliding)) {
      return false;
    }
    return true;
  }

  /**
   * Runs mark enemy defeated.
   * @param {object} enemy
   * @param {object} options
   * @returns {void}
   */
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

  /**
   * Runs check damage on collision.
   * @param {object} enemy
   * @param {boolean} isColliding
   * @param {number} now
   * @returns {void}
   */
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
    this.playCorrectSfx(this.character.world?.audioManager?.getHurtSoundPath, 0.125);
  }

  /**
   * Applies collision damage to character.
   * @param {object} enemy
   * @param {number} now
   * @returns {void}
   */
  applyCollisionDamageToCharacter(enemy, now) {
    const damage = this.getEnemyCollisionDamage(enemy);
    const enemyCenterX = this.getEnemyCenterX(enemy);
    return this.character.takeDamage(damage, now, enemyCenterX);
  }

  /**
   * Retrieves enemy collision damage.
   * @param {object} enemy
   * @returns {object|null}
   */
  getEnemyCollisionDamage(enemy) {
    return Number.isFinite(enemy?.damage) ? enemy.damage : 10;
  }

  /**
   * Retrieves enemy center x.
   * @param {object} enemy
   * @returns {object|null}
   */
  getEnemyCenterX(enemy) {
    const enemyBox = this.getObjectBox(enemy);
    return enemyBox.x + enemyBox.width / 2;
  }

  /**
   * Updates character health ui.
   * @returns {void}
   */
  updateCharacterHealthUi() {
    this.statusBar.setPercentage(this.character.energy, "health");
  }
  
  /**
   * Checks whether this object is colliding aabb.
   * @param {object} a
   * @param {object} b
   * @returns {boolean}
   */
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

  /**
   * Checks whether this object is box colliding.
   * @param {object} a
   * @param {object} b
   * @returns {boolean}
   */
  isBoxColliding(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

}
