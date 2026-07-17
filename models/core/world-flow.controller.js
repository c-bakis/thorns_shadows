export default class WorldFlowController {
  constructor(world) {
    this.world = world;
  }

  handlePauseToggle() {
    if (this.world.pause) {
      this.resumeGame();
    } else {
      this.pauseGame();
      this.playPauseMenuUi();
    }
  }

  playPauseMenuUi() {
    if (this.world.pause) {
      this.world.overlayController.playPauseMenuUi();
    }
  }

  pauseGame() {
    this.world.pause = true;
    this.world.audioManager?.decreaseVolumeOnMenuOpen?.();
    document.body.classList.add("is-game-paused");
  }

  resumeGame() {
    this.world.overlayController?.closeActiveOverlay?.();
    this.world.pause = false;
    this.world.audioManager?.stopGameOverMusic?.();
    this.world.audioManager?.stopVictoryMusic?.();
    this.world.audioManager?.increaseVolumeOnMenuClose?.();
    document.body.classList.remove("is-game-paused");
    this.world.draw();
  }

  setRestartHandler(handler) {
    this.world.restartHandler = typeof handler === "function" ? handler : null;
  }

  restart() {
    if (typeof this.world.restartHandler === "function") {
      this.world.restartHandler();
    }
  }

  setQuitHandler(handler) {
    this.world.quitHandler = typeof handler === "function" ? handler : null;
  }

  toggleMainMenuGame() {
    if (typeof this.world.quitHandler === "function") {
      this.world.quitHandler();
    }
  }
  destroy() {
    this.world.overlayController?.closeActiveOverlay?.();
    this.world.pause = true;
    document.body.classList.remove("is-game-paused");
    this.stopWorldAudioAndFrame();
    this.clearWorldObjectIntervals();
  }

  /**
   * Stops music tracks and cancels active render frame.
   * @returns {void}
   */
  stopWorldAudioAndFrame() {
    this.world.audioManager?.stopGameOverMusic?.();
    this.world.audioManager?.stopVictoryMusic?.();
    this.world.audioManager?.stopMusic?.();

    if (!Number.isFinite(this.world.renderFrameId)) {
      return;
    }

    cancelAnimationFrame(this.world.renderFrameId);
    this.world.renderFrameId = null;
  }

  /**
   * Clears all object interval timers used by active world entities.
   * @returns {void}
   */
  clearWorldObjectIntervals() {
    this.getDestroyCleanupTargets().forEach((obj) => obj?.clearIntervals?.());
  }

  /**
   * Returns all world objects requiring interval cleanup.
   * @returns {object[]}
   */
  getDestroyCleanupTargets() {
    return [
      this.world.character,
      ...this.world.enemies,
      ...this.world.collectables,
      ...this.world.magicAttacks,
    ];
  }

  handleGameOver() {
    this.pauseGame();
    this.world.audioManager?.playGameOverMusic?.();
    this.playGameOverUi();
  }

  playGameOverUi() {
    this.world.overlayController.playGameOverUi();
  }

  handleWin() {
    this.pauseGame();
    this.world.audioManager?.playVictoryMusic?.();
    this.playWinUi();
  }

  playWinUi() {
    this.world.overlayController.playWinUi();
  }

  handleEnemyDefeat(enemy) {
    if (!this.isWinConditionEnemy(enemy) || this.world.hasLevelWon) {
      return;
    }

    this.world.pendingWinEnemy = enemy;
  }

  handleEnemyRemoved(enemy) {
    if (this.world.hasLevelWon) {
      return;
    }

    const isPendingWinEnemy =
      this.world.pendingWinEnemy && enemy === this.world.pendingWinEnemy;
    if (!isPendingWinEnemy && !this.isWinConditionEnemy(enemy)) {
      return;
    }

    this.world.pendingWinEnemy = null;
    this.world.hasLevelWon = true;
    this.handleWin();
  }

  isWinConditionEnemy(enemy) {
    const expectedType = this.world.level?.winCondition?.enemyType;
    if (!expectedType || !enemy?.constructor?.name) {
      return false;
    }

    return enemy.constructor.name.toLowerCase() === expectedType.toLowerCase();
  }
}
