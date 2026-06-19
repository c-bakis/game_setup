export default class CharacterAnimator {
  constructor(character) {
    this.character = character;
  }

  updateAnimation(isMovingHorizontally, isAirborne, isHurt, now) {
    if (this.character.energy <= 0) {
      this.character.combat.finishAttack();
      this.playDeadAnimation();
      return;
    }

    if (this.character.combat.isBusy()) {
      this.character.combat.playAttackAnimation(now);
      return;
    }

    if (isHurt) {
      this.playHurtAnimation();
      return;
    }

    if (isAirborne) {
      this.playJumpAnimation();
      return;
    }

    if (isMovingHorizontally) {
      this.playRunAnimation();
      return;
    }

    this.playIdleAnimation();
  }

  playHurtAnimation() {
    this.switchAnimation("HURT");
    this.advanceOneShotAnimation(10);
  }

  playJumpAnimation() {
    this.switchAnimation("JUMP");
    this.advanceLoopingAnimation(8);
  }

  playRunAnimation() {
    this.switchAnimation("RUN");
    this.advanceLoopingAnimation(6);
  }

  playIdleAnimation() {
    this.switchAnimation("WALK");
    this.character.stopAnimation();
  }

  playDeadAnimation() {
    this.switchAnimation("DEAD");

    if (this.character.deathAnimationFinished) {
      this.character.spriteSheet.currentFrame =
        this.character.spriteSheet.frameCount - 1;
      return;
    }

    const finished = this.advanceOneShotAnimation(10);
    if (finished) {
      this.character.deathAnimationFinished = true;
      this.character.speedY = 0;
      this.character.handleGameOver();
    }
  }

  advanceLoopingAnimation(speed) {
    if (!this.character.spriteSheet) {
      return;
    }

    this.character.animationCounter++;
    if (this.character.animationCounter % speed !== 0) {
      return;
    }

    this.character.spriteSheet.currentFrame =
      (this.character.spriteSheet.currentFrame + 1) %
      this.character.spriteSheet.frameCount;
  }

  advanceOneShotAnimation(speed) {
    if (!this.character.spriteSheet) {
      return false;
    }

    this.character.animationCounter++;
    if (this.character.animationCounter % speed !== 0) {
      return false;
    }

    const lastFrame = this.character.spriteSheet.frameCount - 1;
    if (this.character.spriteSheet.currentFrame < lastFrame) {
      this.character.spriteSheet.currentFrame++;
      return false;
    }

    return true;
  }

  switchAnimation(name) {
    if (this.character.activeAnimation === name && this.character.spriteSheet) {
      return;
    }

    const config = this.character.SPRITE_ANIMATIONS[name];
    if (!config) {
      return;
    }

    this.character.activeAnimation = name;
    this.character.animationCounter = 0;
    this.character.spriteSheet = {
      frameWidth: config.frameWidth,
      frameHeight: config.frameHeight,
      frameCount: config.frameCount,
      currentFrame: 0,
    };
    this.character.img = this.character.imgCache[config.path];

    if (!this.character.img) {
      this.character.loadImage(config.path);
    }
  }
}
