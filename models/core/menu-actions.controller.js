import WorldOverlayController from "./world-overlay.controller.js";

export default class MenuActionsController {
  constructor() {
    
  }
    handlePauseMenuAction(action) {
        if (action === "restart") {
      console.log("Restart clicked");
      // TODO: restart the game
    } else if (action === "menu") {
      console.log("Menu clicked");
      // TODO: return to main menu
    }
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
    if (action === "restart") {
      console.log("Restart clicked");
      // TODO: restart the game
    } else if (action === "menu") {
      console.log("Menu clicked");
      // TODO: return to main menu
    }
  }
}