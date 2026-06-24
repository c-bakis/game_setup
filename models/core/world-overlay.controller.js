import GameOver from "../ui/game-over.class.js";
import Win from "../ui/win.class.js";

export default class WorldOverlayController {
  constructor(world) {
    this.world = world;
  }

  playGameOverUi() {
    const gameOver = GameOver.create();
    this.playOverlayDialog(gameOver, (action) => this.world.handleGameOverAction(action));
  }

  playWinUi() {
    const win = Win.create();
    this.playOverlayDialog(win, (action) => this.world.handleWinAction(action));
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

    dialog.draw(this.world.ctx);
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
    this.world.canvas.addEventListener("mousemove", handlers.onMouseMove);
    this.world.canvas.addEventListener("mouseleave", handlers.onMouseLeave);
    this.world.canvas.addEventListener("mousedown", handlers.onMouseDown);
    this.world.canvas.addEventListener("mouseup", handlers.onMouseUp);
    this.world.canvas.addEventListener("click", handlers.onClick);
  }

  cleanupOverlayDialog(uiState, handlers) {
    uiState.isActive = false;
    this.world.canvas.style.cursor = "default";
    this.world.canvas.removeEventListener("mousemove", handlers.onMouseMove);
    this.world.canvas.removeEventListener("mouseleave", handlers.onMouseLeave);
    this.world.canvas.removeEventListener("mousedown", handlers.onMouseDown);
    this.world.canvas.removeEventListener("mouseup", handlers.onMouseUp);
    this.world.canvas.removeEventListener("click", handlers.onClick);
  }

  getCanvasMousePos(e) {
    const rect = this.world.canvas.getBoundingClientRect();
    const scaleX = this.world.canvas.width / rect.width;
    const scaleY = this.world.canvas.height / rect.height;

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

    this.world.canvas.style.cursor = hoveredButton ? "pointer" : "default";
    render();
  }

  handleDialogMouseLeave(dialog, render) {
    dialog.setHoveredButton(null);
    dialog.setPressedButton(null);
    this.world.canvas.style.cursor = "default";
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
}