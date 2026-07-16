
export default class MenuActionsController {
  constructor(world) {
    this.world = world;
  }

  /**
   * Handles handle pause menu action.
   * @param {string} action
   * @returns {void}
   */
  handlePauseMenuAction(action) {
    switch (action) {
      case "close":
        this.handlePauseMenuAction("resume");
        break;
      case "resume":
        if (this.world?.pause) {
          this.world.handlePauseToggle();
        }
        break;
      case "restart":
        this.world?.restart?.();
        break;
      case "menu":
        this.world?.destroy?.();
        this.world?.toggleMainMenuGame?.();
        break;
      case "toggleMusic":
        {
          const isEnabled = this.world?.audioManager?.toggleMusic?.();
          sessionStorage.setItem("musicIsEnabled", isEnabled ? "true" : "false");
          const btnState = isEnabled ? "on" : "off";
          const btn = this.world?.overlayDialog?.buttons?.find((b) => b.action === "active");
          sessionStorage.setItem("toggleMusicButtonState", btnState);
        }
        break;
      case "toggleSound":
        {
          const isEnabled = this.world?.audioManager?.toggleSfx?.();
          sessionStorage.setItem("soundIsEnabled", isEnabled ? "true" : "false");

        }
        break;
      default:
        console.warn(`Unknown pause menu action: ${action}`);
        break;
    }
  }

  /**
   * Handles handle game over action.
   * @param {string} action
   * @returns {void}
   */
  handleGameOverAction(action) {
    if (action === "restart") {
      this.world?.restart?.();
    } else if (action === "menu" || action === "close") {
        this.world?.destroy?.();
        this.world?.toggleMainMenuGame?.();
    }
  }

  /**
   * Handles handle win action.
   * @param {string} action
   * @returns {void}
   */
  handleWinAction(action) {
    if (action === "restart") {
      this.world?.restart?.();
    } else if (action === "menu" || action === "close") {
        this.world?.destroy?.();
        this.world?.toggleMainMenuGame?.();
    }
  }
}
