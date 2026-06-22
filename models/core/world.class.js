import Tileset from "../environment/tileset.class.js";
import Character from "../player/character.class.js";
import Keyboard from "./keyboard.class.js";
import LevelBuilder from "./level-builder.class.js";
import StatusBar from "../ui/status-bar.class.js";
import GameOver from "../ui/game-over.class.js";
import Win from "../ui/win.class.js";
import CollisionSystem from "../systems/collision-system.class.js";
import BackgroundRenderer from "../systems/background-renderer.class.js";
import PlattformGroundResolver from "../systems/plattform-ground-resolver.class.js";

export default class World {
  debugForceGameOverOnLoad = true;
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

  constructor(canvas, level) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.level = level;
    this.keyboard = new Keyboard();
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
    this.draw();
    if (this.debugForceGameOverOnLoad) {
      this.handleGameOver();
    }
  }

  
  getObjectBox(object) {
    return typeof object?.getHitbox === "function"
      ? object.getHitbox()
      : {
          x: object.x,
          y: object.y,
          width: object.width,
          height: object.height,
        };
  }

  draw() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    this.updateCamera();

    this.ctx.translate(this.camera_x, this.camera_y);

    this.plattformGroundResolver.resolvePlatformGround();
    this.backgroundRenderer.drawAll(this.backgroundObjects);
    // this.addRepeatingBackgroundsToMap(this.backgroundObjects);
    this.addObjToMap(this.tileset);
    this.addObjToMap(this.decorations);
    this.addObjToMap(this.collectables);
    this.updateMagicAttacks();
    this.addObjToMap(this.magicAttacks);
    this.addToMap(this.character);
    this.updateEnemyPlatformLocks();
    this.addObjToMap(this.enemies);
    this.collisionSystem.run(Date.now());
    this.ctx.translate(-this.camera_x, -this.camera_y);
    this.statusBar.draw(this.ctx);
    if (this.pause) {
      return;
    }
    requestAnimationFrame(() => this.draw());
  }

  updateCamera() {
    const deltaFromAnchor = this.character.x - this.cameraAnchorX;
    const deltaYUp = this.cameraAnchorY - this.character.y;
    let nextCameraX = -this.cameraAnchorX;
    let nextCameraY = 0;

    if (deltaFromAnchor > this.cameraDeadZone) {
      nextCameraX = -(this.character.x - this.cameraDeadZone);
    } else if (deltaFromAnchor < -this.cameraDeadZone) {
      nextCameraX = -(this.character.x + this.cameraDeadZone);
    }

    const bounds = this.getCameraBounds();
    this.camera_x = this.clamp(nextCameraX, bounds.min, bounds.max);

    if (deltaYUp > this.cameraDeadZoneY) {
      nextCameraY = deltaYUp - this.cameraDeadZoneY;
    }
    this.camera_y = this.clamp(nextCameraY, 0, this.cameraMaxUp);
  }

  getCameraBounds() {
    const max = -this.cameraAnchorX;
    const levelEndX = this.level?.levelEndX;

    if (!Number.isFinite(levelEndX) || !Number.isFinite(this.canvas?.width)) {
      return { min: -Infinity, max };
    }

    const min = Math.min(max, this.canvas.width - levelEndX);
    return { min, max };
  }

  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  updateEnemyPlatformLocks() {
    this.enemies.forEach((enemy) => {
      if (typeof enemy.updatePlatformLock === "function") {
        enemy.updatePlatformLock(this.tileset);
      }
    });
  }

  getBackgroundVerticalPadding() {
    return Math.max(0, this.cameraMaxUp);
  }

  updateMagicAttacks() {
    this.magicAttacks = this.magicAttacks.filter((attack) => {
      if (!attack || attack.isConsumed) {
        return false;
      }

      if (typeof attack?.update === "function") {
        attack.update();
      }

      const levelEndX = this.level?.levelEndX ?? Infinity;
      const isOutOnRight = attack.x > levelEndX + 120;
      const isOutOnLeft = attack.x + attack.width < -120;
      return !isOutOnRight && !isOutOnLeft;
    });
  }

  addMagicAttack(attack) {
    if (!attack) {
      return;
    }

    this.magicAttacks.push(attack);
  }

  addObjToMap(objects) {
    objects.forEach((obj) => {
      this.addToMap(obj);
    });
  }

  addToMap(drawableObject) {
    if (!drawableObject?.img) {
      return;
    }

    const isMirrored = this.mirrorObjectIfNeeded(drawableObject);
    if (drawableObject.img.complete && drawableObject.img.naturalWidth > 0) {
      drawableObject.draw(this.ctx);
      if (typeof drawableObject.drawBoundingBox === "function") {
        drawableObject.drawBoundingBox(this.ctx);
      }
    } else {
      drawableObject.img.onload = () => {
        if (drawableObject.img.naturalWidth > 0) {
          this.ctx.drawImage(
            drawableObject.img,
            drawableObject.x,
            drawableObject.y,
            drawableObject.width,
            drawableObject.height,
          );
        }
      };
      drawableObject.img.onerror = () =>
        console.error("Movable object image failed to load.");
    }
    if (isMirrored) {
      this.ctx.restore();
    }
  }

  mirrorObjectIfNeeded(movableObject) {
    if (!movableObject.otherDirection) {
      return false;
    }

    this.ctx.save();
    this.ctx.translate(movableObject.x + movableObject.width / 2, 0);
    this.ctx.scale(-1, 1);
    this.ctx.translate(-movableObject.x - movableObject.width / 2, 0);
    return true;
  }

  pauseGame() {
    this.pause = true;
  }

  handleGameOver() {
    console.log("Game Over");
    this.pauseGame();
    this.playGameOverUi();
  }

  playGameOverUi() {
    const gameOver = GameOver.create();
    this.playOverlayDialog(gameOver, (action) => this.handleGameOverAction(action));
  }

  playWinUi() {
    const win = Win.create();
    this.playOverlayDialog(win, (action) => this.handleWinAction(action));
  }

  playOverlayDialog(dialog, onActionCallback) {
    const uiState = { isActive: true };

    const render = () => this.renderOverlayDialog(dialog, uiState);
    this.preloadDialogImages(dialog, render);

    const handlers = {
      onMouseMove: (e) => this.handleDialogMouseMove(e, dialog, render),
      onMouseLeave: () => this.handleDialogMouseLeave(dialog, render),
      onMouseDown: (e) => this.handleDialogMouseDown(e, dialog, render),
      onMouseUp: (e) => this.handleDialogMouseUp(e, dialog, render),
      onClick: (e) => this.handleDialogClick(e, dialog, () => cleanup(), onActionCallback),
    };

    const cleanup = () => this.cleanupOverlayDialog(uiState, handlers);
    this.bindDialogEvents(handlers);
  }

  renderOverlayDialog(dialog, uiState) {
    if (!uiState.isActive) {
      return;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    dialog.draw(this.ctx);
  }

  preloadDialogImages(dialog, onReady) {
    let loaded = 0;
    const onLoad = () => {
      loaded += 1;
      if (loaded >= 2) {
        onReady();
      }
    };

    dialog.panelImg.complete ? onLoad() : (dialog.panelImg.onload = onLoad);
    dialog.buttonSheet.complete ? onLoad() : (dialog.buttonSheet.onload = onLoad);
  }

  bindDialogEvents(handlers) {
    this.canvas.addEventListener("mousemove", handlers.onMouseMove);
    this.canvas.addEventListener("mouseleave", handlers.onMouseLeave);
    this.canvas.addEventListener("mousedown", handlers.onMouseDown);
    this.canvas.addEventListener("mouseup", handlers.onMouseUp);
    this.canvas.addEventListener("click", handlers.onClick);
  }

  cleanupOverlayDialog(uiState, handlers) {
    uiState.isActive = false;
    this.canvas.style.cursor = "default";
    this.canvas.removeEventListener("mousemove", handlers.onMouseMove);
    this.canvas.removeEventListener("mouseleave", handlers.onMouseLeave);
    this.canvas.removeEventListener("mousedown", handlers.onMouseDown);
    this.canvas.removeEventListener("mouseup", handlers.onMouseUp);
    this.canvas.removeEventListener("click", handlers.onClick);
  }

  getCanvasMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  handleDialogMouseMove(e, dialog, render) {
    const { x, y } = this.getCanvasMousePos(e);
    const hoveredButton = dialog.getClickedButton(x, y);
    dialog.setHoveredButton(hoveredButton?.action ?? null);

    if (!hoveredButton) {
      dialog.setPressedButton(null);
    }

    this.canvas.style.cursor = hoveredButton ? "pointer" : "default";
    render();
  }

  handleDialogMouseLeave(dialog, render) {
    dialog.setHoveredButton(null);
    dialog.setPressedButton(null);
    this.canvas.style.cursor = "default";
    render();
  }

  handleDialogMouseDown(e, dialog, render) {
    const { x, y } = this.getCanvasMousePos(e);
    const pressedButton = dialog.getClickedButton(x, y);
    dialog.setPressedButton(pressedButton?.action ?? null);
    render();
  }

  handleDialogMouseUp(e, dialog, render) {
    const { x, y } = this.getCanvasMousePos(e);
    const hoveredButton = dialog.getClickedButton(x, y);
    dialog.setHoveredButton(hoveredButton?.action ?? null);
    dialog.setPressedButton(null);
    render();
  }

  handleDialogClick(e, dialog, cleanup, onActionCallback) {
    const { x, y } = this.getCanvasMousePos(e);
    const btn = dialog.getClickedButton(x, y);

    if (!btn) {
      return;
    }

    cleanup();
    onActionCallback(btn.action);
  }

  handleGameOverAction(action) {
    if (action === "restart") {
      console.log("Restart clicked");
      // TODO: restart the game
    } else if (action === "menu") {
      console.log("Menu clicked");
      // TODO: return to main menu
    }
  }

  handleWinAction(action) {
    if (action === "nextLevel") {
      console.log("Next Level clicked");
      // TODO: load next level
    } else if (action === "menu") {
      console.log("Menu clicked");
      // TODO: return to main menu
    }
  }
}
