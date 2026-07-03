
export default class MenuActionsController {
  constructor(world) {
    this.world = world;
  }

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
        console.log("Toggle Music clicked");
        break;
      case "toggleSound":
        console.log("Toggle Sound clicked");
        break;
      default:
        console.log(`Unknown action: ${action}`);
    }
  }

  handleGameOverAction(action) {
    if (action === "restart") {
      console.log("Restart clicked");
      this.world?.restart?.();
    } else if (action === "menu" || action === "close") {
      console.log("Menu clicked");
      // TODO: return to main menu
    }
  }

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