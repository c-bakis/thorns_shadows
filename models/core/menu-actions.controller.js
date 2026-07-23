
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
        this.resumeIfPaused();
        break;
      case "restart":
        this.world?.restart?.();
        break;
      case "menu":
        this.returnToMenu();
        break;
      case "toggleMusic":
        this.toggleMusicPreference();
        break;
      case "toggleSound":
        this.toggleSoundPreference();
        break;
      default:
        console.warn(`Unknown pause menu action: ${action}`);
        break;
    }
  }

  /**
   * Resumes the game only when currently paused.
   * @returns {void}
   */
  resumeIfPaused() {
    if (this.world?.pause) {
      this.world.handlePauseToggle();
    }
  }

  /**
   * Destroys world and returns to main menu.
   * @returns {void}
   */
  returnToMenu() {
    this.world?.destroy?.();
    this.world?.toggleMainMenuGame?.();
  }

  /**
   * Toggles music and persists enabled state.
   * @returns {void}
   */
  toggleMusicPreference() {
    const isEnabled = this.world?.audioManager?.toggleMusic?.();
    sessionStorage.setItem("musicIsEnabled", isEnabled ? "true" : "false");
    const btnState = isEnabled ? "on" : "off";
    sessionStorage.setItem("toggleMusicButtonState", btnState);
    window.dispatchEvent(new CustomEvent("audio-settings-changed"));
  }

  /**
   * Toggles sound effects and persists enabled state.
   * @returns {void}
   */
  toggleSoundPreference() {
    const isEnabled = this.world?.audioManager?.toggleSfx?.();
    sessionStorage.setItem("soundIsEnabled", isEnabled ? "true" : "false");
    window.dispatchEvent(new CustomEvent("audio-settings-changed"));
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
      this.returnToMenu();
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
      this.returnToMenu();
    }
  }
}
