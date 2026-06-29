import Character from "../player/character.class.js";
import Keyboard from "./keyboard.class.js";
import LevelBuilder from "./level-builder.class.js";
import StatusBar from "../ui/status-bar.class.js";
import CollisionSystem from "../systems/collision-system.class.js";
import BackgroundRenderer from "../systems/background-renderer.class.js";
import PlattformGroundResolver from "../systems/plattform-ground-resolver.class.js";
import WorldCameraController from "./world-camera.controller.js";
import WorldBossController from "./world-boss.controller.js";
import WorldOverlayController from "./world-overlay.controller.js";
import WorldRenderController from "./world-render.controller.js";

export default class World {
  // debugForceGameOverOnLoad = true;
    // debugForcePauseOnLoad = true;
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
  gameplayFreezeUntil = 0;
  focusedScriptActor = null;
  hasLevelWon = false;
  pendingWinEnemy = null;
  cameraController;
  bossController;
  overlayController;
  renderController;
  bossIntroState = {
    active: false,
    played: false,
    actor: null,
    endsAt: 0,
  };

  constructor(canvas, level) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.level = level;
    this.keyboard = new Keyboard();
    this.cameraController = new WorldCameraController(this);
    this.bossController = new WorldBossController(this);
    this.overlayController = new WorldOverlayController(this);
    this.renderController = new WorldRenderController(this);
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
        if (this.debugForcePauseOnLoad) {
      this.handlePauseToggle();
    }
  }

  
  getObjectBox(object) {
    return this.renderController.getObjectBox(object);
  }

  draw() {
    this.renderController.draw();
  }

  updateCamera() {
    this.cameraController.updateCamera();
  }

  focusCameraOnActor(actor) {
    this.cameraController.focusCameraOnActor(actor);
  }

  getCameraBounds() {
    return this.cameraController.getCameraBounds();
  }

  clamp(value, min, max) {
    return this.cameraController.clamp(value, min, max);
  }

  updateBossIntro(now = Date.now()) {
    this.bossController.updateBossIntro(now);
  }

  startBossIntro(now = Date.now()) {
    this.bossController.startBossIntro(now);
  }

  finishBossIntro() {
    this.bossController.finishBossIntro();
  }

  findBossIntroActor() {
    return this.bossController.findBossIntroActor();
  }

  freezeGameplay(durationMs, actor = null, now = Date.now()) {
    this.bossController.freezeGameplay(durationMs, actor, now);
  }

  isGameplayFrozen(actor = null, now = Date.now()) {
    return this.bossController.isGameplayFrozen(actor, now);
  }

  isBossIntroActive() {
    return this.bossController.isBossIntroActive();
  }

  updateEnemyPlatformLocks() {
    this.renderController.updateEnemyPlatformLocks();
  }

  getBackgroundVerticalPadding() {
    return this.renderController.getBackgroundVerticalPadding();
  }

  updateMagicAttacks() {
    this.renderController.updateMagicAttacks();
  }

  addMagicAttack(attack) {
    this.renderController.addMagicAttack(attack);
  }

  addObjToMap(objects) {
    this.renderController.addObjToMap(objects);
  }

  addToMap(drawableObject) {
    this.renderController.addToMap(drawableObject);
  }

  mirrorObjectIfNeeded(movableObject) {
    return this.renderController.mirrorObjectIfNeeded(movableObject);
  }

  handlePauseToggle() {
    if (this.pause) {
      this.resumeGame();
    } else {
      this.pauseGame()
      this.playPauseMenuUi();
    }
  }

  playPauseMenuUi() {
    if (this.pause) {
      this.overlayController.playPauseMenuUi();
    }
  }

  pauseGame() {
    this.pause = true;
  }

  resumeGame() {
    this.pause = false;
    this.draw();
  }

  handleGameOver() {
    console.log("Game Over");
    this.pauseGame();
    this.playGameOverUi();
  }

  playGameOverUi() {
    this.overlayController.playGameOverUi();
  }

  playWinUi() {
    this.overlayController.playWinUi();
  }

  handleEnemyDefeat(enemy) {
    if (!this.isWinConditionEnemy(enemy) || this.hasLevelWon) {
      return;
    }

    this.pendingWinEnemy = enemy;
  }

  handleEnemyRemoved(enemy) {
    if (this.hasLevelWon) {
      return;
    }

    const isPendingWinEnemy = this.pendingWinEnemy && enemy === this.pendingWinEnemy;
    if (!isPendingWinEnemy && !this.isWinConditionEnemy(enemy)) {
      return;
    }

    this.pendingWinEnemy = null;
    this.hasLevelWon = true;
    this.pauseGame();
    this.playWinUi();
  }

  isWinConditionEnemy(enemy) {
    const expectedType = this.level?.winCondition?.enemyType;
    if (!expectedType || !enemy?.constructor?.name) {
      return false;
    }

    return enemy.constructor.name.toLowerCase() === expectedType.toLowerCase();
  }
}
