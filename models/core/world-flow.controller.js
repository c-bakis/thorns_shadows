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
  }

  resumeGame() {
    this.world.overlayController?.closeActiveOverlay?.();
    this.world.pause = false;
    this.world.audioManager?.stopGameOverMusic?.();
    this.world.audioManager?.stopVictoryMusic?.();
    this.world.audioManager?.increaseVolumeOnMenuClose?.();
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

  destroy() {
    this.world.overlayController?.closeActiveOverlay?.();
    this.world.pause = true;
    this.world.audioManager?.stopGameOverMusic?.();
    this.world.audioManager?.stopVictoryMusic?.();
    this.world.audioManager?.stopMusic?.();
    if (Number.isFinite(this.world.renderFrameId)) {
      cancelAnimationFrame(this.world.renderFrameId);
      this.world.renderFrameId = null;
    }

    const cleanupTargets = [
      this.world.character,
      ...this.world.enemies,
      ...this.world.collectables,
      ...this.world.magicAttacks,
    ];

    cleanupTargets.forEach((obj) => obj?.clearIntervals?.());
  }

  handleGameOver() {
    console.log("Game Over");
    this.pauseGame();
    this.world.audioManager?.playGameOverMusic?.();
    this.playGameOverUi();
  }

  playGameOverUi() {
    this.world.overlayController.playGameOverUi();
  }

  handleWin() {
    console.log("Level Won");
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