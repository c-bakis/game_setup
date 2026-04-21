import Tileset from "./tileset.class.js";
import Character from "./character.class.js";
import Keyboard from "./keyboard.class.js";
import LevelBuilder from "./level-builder.class.js";
import StatusBar from "./status-bar.class.js";

export default class World {
  backgroundObjects = [];
  tileset = [];
  enemies = [];
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
    this.fillTilesAcrossGround();
    this.draw();
  }

  checkCollisions() {
    const now = Date.now();

    this.enemies.forEach((enemy) => {
      const hasCollisionMethod =
        typeof this.character?.isCollidingWith === "function";
      const isColliding = hasCollisionMethod
        ? this.character.isCollidingWith(enemy)
        : this.isCollidingAABB(this.character, enemy);

      this.checkDemageOnCollision(enemy, isColliding, now);
    });
  }

  checkDemageOnCollision(enemy, isColliding, now) {
    if (!isColliding) {
      return;
    }

    if (typeof enemy?.canDealDamage === "function" && !enemy.canDealDamage()) {
      return;
    }

    const damage = Number.isFinite(enemy?.damage) ? enemy.damage : 10;
    const enemyBox = this.getObjectBox(enemy);
    const enemyCenterX = enemyBox.x + enemyBox.width / 2;
    const didTakeDamage = this.character.takeDamage(damage, now, enemyCenterX);
    if (didTakeDamage) {
      this.statusBar.setPercentage(this.character.energy, "health");
    }
  }


  isCollidingAABB(a, b) {
    const boxA = this.getObjectBox(a);
    const boxB = this.getObjectBox(b);

    return (
      boxA.x < boxB.x + boxB.width &&
      boxA.x + boxA.width > boxB.x &&
      boxA.y < boxB.y + boxB.height &&
      boxA.y + boxA.height > boxB.y
    );
  }

  getObjectBox(object) {
    return typeof object?.getHitbox === "function"
      ? object.getHitbox()
      : { x: object.x, y: object.y, width: object.width, height: object.height };
  }

  resolvePlatformGround() {
    const actor = this.character;
    if (!actor || typeof actor.getHitbox !== "function") {
      return;
    }

    actor.groundY = actor.defaultGroundY ?? actor.groundY;

    const actorHitbox = actor.getHitbox();
    const actorPreviousBottom = this.getActorPreviousBottom(actor);
    const actorCurrentBottom = actorHitbox.y + actorHitbox.height;
    const bestPlatform = this.findBestFloatingPlatform(
      actor,
      actorHitbox,
      actorPreviousBottom,
      actorCurrentBottom,
    );

    if (!bestPlatform) {
      return;
    }

    const platformGroundY = this.getPlatformGroundY(actor, bestPlatform);

    actor.groundY = platformGroundY;
    if (actor.y > platformGroundY) {
      actor.resetPositionY(platformGroundY);
    }
  }

  getActorPreviousBottom(actor) {
    return (
      (actor.previousY ?? actor.y) +
      (actor.hitboxOffsetY ?? 0) +
      (actor.hitboxHeight ?? actor.height)
    );
  }

  findBestFloatingPlatform(actor, actorHitbox, actorPreviousBottom, actorCurrentBottom) {
    const floatingPlatforms = this.tileset.filter((tile) => this.isFloatingTile(tile));

    return floatingPlatforms.reduce((best, platform) => {
      const platformBox = this.getObjectBox(platform);

      if (!this.isHorizontalOverlap(actorHitbox, platformBox)) {
        return best;
      }

      const landsNow = this.isLandingOnPlatform(actor, actorPreviousBottom, actorCurrentBottom, platformBox);
      const standsNow = this.isStandingOnPlatform(actorCurrentBottom, platformBox);
      if (!landsNow && !standsNow) {
        return best;
      }

      if (!best || platformBox.y < best.y) {
        return platformBox;
      }

      return best;
    }, null);
  }

  isHorizontalOverlap(actorHitbox, platformBox) {
    return (
      actorHitbox.x < platformBox.x + platformBox.width &&
      actorHitbox.x + actorHitbox.width > platformBox.x
    );
  }

  isLandingOnPlatform(actor, actorPreviousBottom, actorCurrentBottom, platformBox) {
    return (
      actor.speedY <= 0 &&
      actorPreviousBottom <= platformBox.y &&
      actorCurrentBottom >= platformBox.y
    );
  }

  isStandingOnPlatform(actorCurrentBottom, platformBox) {
    return Math.abs(actorCurrentBottom - platformBox.y) <= 6;
  }

  getPlatformGroundY(actor, platformBox) {
    return (
      platformBox.y -
      (actor.hitboxOffsetY ?? 0) -
      (actor.hitboxHeight ?? actor.height)
    );
  }

  draw() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    this.updateCamera();

    this.ctx.translate(this.camera_x, this.camera_y);

    this.resolvePlatformGround();
    this.addRepeatingBackgroundsToMap(this.backgroundObjects);
    this.addObjToMap(this.tileset);
    this.addToMap(this.character);
    this.updateEnemyPlatformLocks();
    this.addObjToMap(this.enemies);
    this.checkCollisions();
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

  addObjToMap(objects) {
    objects.forEach((obj) => {
      this.addToMap(obj);
    });
  }

  addRepeatingBackgroundsToMap(backgroundObjects) {
    backgroundObjects.forEach((backgroundObject) => {
      this.addRepeatingBackgroundToMap(backgroundObject);
    });
  }

  addRepeatingBackgroundToMap(backgroundObject) {
    if (!backgroundObject?.img) {
      return;
    }

    const drawRepeatedLayer = () => {
      const parallaxFactor = backgroundObject.parallaxFactor ?? 1;
      const parallaxCameraX = this.camera_x * parallaxFactor;
      const parallaxOffset = this.camera_x * (parallaxFactor - 1);
      const tileWidth = backgroundObject.width;
      const verticalPadding = this.getBackgroundVerticalPadding();
      const drawY = backgroundObject.y - verticalPadding;
      const drawHeight = backgroundObject.height + verticalPadding;
      const cameraWorldX = -parallaxCameraX;
      const startTileIndex =
        Math.floor((cameraWorldX - backgroundObject.x) / tileWidth) - 1;
      const tilesToDraw = Math.ceil(this.canvas.width / tileWidth) + 3;

      for (let i = 0; i < tilesToDraw; i++) {
        const tileX =
          backgroundObject.x +
          (startTileIndex + i) * tileWidth +
          parallaxOffset;
        this.ctx.drawImage(
          backgroundObject.img,
          tileX,
          drawY,
          backgroundObject.width,
          drawHeight,
        );
      }
    };

    if (
      backgroundObject.img.complete &&
      backgroundObject.img.naturalWidth > 0
    ) {
      drawRepeatedLayer();
    } else {
      backgroundObject.img.onload = () => {
        if (backgroundObject.img.naturalWidth > 0) {
          drawRepeatedLayer();
        }
      };
      backgroundObject.img.onerror = () =>
        console.error("Background image failed to load.");
    }
  }

  addToMap(movableObject) {
    if (!movableObject?.img) {
      return;
    }

    const isMirrored = this.mirrorObjectIfNeeded(movableObject);
    if (movableObject.img.complete && movableObject.img.naturalWidth > 0) {
      movableObject.draw(this.ctx);
      movableObject.drawBoundingBox(this.ctx);
    } else {
      movableObject.img.onload = () => {
        if (movableObject.img.naturalWidth > 0) {
          this.ctx.drawImage(
            movableObject.img,
            movableObject.x,
            movableObject.y,
            movableObject.width,
            movableObject.height,
          );
        }
      };
      movableObject.img.onerror = () =>
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

  fillTilesAcrossGround() {
    const baseTiles = [...this.tileset];
    const filledTiles = [];

    baseTiles.forEach((tile) => {
      const isGrassTile = tile.img.src.includes("grass");
      const stepX = isGrassTile ? tile.width - 0 : tile.width;

      if (this.shouldKeepSingleTile(tile)) {
        filledTiles.push(tile);
        return;
      }

      this.addRepeatingTiles(tile, stepX, filledTiles);
    });

    this.tileset = filledTiles;
  }

  shouldKeepSingleTile(tile) {
    return this.isFloatingTile(tile) || this.isSpikeTile(tile);
  }

  isFloatingTile(tile) {
    return tile.img.src.includes("floating");
  }

  isSpikeTile(tile) {
    return tile.img.src.includes("spikes");
  }

  addRepeatingTiles(tile, stepX, targetTiles) {
    for (let x = tile.x; x < this.canvas.width * 6; x += stepX) {
      targetTiles.push(
        new Tileset(tile.img.src, x, tile.y, tile.width, tile.height),
      );
    }
  }
}
