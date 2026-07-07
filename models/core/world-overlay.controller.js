import PauseMenu from "../ui/pause-menu.class.js";
import GameOver from "../ui/game-over.class.js";
import Win from "../ui/win.class.js";

import MenuActionsController from "./menu-actions.controller.js";

export default class WorldOverlayController {

  constructor(world) {
    this.world = world;
    this.menuActionsController = new MenuActionsController(this.world);
    this.activeOverlayCleanup = null;
  }

  /**
   * Handles play pause menu ui.
   * @returns {void}
   */
  playPauseMenuUi() {
    const pauseMenu = PauseMenu.create();
    this.playOverlayDialog(pauseMenu, (action) => this.menuActionsController.handlePauseMenuAction(action));
  }

  /**
   * Handles play game over ui.
   * @returns {void}
   */
  playGameOverUi() {
    const gameOver = GameOver.create();
    this.playOverlayDialog(gameOver, (action) => this.menuActionsController.handleGameOverAction(action));
  }

  /**
   * Handles play win ui.
   * @returns {void}
   */
  playWinUi() {
    const win = Win.create();
    this.playOverlayDialog(win, (action) => this.menuActionsController.handleWinAction(action));
  }

  /**
   * Handles play overlay dialog.
   * @param {object} dialog
   * @param {Function} onActionCallback
   * @returns {void}
   */
  playOverlayDialog(dialog, onActionCallback) {
    this.closeActiveOverlay();

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

    /**
     * Handles cleanup.
     * @returns {void}
     */
    const cleanup = () => {
      this.cleanupOverlayDialog(uiState, handlers);
      if (this.activeOverlayCleanup === cleanup) {
        this.activeOverlayCleanup = null;
      }
    };

    this.activeOverlayCleanup = cleanup;
    this.bindDialogEvents(handlers);

    // Render once more on the next frame so the dialog stays visible
    // even if a late world frame clears the canvas after pause.
    requestAnimationFrame(render);
  }

  /**
   * Handles close active overlay.
   * @returns {void}
   */
  closeActiveOverlay() {
    if (typeof this.activeOverlayCleanup === "function") {
      this.activeOverlayCleanup();
      this.activeOverlayCleanup = null;
    }
  }

  /**
   * Handles render overlay dialog.
   * @param {object} dialog
   * @param {string} uiState
   * @returns {void}
   */
  renderOverlayDialog(dialog, uiState) {
    if (!uiState.isActive) {
      return;
    }

    dialog.draw(this.world.ctx);
  }

  /**
   * Handles preload dialog images.
   * @param {object} dialog
   * @param {object} onReady
   * @returns {void}
   */
  preloadDialogImages(dialog, onReady) {
    let loaded = 0;
    /**
     * Handles on load.
     * @returns {void}
     */
    const onLoad = () => {
      loaded += 1;
      if (loaded >= 2) {
        onReady();
      }
    };

    dialog.panelImg.complete ? onLoad() : (dialog.panelImg.onload = onLoad);
    dialog.buttonSheet.complete ? onLoad() : (dialog.buttonSheet.onload = onLoad);
  }

  /**
   * Handles bind dialog events.
   * @param {Function} handlers
   * @returns {void}
   */
  bindDialogEvents(handlers) {
    this.world.canvas.addEventListener("mousemove", handlers.onMouseMove);
    this.world.canvas.addEventListener("mouseleave", handlers.onMouseLeave);
    this.world.canvas.addEventListener("mousedown", handlers.onMouseDown);
    this.world.canvas.addEventListener("mouseup", handlers.onMouseUp);
    this.world.canvas.addEventListener("click", handlers.onClick);
  }

  /**
   * Handles cleanup overlay dialog.
   * @param {string} uiState
   * @param {Function} handlers
   * @returns {void}
   */
  cleanupOverlayDialog(uiState, handlers) {
    uiState.isActive = false;
    this.world.canvas.style.cursor = "default";
    this.world.canvas.removeEventListener("mousemove", handlers.onMouseMove);
    this.world.canvas.removeEventListener("mouseleave", handlers.onMouseLeave);
    this.world.canvas.removeEventListener("mousedown", handlers.onMouseDown);
    this.world.canvas.removeEventListener("mouseup", handlers.onMouseUp);
    this.world.canvas.removeEventListener("click", handlers.onClick);
  }

  /**
   * Handles retrieve canvas mouse pos.
   * @param {Event} e
   * @returns {object|null}
   */
  getCanvasMousePos(e) {
    const rect = this.world.canvas.getBoundingClientRect();
    const scaleX = this.world.canvas.width / rect.width;
    const scaleY = this.world.canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  /**
   * Handles handle dialog mouse move.
   * @param {Event} e
   * @param {object} dialog
   * @param {object} render
   * @returns {void}
   */
  handleDialogMouseMove(e, dialog, render) {
    const { x, y } = this.getCanvasMousePos(e);
    const hoveredButton = dialog.getClickedButton(x, y);
    dialog.setHoveredButton(hoveredButton?.action ?? null);

    if (!hoveredButton) {
      dialog.setPressedButton(null);
    }

    this.world.canvas.style.cursor = hoveredButton ? "pointer" : "default";
    render();
  }

  /**
   * Handles handle dialog mouse leave.
   * @param {object} dialog
   * @param {object} render
   * @returns {void}
   */
  handleDialogMouseLeave(dialog, render) {
    dialog.setHoveredButton(null);
    dialog.setPressedButton(null);
    this.world.canvas.style.cursor = "default";
    render();
  }

  /**
   * Handles handle dialog mouse down.
   * @param {Event} e
   * @param {object} dialog
   * @param {object} render
   * @returns {void}
   */
  handleDialogMouseDown(e, dialog, render) {
    const { x, y } = this.getCanvasMousePos(e);
    const pressedButton = dialog.getClickedButton(x, y);
    dialog.setPressedButton(pressedButton?.action ?? null);
    render();
  }

  /**
   * Handles handle dialog mouse up.
   * @param {Event} e
   * @param {object} dialog
   * @param {object} render
   * @returns {void}
   */
  handleDialogMouseUp(e, dialog, render) {
    const { x, y } = this.getCanvasMousePos(e);
    const hoveredButton = dialog.getClickedButton(x, y);
    dialog.setHoveredButton(hoveredButton?.action ?? null);
    dialog.setPressedButton(null);
    render();
  }

  /**
   * Handles handle dialog click.
   * @param {Event} e
   * @param {object} dialog
   * @param {object} cleanup
   * @param {Function} onActionCallback
   * @returns {void}
   */
  handleDialogClick(e, dialog, cleanup, onActionCallback) {
    const { x, y } = this.getCanvasMousePos(e);
    const btn = dialog.getClickedButton(x, y);
    if (!btn) {
      return;
    }

    cleanup();
    onActionCallback(btn.action);
  }
}
