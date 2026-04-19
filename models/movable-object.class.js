export default class MovableObject {
  x = 100;
  y = 230;
  groundY = 230;
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
  imgCache = {};
  otherDirection = false;
  isDefeated = false;

  loadImage(path) {
    this.img = new Image();
    this.img.src = path;
  }

  loadImages(arr) {
    arr.forEach((path) => {
      const img = new Image();
      img.src = path;
      this.imgCache[path] = img;
    });
  }

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

  draw(ctx) {
    if (this.spriteSheet && this.img) {
      const frameWidth = this.spriteSheet.frameWidth;
      const frameHeight = this.spriteSheet.frameHeight;
      const frameCount = this.spriteSheet.frameCount;
      const currentFrame = Math.max(
        0,
        Math.min(this.spriteSheet.currentFrame ?? 0, frameCount - 1),
      );
      const frameX = currentFrame * frameWidth;

      ctx.drawImage(
        this.img,
        frameX,
        0,
        frameWidth,
        frameHeight,
        this.x,
        this.y,
        this.width,
        this.height,
      );
      return;
    }

    if (this.img) {
      ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
  }

  drawBoundingBox(ctx) {
    const shouldDrawBoundingBox =
      this.constructor?.name === "Character" || this.constructor?.name === "Slime";

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


  isAboveGround() {
    return this.y < this.groundY;
  }

  resetPositionY(numY) {
    this.y = numY;
    this.speedY = 0;
  }

  jump(speedY) {
    this.speedY = speedY;
  }

  isDefeated() {
    if (this.energy === 0) {
      this.isDefeated = true;
      this.stopAnimation();
      this.initiateAnimation(10, this.IMAGES_DYING);
    }
  }

  constructor() {}
}
