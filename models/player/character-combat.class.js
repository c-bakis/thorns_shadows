import MagicAttack from "./magig-attack.class.js";

export default class CharacterCombat {
  attackActive = false;
  magicAttackActive = false;
  pendingMagicProjectile = false;
  currentAttackName = null;
  queuedAttackName = null;
  comboExpiresAt = 0;
  hitEnemiesThisAttack = new Set();

  constructor(character) {
    this.character = character;
  }

  /**
   * Checks whether this object is busy.
   * @returns {boolean}
   */
  isBusy() {
    return this.attackActive || this.magicAttackActive;
  }

  /**
   * Handles attack input.
   * @param {number} now
   * @returns {void}
   */
  handleAttackInput(now) {
    if (this.character.energy <= 0) {
      return;
    }

    if (!this.attackActive) {
      this.startAttack("ATTACK_1", now);
      return;
    }

    if (now <= this.comboExpiresAt) {
      this.queueNextComboAttack();
    }
  }

  /**
   * Runs queue next combo attack.
   * @returns {void}
   */
  queueNextComboAttack() {
    const nextAttackName = this.getNextAttackName(this.currentAttackName);
    if (nextAttackName) {
      this.queuedAttackName = nextAttackName;
    }
  }

  /**
   * Retrieves next attack name.
   * @param {string} attackName
   * @returns {object|null}
   */
  getNextAttackName(attackName) {
    const index = this.character.ATTACK_SEQUENCE.indexOf(attackName);
    const hasNext =
      index !== -1 && index < this.character.ATTACK_SEQUENCE.length - 1;
    return hasNext ? this.character.ATTACK_SEQUENCE[index + 1] : null;
  }

  /**
   * Starts attack.
   * @param {string} attackName
   * @param {number} now
   * @returns {void}
   */
  startAttack(attackName, now) {
    this.character.world?.audioManager?.playSfx?.(
      this.character.world?.audioManager?.attackSoundPath,
      { volume: 0.4, maxDurationMs: 650 },
    );
    this.attackActive = true;
    this.currentAttackName = attackName;
    this.queuedAttackName = null;
    this.comboExpiresAt = now + this.character.comboInputWindowMs;
    this.hitEnemiesThisAttack.clear();
    this.character.activeAnimation = null;
    this.character.animationCounter = 0;
    this.character.switchAnimation(attackName);
  }

  /**
   * Finishes attack.
   * @returns {void}
   */
  finishAttack() {
    this.attackActive = false;
    this.magicAttackActive = false;
    this.pendingMagicProjectile = false;
    this.currentAttackName = null;
    this.queuedAttackName = null;
    this.comboExpiresAt = 0;
    this.hitEnemiesThisAttack.clear();
  }

  /**
   * Handles magic attack input.
   * @param {number} now
   * @returns {void}
   */
  handleMagicAttackInput(now) {
    if (this.character.energy <= 0 || this.character.mana < 20) {
      return;
    }

    if (this.attackActive || this.magicAttackActive) {
      return;
    }

    this.startMagicAttack("ATTACK_2", now);
  }

  /**
   * Starts magic attack.
   * @param {string} attackName
   * @param {number} now
   * @returns {void}
   */
  startMagicAttack(attackName, now)  {
    this.character.world?.audioManager?.playSfx?.(
      this.character.world?.audioManager?.fireMagicSoundPath,
      { volume: 0.125 }, { maxDurationMs: 800 }
    );
    this.magicAttackActive = true;
    this.pendingMagicProjectile = true;
    this.currentAttackName = attackName;
    this.queuedAttackName = null;
    this.comboExpiresAt = now + this.character.comboInputWindowMs;
    this.hitEnemiesThisAttack.clear();
    this.character.activeAnimation = null;
    this.character.animationCounter = 0;
    this.character.switchAnimation(attackName);
  }

  /**
   * Plays attack animation.
   * @param {number} now
   * @returns {void}
   */
  playAttackAnimation(now) {
    this.character.switchAnimation(this.currentAttackName);
    const finished = this.character.advanceOneShotAnimation(5);
    if (!finished) {
      return;
    }

    if (this.magicAttackActive) {
      this.releaseMagicProjectile();
      this.finishAttack();
      return;
    }

    if (this.queuedAttackName && now <= this.comboExpiresAt) {
      this.startAttack(this.queuedAttackName, now);
    } else {
      this.finishAttack();
    }
  }

  /**
   * Runs release magic projectile.
   * @returns {void}
   */
  releaseMagicProjectile() {
    if (!this.pendingMagicProjectile || !this.character.world) {
      return;
    }

    const magicAttack = new MagicAttack(this.character);
    this.character.world.addMagicAttack(magicAttack);
    this.character.mana -= 20;
    this.character.world?.statusBar?.setPercentage(this.character.mana, "mana");
    this.pendingMagicProjectile = false;
  }

  /**
   * Checks whether this object is in attack damage frame.
   * @returns {boolean}
   */
  isInAttackDamageFrame() {
    if (!this.attackActive || !this.currentAttackName || !this.character.spriteSheet) {
      return false;
    }

    const window = this.character.ATTACK_DAMAGE_WINDOWS[this.currentAttackName];
    if (!window) {
      return false;
    }

    const frameNumber = (this.character.spriteSheet.currentFrame ?? 0) + 1;
    return frameNumber >= window.startFrame && frameNumber <= window.endFrame;
  }

  /**
   * Checks whether this object can deal damage to enemy.
   * @param {object} enemy
   * @param {boolean} isAttackColliding
   * @returns {boolean}
   */
  canDealDamageToEnemy(enemy, isAttackColliding) {
    if (!isAttackColliding || !this.isInAttackDamageFrame()) {
      return false;
    }

    return !this.hitEnemiesThisAttack.has(enemy);
  }

  /**
   * Runs register enemy hit.
   * @param {object} enemy
   * @returns {void}
   */
  registerEnemyHit(enemy) {
    this.hitEnemiesThisAttack.add(enemy);
  }
}
