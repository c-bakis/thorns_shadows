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
import WorldFlowController from "./world-flow.controller.js";
import WorldOverlayController from "./world-overlay.controller.js";
import WorldRenderController from "./world-render.controller.js";

export default class World {
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
  quitHandler = null;
  audioManager = null;
  cameraController;
  bossController;
  flowController;
  overlayController;
  renderController;
  bossIntroState = {
    active: false,
    played: false,
    actor: null,
    endsAt: 0,
  };
  musicIsEnabled;
  soundIsEnabled;

  constructor(canvas, level, audioManager = null) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.level = level;
    this.audioManager = audioManager;
    this.keyboard = new Keyboard();
    this.cameraController = new WorldCameraController(this);
    this.bossController = new WorldBossController(this);
    this.flowController = new WorldFlowController(this);
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
    this.audioManager.setGameOverMusicTrack?.(GAME_AUDIO.gameOverMusicPath, {
      loop: true,
      volume: 0.5,
    });
    this.audioManager.setVictoryMusicTrack?.(GAME_AUDIO.victoryMusicPath, {
      loop: true,
      volume: 0.5,
    });
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
   * Handles mirrors object if needed.
   * @param {object} movableObject
   * @returns {boolean}
   */
  mirrorObjectIfNeeded(movableObject) {
    return this.renderController.mirrorObjectIfNeeded(movableObject);
  }

  /**
   * Handles pause toggle.
   * @returns {void}
   */
  handlePauseToggle() {
    this.flowController.handlePauseToggle();
  }

  /**
   * Handles play pause menu ui.
   * @returns {void}
   */
  playPauseMenuUi() {
    this.flowController.playPauseMenuUi();
  }

  /**
   * Handles pause game.
   * @returns {void}
   */
  pauseGame() {
    this.flowController.pauseGame();
  }

  /**
   * Handles resume game.
   * @returns {void}
   */
  resumeGame() {
    this.flowController.resumeGame();
  }

  /**
   * Handles set restart handler.
   * @param {Function|null} handler
   * @returns {void}
   */
  setRestartHandler(handler) {
    this.flowController.setRestartHandler(handler);
  }

  /**
   * Handles set quit handler.
   * @param {Function|null} handler
   * @returns {void}
   */
  setQuitHandler(handler) {
    this.flowController.setQuitHandler(handler);
  }

  /**
   * Handles restart.
   * @returns {void}
   */
  restart() {
    this.flowController.restart();
  }

  /**
   * Destroys actual canvas for the world.
   * @returns {void}
   */
  destroy() {
    this.flowController.destroy();
  }

  /**
   * Handles game over.
   * @returns {void}
   */
  handleGameOver() {
    this.flowController.handleGameOver();
  }

  /**
   * Handles play game over ui.
   * @returns {void}
   */
  playGameOverUi() {
    this.flowController.playGameOverUi();
  }

  /**
   * Handles level win.
   * @returns {void}
   */
  handleWin() {
    this.flowController.handleWin();
  }

  /**
   * Handles play win ui.
   * @returns {void}
   */
  playWinUi() {
    this.flowController.playWinUi();
  }

  /**
   * Handles enemy defeat.
   * @param {object} enemy
   * @returns {void}
   */
  handleEnemyDefeat(enemy) {
    this.flowController.handleEnemyDefeat(enemy);
  }

  /**
   * Checks whether the enemy is the win condition enemy and handles level win if needed.
   * @param {object} enemy
   * @returns {void}
   */
  handleEnemyRemoved(enemy) {
    this.flowController.handleEnemyRemoved(enemy);
  }

  /**
   * Handles win condition.
   * @param {object} enemy
   * @returns {boolean}
   */
  isWinConditionEnemy(enemy) {
    return this.flowController.isWinConditionEnemy(enemy);
  }

  /**
   * Toggles the visibility of the main menu and game canvas.
   * @returns {void}
   */
  toggleMainMenuGame() {
    return this.flowController.toggleMainMenuGame();
  }
}
