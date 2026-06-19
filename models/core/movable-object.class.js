import DrawableObject from "./drawableObject.class.js";

export default class MovableObject extends DrawableObject {
  x = 100;
  y = 230;
  groundY = 230;
  defaultGroundY = 230;
  previousY = 230;
  height = 180;
  width = 150;
  hitboxOffsetX = 0;
  hitboxOffsetY = 0;
  hitboxWidth = this.width;
  hitboxHeight = this.height;
  speed = 0.15;
  speedY = 0;
  acceleration = 2.5;
  energy = 100;
  lastHitAt = 0;
  hurtDuration = 1000;
  knockbackDistance = 18;
  damageWindowStartFrame = null;
  damageWindowEndFrame = null;
  damageWindowAnimation = null;
  isHitFlashing = false;
  hitFlashEndAt = 0;
  imgCache = {};
  otherDirection = false;
  isDefeated = false;

  stopAnimation() {
    this.animationCounter = 0;
    this.currentImg = 0;

    if (this.spriteSheet) {
      this.spriteSheet.currentFrame = 0;
      return;
    }

    if (Array.isArray(this.IMAGES_WALKING) && this.IMAGES_WALKING.length > 0) {
      this.img.src = this.IMAGES_WALKING[0];
    }
  }

  drawBoundingBox(ctx) {
    const shouldDrawBoundingBox =
      this.constructor?.name === "Character" ||
      this.constructor?.name === "Slime" ||
      this.constructor?.name === "PredatorPlant" ||
      this.constructor?.name === "Spider" ||
      this.constructor?.name === "Wolf" ||
      this.constructor?.name === "Tileset";

    if (shouldDrawBoundingBox) {
      const hitbox = this.getHitbox();
      ctx.beginPath();
      ctx.rect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 5;
      ctx.stroke();
    }
  }

  getHitbox() {
    const width = this.hitboxWidth ?? this.width;
    const height = this.hitboxHeight ?? this.height;
    const offsetX = this.hitboxOffsetX ?? 0;
    const offsetY = this.hitboxOffsetY ?? 0;

    return {
      x: this.x + offsetX,
      y: this.y + offsetY,
      width,
      height,
    };
  }

  initiateAnimation(num, images) {
    this.animationCounter++;
    if (this.animationCounter % num === 0) {
      this.playAnimation(images);
    }
  }

  playAnimation(images) {
    const i = this.currentImg % images.length;
    const path = images[i];
    this.img.src = path;
    this.currentImg++;
  }

  moveRight() {
    this.x += this.speed;
    this.otherDirection = false;
  }

  moveLeft() {
    this.x -= this.speed;
    this.otherDirection = true;
  }

  applyGravity() {
    setInterval(() => {
      this.previousY = this.y;

      if (this.isAboveGround() || this.speedY > 0) {
        this.y -= this.speedY;
        this.speedY -= this.acceleration;

        if (this.y > this.groundY) {
          this.resetPositionY(this.groundY);
        }
      }
    }, 1000 / 25);
  }

  isCollidingWith(object) {
    const a = this.getHitbox();
    const b = typeof object?.getHitbox === "function"
      ? object.getHitbox()
      : {
          x: object.x,
          y: object.y,
          width: object.width,
          height: object.height,
        };

    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  takeDamage(damage = 10, now = Date.now(), sourceX = null) {
    const timeSinceLastHit = now - this.lastHitAt;
    const canTakeDamage = timeSinceLastHit >= this.hurtDuration;
    if (!canTakeDamage || this.isDefeated) {
      return false;
    }

    this.energy = Math.max(0, this.energy - damage);
    this.lastHitAt = now;
    this.applyKnockback(sourceX);
    this.isHitFlashing = true;
    this.hitFlashEndAt = now + 150;
    return true;
  }

  applyKnockback(sourceX) {
    if (!Number.isFinite(sourceX) || !Number.isFinite(this.knockbackDistance)) {
      return;
    }

    const thisCenterX = this.x + this.width / 2;
    const direction = thisCenterX < sourceX ? -1 : 1;
    const nextX = this.x + direction * this.knockbackDistance;

    if (this.constructor?.name === "Character") {
      const minX = 80;
      const worldEndX = this.world?.level?.levelEndX ?? Infinity;
      const maxX = worldEndX - this.width;
      this.x = Math.max(minX, Math.min(nextX, maxX));
      return;
    }

    this.x = nextX;
  }

  isAboveGround() {
    return this.y < this.groundY;
  }

  isHurt() {
    return Date.now() - this.lastHitAt < this.hurtDuration;
  }

  resetPositionY(numY) {
    this.y = numY;
    this.speedY = 0;
  }

  jump(speedY) {
    this.speedY = speedY;
  }

  canDealDamage() {
    const hasStart = Number.isFinite(this.damageWindowStartFrame);
    const hasEnd = Number.isFinite(this.damageWindowEndFrame);

    if (!hasStart || !hasEnd) {
      return true;
    }

    if (this.damageWindowAnimation && this.activeAnimation !== this.damageWindowAnimation) {
      return false;
    }

    if (!this.spriteSheet) {
      return false;
    }

    const frameNumber = (this.spriteSheet.currentFrame ?? 0) + 1;
    return (
      frameNumber >= this.damageWindowStartFrame &&
      frameNumber <= this.damageWindowEndFrame
    );
  }

  isDefeated() {
    if (this.energy === 0) {
      this.isDefeated = true;
      this.stopAnimation();
      this.initiateAnimation(10, this.IMAGES_DYING);
    }
  }
}
    
