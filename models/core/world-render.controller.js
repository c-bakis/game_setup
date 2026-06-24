export default class WorldRenderController {
  constructor(world) {
    this.world = world;
  }

  draw() {
    this.world.ctx.clearRect(0, 0, this.world.ctx.canvas.width, this.world.ctx.canvas.height);

    this.world.updateBossIntro();
    this.world.updateCamera();

    this.world.ctx.translate(this.world.camera_x, this.world.camera_y);

    this.world.plattformGroundResolver.resolvePlatformGround();
    this.world.backgroundRenderer.drawAll(this.world.backgroundObjects);
    this.addObjToMap(this.world.tileset);
    this.addObjToMap(this.world.decorations);
    this.addObjToMap(this.world.collectables);
    if (!this.world.isGameplayFrozen()) {
      this.updateMagicAttacks();
    }
    this.addObjToMap(this.world.magicAttacks);
    this.addToMap(this.world.character);
    if (!this.world.isGameplayFrozen()) {
      this.updateEnemyPlatformLocks();
    }
    this.addObjToMap(this.world.enemies);
    if (!this.world.isGameplayFrozen()) {
      this.world.collisionSystem.run(Date.now());
    }

    this.world.ctx.translate(-this.world.camera_x, -this.world.camera_y);
    this.world.statusBar.draw(this.world.ctx);
    if (this.world.pause) {
      return;
    }

    requestAnimationFrame(() => this.draw());
  }

  updateEnemyPlatformLocks() {
    this.world.enemies.forEach((enemy) => {
      if (typeof enemy.updatePlatformLock === "function") {
        enemy.updatePlatformLock(this.world.tileset);
      }
    });
  }

  getBackgroundVerticalPadding() {
    return Math.max(0, this.world.cameraMaxUp);
  }

  updateMagicAttacks() {
    this.world.magicAttacks = this.world.magicAttacks.filter((attack) => {
      if (!attack || attack.isConsumed) {
        return false;
      }

      if (typeof attack?.update === "function") {
        attack.update();
      }

      const levelEndX = this.world.level?.levelEndX ?? Infinity;
      const isOutOnRight = attack.x > levelEndX + 120;
      const isOutOnLeft = attack.x + attack.width < -120;
      return !isOutOnRight && !isOutOnLeft;
    });
  }

  addMagicAttack(attack) {
    if (!attack) {
      return;
    }

    this.world.magicAttacks.push(attack);
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
      drawableObject.draw(this.world.ctx);
      if (typeof drawableObject.drawBoundingBox === "function") {
        drawableObject.drawBoundingBox(this.world.ctx);
      }
    } else {
      drawableObject.img.onload = () => {
        if (drawableObject.img.naturalWidth > 0) {
          this.world.ctx.drawImage(
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
      this.world.ctx.restore();
    }
  }

  mirrorObjectIfNeeded(movableObject) {
    if (!movableObject.otherDirection) {
      return false;
    }

    this.world.ctx.save();
    this.world.ctx.translate(movableObject.x + movableObject.width / 2, 0);
    this.world.ctx.scale(-1, 1);
    this.world.ctx.translate(-movableObject.x - movableObject.width / 2, 0);
    return true;
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
}