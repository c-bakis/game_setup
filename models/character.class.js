import MovableObject from "./movable-object.class.js";

export default class Character extends MovableObject {
  speed = 10;

  SPRITE_ANIMATIONS = {
    WALK: {
      path: "img/character/wizard/Walk.png",
      frameWidth: 128,
      frameHeight: 128,
      frameCount: 7,
    },
    RUN: {
      path: "img/character/wizard/Run.png",
      frameWidth: 128,
      frameHeight: 128,
      frameCount: 8,
    },
    JUMP: {
      path: "img/character/wizard/Jump.png",
      frameWidth: 128,
      frameHeight: 128,
      frameCount: 11,
    },
    HURT: {
      path: "img/character/wizard/Hurt.png",
      frameWidth: 128,
      frameHeight: 128,
      frameCount: 4,
    },
    DEAD: {
      path: "img/character/wizard/Dead.png",
      frameWidth: 128,
      frameHeight: 128,
      frameCount: 4,
    },
  };

  currentImg = 0;
  animationCounter = 0;
  activeAnimation = "WALK";
  deathAnimationFinished = false;

  constructor() {
    super();
    this.hitboxOffsetX = 55;
    this.hitboxOffsetY = 75;
    this.hitboxWidth = 32;
    this.hitboxHeight = 100;

    const animationPaths = Object.values(this.SPRITE_ANIMATIONS).map(
      (config) => config.path,
    );
    this.loadImages(animationPaths);
    this.switchAnimation("WALK");

    this.animate();
    this.applyGravity();
  }

  switchAnimation(name) {
    if (this.activeAnimation === name && this.spriteSheet) {
      return;
    }

    const config = this.SPRITE_ANIMATIONS[name];
    if (!config) {
      return;
    }

    this.activeAnimation = name;
    this.animationCounter = 0;
    this.spriteSheet = {
      frameWidth: config.frameWidth,
      frameHeight: config.frameHeight,
      frameCount: config.frameCount,
      currentFrame: 0,
    };
    this.img = this.imgCache[config.path];

    if (!this.img) {
      this.loadImage(config.path);
    }
  }

  advanceSpriteAnimation(speed, shouldLoop = true) {
    if (!this.spriteSheet) {
      return;
    }

    this.animationCounter++;
    if (this.animationCounter % speed !== 0) {
      return;
    }

    const lastFrame = this.spriteSheet.frameCount - 1;
    if (shouldLoop) {
      this.spriteSheet.currentFrame =
        (this.spriteSheet.currentFrame + 1) % this.spriteSheet.frameCount;
      return;
    }

    if (this.spriteSheet.currentFrame < lastFrame) {
      this.spriteSheet.currentFrame++;
      return;
    }

    this.deathAnimationFinished = true;
    this.speedY = 0;
  }

  animate() {
    setInterval(() => {
      const isJumpPressed = this.world.keyboard.SPACE || this.world.keyboard.UP;
      const isAirborne = this.isAboveGround();
      const isHurt = this.isHurt();
      const previousX = this.x;

      this.getCharacterState(isJumpPressed, isAirborne, isHurt);
      const isMovingHorizontally = this.x !== previousX;
      this.getAnimationState(isMovingHorizontally, isAirborne, isHurt);

    }, 1000 / 60);
  }

  getCharacterState(isJumpPressed, isAirborne, isHurt) {
      if (this.energy <= 0) {
        this.speedY = 0;
        return;
      }

      if (!isAirborne && isJumpPressed) {
        this.jump(25);
      }

      if (this.world.keyboard.DOWN && this.isAboveGround()) {
        this.jump(-25);
      }

      if (this.world.keyboard.DOWN && !this.isAboveGround()) {
          this.resetPositionY(this.groundY);
      }

      if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
        this.moveCharacter();
      }
  }

  getAnimationState(isMovingHorizontally, isAirborne, isHurt) {
      if (this.energy <= 0) {
        this.playDeathAnimationOnce(10);
      } else if (isHurt) {
        this.switchAnimation("HURT");
        this.advanceSpriteAnimation(10, false);
      } else if (this.isAboveGround()) {
        this.switchAnimation("JUMP");
        this.advanceSpriteAnimation(8);
      } else if (isMovingHorizontally) {
        this.switchAnimation("RUN");
        this.advanceSpriteAnimation(6);
      } else {
        this.switchAnimation("WALK");
        this.stopAnimation();
      }
  }

  playDeathAnimationOnce(speed) {
    this.switchAnimation("DEAD");

    if (this.deathAnimationFinished) {
      this.spriteSheet.currentFrame = this.spriteSheet.frameCount - 1;
      return;
    }

    this.advanceSpriteAnimation(speed, false);
  }

  moveCharacter() {
    const worldEndX = this.world?.level?.levelEndX ?? Infinity;
    const maxCharacterX = worldEndX - this.width;

    if (this.world.keyboard.RIGHT && this.x < maxCharacterX) {
      this.moveRight();
      this.x = Math.min(this.x, maxCharacterX);
    }
    if (this.world.keyboard.LEFT && this.x >= 80 ) {
      this.moveLeft();
    }
  }

}