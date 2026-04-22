export default class DrawableObject {
    x = 100;
    y = 100;
    width = 100;
    height = 100;
    img;
    imgCache = {};
    currentImg = 0;

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

  draw(ctx) {
    if (this.spriteSheet && this.img) {
      this.drawSpriteFrame(ctx);
      return;
    }

    if (this.img) {
      ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
  }

  drawSpriteFrame(ctx) {
    const { frameWidth, frameHeight } = this.spriteSheet;
    const currentFrame = this.resolveCurrentFrame();
    const { frameX, frameY } = this.resolveFramePosition(currentFrame);

    ctx.drawImage(this.img, frameX, frameY, frameWidth, frameHeight, this.x, this.y, this.width, this.height);
  }

  resolveCurrentFrame() {
    const frameCount = this.spriteSheet.frameCount;
    return Math.max(0, Math.min(this.spriteSheet.currentFrame ?? 0, frameCount - 1));
  }

  resolveFramePosition(currentFrame) {
    const { frameWidth, frameHeight } = this.spriteSheet;
    const layout = this.spriteSheet.layout ?? "row";
    const columns = this.spriteSheet.columns ?? 1;

    if (columns > 1) {
      return this.resolveGridPosition(currentFrame, frameWidth, frameHeight, columns);
    }

    return {
      frameX: layout === "column" ? 0 : currentFrame * frameWidth,
      frameY: layout === "column" ? currentFrame * frameHeight : 0,
    };
  }

  resolveGridPosition(currentFrame, frameWidth, frameHeight, columns) {
    return {
      frameX: (currentFrame % columns) * frameWidth,
      frameY: Math.floor(currentFrame / columns) * frameHeight + (this.spriteSheet.startRow ?? 0) * frameHeight,
    };
  }

}