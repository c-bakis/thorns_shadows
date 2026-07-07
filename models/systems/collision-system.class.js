import CollisionCombatSystem from "./collision-combat-system.class.js";

export default class CollisionSystem {
  constructor(world) {
    this.world = world;
    this.combatSystem = new CollisionCombatSystem(this);
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
    this.combatSystem.checkEnemyCollisions(now);
    this.combatSystem.checkMagicAttackCollisions(now);
    this.cleanupDefeatedAndCollected();
  }

  checkCollectableCollisions() {
    this.collectables.forEach((collectable) => {
      if (!this.checkIfCharacterCanCollect(collectable)) {
        return;
      }

      collectable.onCollect(this.character);
      this.updateCharacterHealthUi();
      this.combatSystem.playCorrectSfx(
        this.character.world?.audioManager?.collectItemSoundPath,
        { volume: 0.25 },
      );
    });
  }

  checkIfCharacterCanCollect(collectable) {
    if (!this.isCharacterCollidingWithCollectable(collectable)) {
      return false;
    }

    if (this.character.mana >= this.character.maxMana) {
      return false;
    }

    return typeof collectable?.onCollect === "function";
  }

  isCharacterCollidingWithCollectable(collectable) {
    return this.combatSystem.isCollidingAABB(this.character, collectable);
  }

  cleanupDefeatedAndCollected() {
    this.world.enemies = this.enemies.filter((enemy) => {
      return this.combatSystem.removeOrKeepEnemy(enemy);
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

  updateCharacterHealthUi() {
    this.statusBar.setPercentage(this.character.energy, "health");
  }
}
