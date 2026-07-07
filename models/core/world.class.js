import Character from "../player/character.class.js";
import Keyboard from "./keyboard.class.js";
import LevelBuilder from "./level-builder.class.js";
import StatusBar from "../ui/status-bar.class.js";
import CollisionSystem from "../systems/collision-system.class.js";
import BackgroundRenderer from "../systems/background-renderer.class.js";
import PlattformGroundResolver from "../systems/plattform-ground-resolver.class.js";
import GAME_AUDIO from "./game-audio.config.js";
import WorldCameraController from "./world-camera.controller.js";
import WorldBossController from "./world-boss.controller.js";
import WorldOverlayController from "./world-overlay.controller.js";
import WorldRenderController from "./world-render.controller.js";

export default class World {
  // debugForceGameOverOnLoad = true;
    // debugForcePauseOnLoad = true;
  backgroundObjects = [];
  tileset = [];
  enemies = [];
  collectables = [];
  decorations = [];
  magicAttacks = [];
  statusBar = new StatusBar();
  character = new Character();
  canvas;
  ctx;
  keyboard;
  camera_x = 0;
  camera_y = 0;
  cameraDeadZone = 150;
  cameraDeadZoneY = 85;
  cameraMaxUp = 95;
  cameraAnchorX = 0;
  cameraAnchorY = 0;
  pause = false;
  level;
  gameplayFreezeUntil = 0;
  focusedScriptActor = null;
  hasLevelWon = false;
  pendingWinEnemy = null;
  renderFrameId = null;
  restartHandler = null;
  audioManager = null;
  cameraController;
  bossController;
  overlayController;
  renderController;
  bossIntroState = {
    active: false,
    played: false,
    actor: null,
    endsAt: 0,
  };

  constructor(canvas, level, audioManager = null) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.level = level;
    this.audioManager = audioManager;
    this.keyboard = new Keyboard();
    this.cameraController = new WorldCameraController(this);
    this.bossController = new WorldBossController(this);
    this.overlayController = new WorldOverlayController(this);
    this.renderController = new WorldRenderController(this);
    const builtLevel = LevelBuilder.build(level);
    this.backgroundObjects = builtLevel.backgroundObjects;
    this.tileset = builtLevel.tileset;
    this.enemies = builtLevel.enemies;
    this.collectables = builtLevel.collectables ?? [];
    this.decorations = builtLevel.decorations ?? [];
    if (typeof level?.cameraDeadZone === "number") {
      this.cameraDeadZone = level.cameraDeadZone;
    }
    if (typeof level?.cameraDeadZoneY === "number") {
      this.cameraDeadZoneY = level.cameraDeadZoneY;
    }
    if (typeof level?.cameraMaxUp === "number") {
      this.cameraMaxUp = level.cameraMaxUp;
    }
    if (typeof level?.spawn?.x === "number") {
      this.character.x = level.spawn.x;
    }
    if (typeof level?.spawn?.y === "number") {
      this.character.y = level.spawn.y;
      this.character.groundY = level.spawn.y;
      this.character.defaultGroundY = level.spawn.y;
      this.character.previousY = level.spawn.y;
    }
    this.character.world = this;
    this.enemies.forEach((enemy) => {
      enemy.world = this;
    });
    this.updateEnemyPlatformLocks();
    this.cameraAnchorX = this.character.x;
    this.cameraAnchorY = this.character.y;
    this.camera_x = -this.character.x;
    this.camera_y = 0;
    this.collisionSystem = new CollisionSystem(this);
    this.plattformGroundResolver = new PlattformGroundResolver(this);
    this.backgroundRenderer = new BackgroundRenderer(this);
    this.tileset = this.plattformGroundResolver.fillTilesAcrossGround();
    this.initializeAudio();
    this.draw();
    if (this.debugForceGameOverOnLoad) {
      this.handleGameOver();
    }
        if (this.debugForcePauseOnLoad) {
      this.handlePauseToggle();
    }
  }

  /**
   * Handles initialize audio.
    * @returns {void}
   */
  initializeAudio() {
    const bgmPath = this.level?.audio?.bgmPath ?? this.level?.backgroundMusic;
    if (!bgmPath || !this.audioManager) {
      return;
    }

    this.audioManager.setMusicTrack(bgmPath, { loop: true, volume: 0.35 });
    this.audioManager.setGameOverMusicTrack?.(GAME_AUDIO.gameOverMusicPath, { loop: true, volume: 0.5 });
    this.audioManager.setVictoryMusicTrack?.(GAME_AUDIO.victoryMusicPath, { loop: true, volume: 0.5 });
    this.audioManager.resumeMusic();
  }

  
  /**
   * Handles retrieve object box.
    * @param {{x: number, y: number, width: number, height: number}} object
    * @returns {{x: number, y: number, width: number, height: number}}
   */
  getObjectBox(object) {
    return this.renderController.getObjectBox(object);
  }

  /**
   * Handles draw.
    * @returns {void}
   */
  draw() {
    this.renderController.draw();
  }

  /**
   * Handles update camera.
    * @returns {void}
   */
  updateCamera() {
    this.cameraController.updateCamera();
  }

  /**
   * Handles focus camera on actor.
    * @param {object|null} actor
    * @returns {void}
   */
  focusCameraOnActor(actor) {
    this.cameraController.focusCameraOnActor(actor);
  }

  /**
   * Handles retrieve camera bounds.
    * @returns {{minX: number, maxX: number, minY: number, maxY: number}}
   */
  getCameraBounds() {
    return this.cameraController.getCameraBounds();
  }

  /**
   * Handles clamp.
    * @param {number} value
    * @param {number} min
    * @param {number} max
    * @returns {number}
   */
  clamp(value, min, max) {
    return this.cameraController.clamp(value, min, max);
  }

  updateBossIntro(now = Date.now()) {
    this.bossController.updateBossIntro(now);
  }

  startBossIntro(now = Date.now()) {
    this.bossController.startBossIntro(now);
  }

  /**
   * Handles finish boss intro.
    * @returns {void}
   */
  finishBossIntro() {
    this.bossController.finishBossIntro();
  }

  /**
   * Handles find boss intro actor.
    * @returns {object|null}
   */
  findBossIntroActor() {
    return this.bossController.findBossIntroActor();
  }

  freezeGameplay(durationMs, actor = null, now = Date.now()) {
    this.bossController.freezeGameplay(durationMs, actor, now);
  }

  isGameplayFrozen(actor = null, now = Date.now()) {
    return this.bossController.isGameplayFrozen(actor, now);
  }

  /**
   * Handles is boss intro active.
    * @returns {boolean}
   */
  isBossIntroActive() {
    return this.bossController.isBossIntroActive();
  }

  /**
   * Handles update enemy platform locks.
    * @returns {void}
   */
  updateEnemyPlatformLocks() {
    this.renderController.updateEnemyPlatformLocks();
  }

  /**
   * Handles retrieve background vertical padding.
    * @returns {number}
   */
  getBackgroundVerticalPadding() {
    return this.renderController.getBackgroundVerticalPadding();
  }

  /**
   * Handles update magic attacks.
    * @returns {void}
   */
  updateMagicAttacks() {
    this.renderController.updateMagicAttacks();
  }

  /**
   * Handles add magic attack.
    * @param {object} attack
    * @returns {void}
   */
  addMagicAttack(attack) {
    this.renderController.addMagicAttack(attack);
  }

  /**
   * Handles add obj to map.
    * @param {object[]} objects
    * @returns {void}
   */
  addObjToMap(objects) {
    this.renderController.addObjToMap(objects);
  }

  /**
   * Handles add to map.
    * @param {object} drawableObject
    * @returns {void}
   */
  addToMap(drawableObject) {
    this.renderController.addToMap(drawableObject);
  }

  /**
   * Handles mirror object if needed.
    * @param {object} movableObject
    * @returns {boolean}
   */
  mirrorObjectIfNeeded(movableObject) {
    return this.renderController.mirrorObjectIfNeeded(movableObject);
  }

  /**
   * Handles handle pause toggle.
    * @returns {void}
   */
  handlePauseToggle() {
    if (this.pause) {
      this.resumeGame();
    } else {
      this.pauseGame()
      this.playPauseMenuUi();
    }
  }

  /**
   * Handles play pause menu ui.
    * @returns {void}
   */
  playPauseMenuUi() {
    if (this.pause) {
      this.overlayController.playPauseMenuUi();
    }
  }

  /**
   * Handles pause game.
    * @returns {void}
   */
  pauseGame() {
    this.pause = true;
    this.audioManager?.decreaseVolumeOnMenuOpen?.();
  }

  /**
   * Handles resume game.
    * @returns {void}
   */
  resumeGame() {
    this.overlayController?.closeActiveOverlay?.();
    this.pause = false;
    this.audioManager?.stopGameOverMusic?.();
    this.audioManager?.stopVictoryMusic?.();
    this.audioManager?.increaseVolumeOnMenuClose?.();
    this.draw();
  }

  /**
   * Handles set restart handler.
    * @param {Function|null} handler
    * @returns {void}
   */
  setRestartHandler(handler) {
    this.restartHandler = typeof handler === "function" ? handler : null;
  }

  /**
   * Handles restart.
    * @returns {void}
   */
  restart() {
    if (typeof this.restartHandler === "function") {
      this.restartHandler();
    }
  }

  /**
   * Handles destroy.
    * @returns {void}
   */
  destroy() {
    this.overlayController?.closeActiveOverlay?.();
    this.pause = true;
    this.audioManager?.stopGameOverMusic?.();
    this.audioManager?.stopVictoryMusic?.();
    this.audioManager?.stopMusic?.();
    if (Number.isFinite(this.renderFrameId)) {
      cancelAnimationFrame(this.renderFrameId);
      this.renderFrameId = null;
    }

    const cleanupTargets = [
      this.character,
      ...this.enemies,
      ...this.collectables,
      ...this.magicAttacks,
    ];

    cleanupTargets.forEach((obj) => obj?.clearIntervals?.());
  }

  /**
   * Handles handle game over.
    * @returns {void}
   */
  handleGameOver() {
    console.log("Game Over");
    this.pauseGame();
    this.audioManager?.playGameOverMusic?.();
    this.playGameOverUi();
  }

  /**
   * Handles play game over ui.
    * @returns {void}
   */
  playGameOverUi() {
    this.overlayController.playGameOverUi();
  }

  /**
   * Handles handle win.
    * @returns {void}
   */
  handleWin() {
    console.log("Level Won");
    this.pauseGame();
    this.audioManager?.playVictoryMusic?.();
    this.playWinUi();
  }

  /**
   * Handles play win ui.
    * @returns {void}
   */
  playWinUi() {
    this.overlayController.playWinUi();
  }

  /**
   * Handles handle enemy defeat.
    * @param {object} enemy
    * @returns {void}
   */
  handleEnemyDefeat(enemy) {
    if (!this.isWinConditionEnemy(enemy) || this.hasLevelWon) {
      return;
    }

    this.pendingWinEnemy = enemy;
  }

  /**
   * Handles handle enemy removed.
    * @param {object} enemy
    * @returns {void}
   */
  handleEnemyRemoved(enemy) {
    if (this.hasLevelWon) {
      return;
    }

    const isPendingWinEnemy = this.pendingWinEnemy && enemy === this.pendingWinEnemy;
    if (!isPendingWinEnemy && !this.isWinConditionEnemy(enemy)) {
      return;
    }

    this.pendingWinEnemy = null;
    this.hasLevelWon = true;
    this.handleWin();
  }

  /**
   * Handles is win condition enemy.
    * @param {object} enemy
    * @returns {boolean}
   */
  isWinConditionEnemy(enemy) {
    const expectedType = this.level?.winCondition?.enemyType;
    if (!expectedType || !enemy?.constructor?.name) {
      return false;
    }

    return enemy.constructor.name.toLowerCase() === expectedType.toLowerCase();
  }
}
