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
   * Creates and plays a pause menu overlay dialog.
   * @returns {void}
   */
  playPauseMenuUi() {
    const pauseMenu = PauseMenu.create();
    this.playOverlayDialog(pauseMenu, (action) => this.menuActionsController.handlePauseMenuAction(action));
  }

  /**
   * Creates and plays a game over overlay dialog.
   * @returns {void}
   */
  playGameOverUi() {
    const gameOver = GameOver.create();
    this.playOverlayDialog(gameOver, (action) => this.menuActionsController.handleGameOverAction(action));
  }

  /**
   * Creates and plays a win overlay dialog.
   * @returns {void}
   */
  playWinUi() {
    const win = Win.create();
    this.playOverlayDialog(win, (action) => this.menuActionsController.handleWinAction(action));
  }

  /**
   * Handles play overlay dialog. Displays the dialog and sets
   * up event listeners for user interaction.  
   * @param {object} dialog
   * @param {Function} onActionCallback
   * @returns {void}
   */
  playOverlayDialog(dialog, onActionCallback) {
    const uiState = { isActive: true };
    const render = () => this.renderOverlayDialog(dialog, uiState);
    this.preloadDialogImages(dialog, render);

    let cleanup = null;
    const handlers = this.createDialogPointerHandlers(
      dialog,
      render,
      () => cleanup?.(),
      onActionCallback,
    );

    /**
     * Handles cleanup overlay dialog. Cleans up event 
     * listeners and resets the active overlay cleanup reference.
     * @returns {void}
     */
    cleanup = () => {
      this.cleanupOverlayDialog(uiState, handlers);
      if (this.activeOverlayCleanup === cleanup) {
        this.activeOverlayCleanup = null;
      }
    };

    this.activeOverlayCleanup = cleanup;
    this.bindDialogEvents(handlers);

    requestAnimationFrame(render);
  }

  /**
   * Creates pointer handlers for an overlay dialog lifecycle.
   * @param {object} dialog
   * @param {Function} render
   * @param {Function} cleanup
   * @param {Function} onActionCallback
   * @returns {{onPointerMove: Function, onPointerLeave: Function, onPointerDown: Function, onPointerUp: Function}}
   */
  createDialogPointerHandlers(dialog, render, cleanup, onActionCallback) {
    return {
      onPointerMove: (e) => this.handleDialogMouseMove(e, dialog, render),
      onPointerLeave: () => this.handleDialogMouseLeave(dialog, render),
      onPointerDown: (e) => this.handleDialogMouseDown(e, dialog, render),
      onPointerUp: (e) =>
        this.handleDialogPointerUp(e, dialog, render, cleanup, onActionCallback),
    };
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
    this.world.canvas.style.touchAction = "none";
    this.world.canvas.addEventListener("pointermove", handlers.onPointerMove);
    this.world.canvas.addEventListener("pointerleave", handlers.onPointerLeave);
    this.world.canvas.addEventListener("pointerdown", handlers.onPointerDown);
    this.world.canvas.addEventListener("pointerup", handlers.onPointerUp);
    this.world.canvas.addEventListener("pointercancel", handlers.onPointerLeave);
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
    this.world.canvas.style.touchAction = "auto";
    this.world.canvas.removeEventListener("pointermove", handlers.onPointerMove);
    this.world.canvas.removeEventListener("pointerleave", handlers.onPointerLeave);
    this.world.canvas.removeEventListener("pointerdown", handlers.onPointerDown);
    this.world.canvas.removeEventListener("pointerup", handlers.onPointerUp);
    this.world.canvas.removeEventListener("pointercancel", handlers.onPointerLeave);
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
   * Handles pointerup and executes action when press+release stays on same button.
   * @param {Event} e
   * @param {object} dialog
   * @param {Function} render
   * @param {Function} cleanup
   * @param {Function} onActionCallback
   * @returns {void}
   */
  handleDialogPointerUp(e, dialog, render, cleanup, onActionCallback) {
    const pressedAction = dialog.pressedAction;
    const { x, y } = this.getCanvasMousePos(e);
    const releasedButton = dialog.getClickedButton(x, y);

    dialog.setHoveredButton(releasedButton?.action ?? null);
    dialog.setPressedButton(null);
    render();

    if (!releasedButton || !pressedAction || releasedButton.action !== pressedAction) {
      return;
    }

    this.executeDialogAction(dialog, releasedButton, render, cleanup, onActionCallback);
  }

  /**
   * Resolves clicked dialog button from mouse event.
   * @param {Event} e
   * @param {object} dialog
   * @returns {object|null}
   */
  getDialogButtonFromEvent(e, dialog) {
    const { x, y } = this.getCanvasMousePos(e);
    return dialog.getClickedButton(x, y) || null;
  }

  /**
   * Checks whether a dialog action should keep the dialog open.
   * @param {object} dialog
   * @param {string} action
   * @returns {boolean}
   */
  shouldKeepDialogOpen(dialog, action) {
    const keepOpenActions = Array.isArray(dialog?.keepOpenActions)
      ? dialog.keepOpenActions
      : [];
    return keepOpenActions.includes(action);
  }

  /**
   * Executes dialog action with keep-open or cleanup flow.
   * @param {object} dialog
   * @param {object} button
   * @param {Function} render
   * @param {Function} cleanup
   * @param {Function} onActionCallback
   * @returns {void}
   */
  executeDialogAction(dialog, button, render, cleanup, onActionCallback) {
    const shouldKeepOpen = this.shouldKeepDialogOpen(dialog, button.action);

    if (!shouldKeepOpen) {
      cleanup();
      onActionCallback(button.action);
      return;
    }
    dialog.setPressedButton(null);
    dialog.setHoveredButton(button.action);
    onActionCallback(button.action);
    render();
  }

  /**
   * Handles handle dialog click. checks if a button was 
   * clicked and calls the onActionCallback with the button's action.
   * @param {Event} e
   * @param {object} dialog
   * @param {Function} render
   * @param {Function} cleanup
   * @param {Function} onActionCallback
   * @returns {void}
   */
  handleDialogClick(e, dialog, render, cleanup, onActionCallback) {
    const clickedButton = this.getDialogButtonFromEvent(e, dialog);
    if (!clickedButton) {
      return;
    }

    this.executeDialogAction(dialog, clickedButton, render, cleanup, onActionCallback);
  }
}
