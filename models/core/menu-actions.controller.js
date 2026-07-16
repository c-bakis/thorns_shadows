
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
        console.log("Close clicked");
        this.handlePauseMenuAction("resume");
        break;
      case "resume":
        console.log("Resume clicked");
        if (this.world?.pause) {
          this.world.handlePauseToggle();
        }
        break;
      case "restart":
        console.log("Restart clicked");
        this.world?.restart?.();
        break;
      case "menu":
        console.log("Menu clicked");
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
        console.log(`Unknown action: ${action}`);
    }
  }

  /**
   * Handles handle game over action.
   * @param {string} action
   * @returns {void}
   */
  handleGameOverAction(action) {
    if (action === "restart") {
      console.log("Restart clicked");
      this.world?.restart?.();
    } else if (action === "menu" || action === "close") {
      console.log("Menu clicked");
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
      console.log("Restart clicked");
      this.world?.restart?.();
    } else if (action === "menu" || action === "close") {
      console.log("Menu clicked");
        this.world?.destroy?.();
        this.world?.toggleMainMenuGame?.();
    }
  }
}
