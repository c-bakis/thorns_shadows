
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
        break;
      case "toggleMusic":
        {
          const isEnabled = this.world?.audioManager?.toggleMusic?.();
          console.log(`Music ${isEnabled ? "on" : "off"}`);
        }
        break;
      case "toggleSound":
        {
          const isEnabled = this.world?.audioManager?.toggleSfx?.();
          console.log(`SFX ${isEnabled ? "on" : "off"}`);
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
      // TODO: return to main menu
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
      // TODO: return to main menu
    }
  }
}
