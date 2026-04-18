export default class MovableObject {
  x = 100;
  y = 320;
  height = 90;
  width = 50;
  speed = 0.15;
  speedY = 0;
  acceleration = 2.5;
  imgCache = {};
  otherDirection = false;

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
    this.img.src = this.IMAGES_WALKING[0];
  }

  draw(ctx) {
    if (this.img) {
      ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
  }

  drawBoundingBox(ctx) {
    const shouldDrawBoundingBox =
      this.constructor?.name === "Character" || this.constructor?.name === "Slime";

    if (shouldDrawBoundingBox) {
      ctx.beginPath();
      ctx.rect(this.x, this.y, this.width, this.height);
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 5;
      ctx.stroke();
    }
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

        if (this.y > 320) {
          this.resetPositionY(320);
        }
      }
    }, 1000 / 25);
  }

  isAboveGround() {
    return this.y < 320;
  }

  resetPositionY(numY) {
    this.y = numY;
    this.speedY = 0;
  }

  jump(speedY) {
    this.speedY = speedY;
  }

  constructor() {}
}
