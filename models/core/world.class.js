import Tileset from "../environment/tileset.class.js";
import Character from "../player/character.class.js";
import Keyboard from "./keyboard.class.js";
import LevelBuilder from "./level-builder.class.js";
import StatusBar from "../ui/status-bar.class.js";
import CollisionSystem from "../systems/collision-system.class.js";
import BackgroundRenderer from "../systems/background-renderer.class.js";
import PlattformGroundResolver from "../systems/plattform-ground-resolver.class.js";

export default class World {
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
  level;

  constructor(canvas, level) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.level = level;
    this.keyboard = new Keyboard();
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
  }

  
  getObjectBox(object) {
    return typeof object?.getHitbox === "function"
      ? object.getHitbox()
      : {
          x: object.x,
          y: object.y,
          width: object.width,
          height: object.height,
        };
  }

  draw() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    this.updateCamera();

    this.ctx.translate(this.camera_x, this.camera_y);

    this.plattformGroundResolver.resolvePlatformGround();
    this.backgroundRenderer.drawAll(this.backgroundObjects);
    // this.addRepeatingBackgroundsToMap(this.backgroundObjects);
    this.addObjToMap(this.tileset);
    this.addObjToMap(this.decorations);
    this.addObjToMap(this.collectables);
    this.updateMagicAttacks();
    this.addObjToMap(this.magicAttacks);
    this.addToMap(this.character);
    this.updateEnemyPlatformLocks();
    this.addObjToMap(this.enemies);
    this.collisionSystem.run(Date.now());
    this.ctx.translate(-this.camera_x, -this.camera_y);
    this.statusBar.draw(this.ctx);
    requestAnimationFrame(() => this.draw());
  }

  updateCamera() {
    const deltaFromAnchor = this.character.x - this.cameraAnchorX;
    const deltaYUp = this.cameraAnchorY - this.character.y;
    let nextCameraX = -this.cameraAnchorX;
    let nextCameraY = 0;

    if (deltaFromAnchor > this.cameraDeadZone) {
      nextCameraX = -(this.character.x - this.cameraDeadZone);
    } else if (deltaFromAnchor < -this.cameraDeadZone) {
      nextCameraX = -(this.character.x + this.cameraDeadZone);
    }

    const bounds = this.getCameraBounds();
    this.camera_x = this.clamp(nextCameraX, bounds.min, bounds.max);

    if (deltaYUp > this.cameraDeadZoneY) {
      nextCameraY = deltaYUp - this.cameraDeadZoneY;
    }
    this.camera_y = this.clamp(nextCameraY, 0, this.cameraMaxUp);
  }

  getCameraBounds() {
    const max = -this.cameraAnchorX;
    const levelEndX = this.level?.levelEndX;

    if (!Number.isFinite(levelEndX) || !Number.isFinite(this.canvas?.width)) {
      return { min: -Infinity, max };
    }

    const min = Math.min(max, this.canvas.width - levelEndX);
    return { min, max };
  }

  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  updateEnemyPlatformLocks() {
    this.enemies.forEach((enemy) => {
      if (typeof enemy.updatePlatformLock === "function") {
        enemy.updatePlatformLock(this.tileset);
      }
    });
  }

  getBackgroundVerticalPadding() {
    return Math.max(0, this.cameraMaxUp);
  }

  updateMagicAttacks() {
    this.magicAttacks = this.magicAttacks.filter((attack) => {
      if (!attack || attack.isConsumed) {
        return false;
      }

      if (typeof attack?.update === "function") {
        attack.update();
      }

      const levelEndX = this.level?.levelEndX ?? Infinity;
      const isOutOnRight = attack.x > levelEndX + 120;
      const isOutOnLeft = attack.x + attack.width < -120;
      return !isOutOnRight && !isOutOnLeft;
    });
  }

  addMagicAttack(attack) {
    if (!attack) {
      return;
    }

    this.magicAttacks.push(attack);
  }

  addObjToMap(objects) {
    objects.forEach((obj) => {
      this.addToMap(obj);
    });
  }

  addToMap(drawableObject) {
    if (!drawableObject?.img) {
      return;
    }

    const isMirrored = this.mirrorObjectIfNeeded(drawableObject);
    if (drawableObject.img.complete && drawableObject.img.naturalWidth > 0) {
      drawableObject.draw(this.ctx);
      if (typeof drawableObject.drawBoundingBox === "function") {
        drawableObject.drawBoundingBox(this.ctx);
      }
    } else {
      drawableObject.img.onload = () => {
        if (drawableObject.img.naturalWidth > 0) {
          this.ctx.drawImage(
            drawableObject.img,
            drawableObject.x,
            drawableObject.y,
            drawableObject.width,
            drawableObject.height,
          );
        }
      };
      drawableObject.img.onerror = () =>
        console.error("Movable object image failed to load.");
    }
    if (isMirrored) {
      this.ctx.restore();
    }
  }

  mirrorObjectIfNeeded(movableObject) {
    if (!movableObject.otherDirection) {
      return false;
    }

    this.ctx.save();
    this.ctx.translate(movableObject.x + movableObject.width / 2, 0);
    this.ctx.scale(-1, 1);
    this.ctx.translate(-movableObject.x - movableObject.width / 2, 0);
    return true;
  }
}
