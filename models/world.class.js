import Tileset from "./tileset.class.js";
import Character from "./character.class.js";
import Keyboard from "./keyboard.class.js";
import LevelBuilder from "./level-builder.class.js";

export default class World {
  backgroundObjects = [];
  tileset = [];
  enemies = [];
  character = new Character();
  canvas;
  ctx;
  keyboard;
  camera_x = 0;
  cameraDeadZone = 150;
  cameraAnchorX = 0;
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
    if (typeof level?.spawn?.x === "number") {
      this.character.x = level.spawn.x;
    }
    if (typeof level?.spawn?.y === "number") {
      this.character.y = level.spawn.y;
    }
    this.character.world = this;
    this.cameraAnchorX = this.character.x;
    this.camera_x = -this.character.x;
    this.fillTilesAcrossGround();
    this.draw();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    this.updateCamera();

    this.ctx.translate(this.camera_x, 0);

    this.addRepeatingBackgroundsToMap(this.backgroundObjects);
    this.addObjToMap(this.tileset);
    this.addToMap(this.character);
    this.addObjToMap(this.enemies);
    this.ctx.translate(-this.camera_x, 0);
    requestAnimationFrame(() => this.draw());
  }

  updateCamera() {
    const deltaFromAnchor = this.character.x - this.cameraAnchorX;

    if (deltaFromAnchor > this.cameraDeadZone) {
      this.camera_x = -(this.character.x - this.cameraDeadZone);
      return;
    }

    if (deltaFromAnchor < -this.cameraDeadZone) {
      this.camera_x = -(this.character.x + this.cameraDeadZone);
      return;
    }

    this.camera_x = -this.cameraAnchorX;
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
          backgroundObject.y,
          backgroundObject.width,
          backgroundObject.height,
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
