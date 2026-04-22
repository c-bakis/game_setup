import MovableObject from "../core/movable-object.class.js";

export default class Character extends MovableObject {
  speed = 10;
  attackDamage = 5;
  comboInputWindowMs = 850;
  mana = 20;
  maxMana = 100;

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
    ATTACK_1: {
      path: "img/character/wizard/Attack_1.png",
      frameWidth: 128,
      frameHeight: 128,
      frameCount: 10,
    },
    ATTACK_2: {
      path: "img/character/wizard/Attack_2.png",
      frameWidth: 128,
      frameHeight: 128,
      frameCount: 4,
    },
    ATTACK_3: {
      path: "img/character/wizard/Attack_3.png",
      frameWidth: 128,
      frameHeight: 128,
      frameCount: 7,
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

  ATTACK_DAMAGE_WINDOWS = {
    ATTACK_1: { startFrame: 6, endFrame: 8 },
    ATTACK_2: { startFrame: 2, endFrame: 3 },
    ATTACK_3: { startFrame: 4, endFrame: 6 },
  };

  ATTACK_SEQUENCE = ["ATTACK_1", "ATTACK_2", "ATTACK_3"];

  currentImg = 0;
  animationCounter = 0;
  activeAnimation = "WALK";
  deathAnimationFinished = false;
  attackActive = false;
  currentAttackName = null;
  queuedAttackName = null;
  comboExpiresAt = 0;
  wasAttackPressed = false;
  hitEnemiesThisAttack = new Set();

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

  // ─── Main loop ───────────────────────────────────────────────────────────────

  animate() {
    setInterval(() => this.tick(), 1000 / 60);
  }

  tick() {
    if (!this.world?.keyboard) {
      return;
    }

    const now = Date.now();
    const previousX = this.x;

    this.handleInput(now);
    const isMovingHorizontally = this.x !== previousX;
    this.updateAnimation(isMovingHorizontally, this.isAboveGround(), this.isHurt(), now);
  }

  // ─── Input handling ───────────────────────────────────────────────────────────

  handleInput(now) {
    if (this.isAttackPressedNow()) {
      this.handleAttackInput(now);
    }

    if (!this.attackActive) {
      this.handleMovementInput();
    }
  }

  isAttackPressedNow() {
    const isPressed = Boolean(this.world?.keyboard?.ATTACK);
    const pressedNow = isPressed && !this.wasAttackPressed;
    this.wasAttackPressed = isPressed;
    return pressedNow;
  }

  handleMovementInput() {
    if (this.energy <= 0) {
      this.speedY = 0;
      return;
    }

    this.handleJumpInput();
    this.handleFallInput();
    this.handleHorizontalInput();
  }

  handleJumpInput() {
    const isJumpPressed = this.world.keyboard.SPACE || this.world.keyboard.UP;
    if (!this.isAboveGround() && isJumpPressed) {
      this.jump(25);
    }
  }

  handleFallInput() {
    if (!this.world.keyboard.DOWN) {
      return;
    }

    if (this.isAboveGround()) {
      this.jump(-25);
    } else {
      this.resetPositionY(this.groundY);
    }
  }

  handleHorizontalInput() {
    if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
      this.moveCharacter();
    }
  }

  moveCharacter() {
    const worldEndX = this.world?.level?.levelEndX ?? Infinity;
    const maxCharacterX = worldEndX - this.width;

    if (this.world.keyboard.RIGHT && this.x < maxCharacterX) {
      this.moveRight();
      this.x = Math.min(this.x, maxCharacterX);
    }

    if (this.world.keyboard.LEFT && this.x >= 80) {
      this.moveLeft();
    }
  }

  increaseMana(amount) {
    if (!Number.isFinite(amount)) {
      return this.mana;
    }

    this.mana = Math.min(this.maxMana, this.mana + amount);
    return this.mana;
  }

  // ─── Attack combo logic ───────────────────────────────────────────────────────

  handleAttackInput(now) {
    if (this.energy <= 0) {
      return;
    }

    if (!this.attackActive) {
      this.startAttack("ATTACK_1", now);
      return;
    }

    if (now <= this.comboExpiresAt) {
      this.queueNextComboAttack();
    }
  }

  queueNextComboAttack() {
    const nextAttackName = this.getNextAttackName(this.currentAttackName);
    if (nextAttackName) {
      this.queuedAttackName = nextAttackName;
    }
  }

  getNextAttackName(attackName) {
    const index = this.ATTACK_SEQUENCE.indexOf(attackName);
    const hasNext = index !== -1 && index < this.ATTACK_SEQUENCE.length - 1;
    return hasNext ? this.ATTACK_SEQUENCE[index + 1] : null;
  }

  startAttack(attackName, now) {
    this.attackActive = true;
    this.currentAttackName = attackName;
    this.queuedAttackName = null;
    this.comboExpiresAt = now + this.comboInputWindowMs;
    this.hitEnemiesThisAttack.clear();
    this.switchAnimation(attackName);
  }

  finishAttack() {
    this.attackActive = false;
    this.currentAttackName = null;
    this.queuedAttackName = null;
    this.comboExpiresAt = 0;
    this.hitEnemiesThisAttack.clear();
  }

  // ─── Animation state machine ──────────────────────────────────────────────────

  updateAnimation(isMovingHorizontally, isAirborne, isHurt, now) {
    if (this.energy <= 0) {
      this.finishAttack();
      this.playDeadAnimation();
      return;
    }

    if (this.attackActive) {
      this.playAttackAnimation(now);
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

  playAttackAnimation(now) {
    this.switchAnimation(this.currentAttackName);
    const finished = this.advanceOneShotAnimation(5);
    if (!finished) {
      return;
    }

    if (this.queuedAttackName && now <= this.comboExpiresAt) {
      this.startAttack(this.queuedAttackName, now);
    } else {
      this.finishAttack();
    }
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
    this.stopAnimation();
  }

  playDeadAnimation() {
    this.switchAnimation("DEAD");

    if (this.deathAnimationFinished) {
      this.spriteSheet.currentFrame = this.spriteSheet.frameCount - 1;
      return;
    }

    const finished = this.advanceOneShotAnimation(10);
    if (finished) {
      this.deathAnimationFinished = true;
      this.speedY = 0;
    }
  }

  // ─── Sprite sheet advancement ─────────────────────────────────────────────────

  advanceLoopingAnimation(speed) {
    if (!this.spriteSheet) {
      return;
    }

    this.animationCounter++;
    if (this.animationCounter % speed !== 0) {
      return;
    }

    this.spriteSheet.currentFrame =
      (this.spriteSheet.currentFrame + 1) % this.spriteSheet.frameCount;
  }

  advanceOneShotAnimation(speed) {
    if (!this.spriteSheet) {
      return false;
    }

    this.animationCounter++;
    if (this.animationCounter % speed !== 0) {
      return false;
    }

    const lastFrame = this.spriteSheet.frameCount - 1;
    if (this.spriteSheet.currentFrame < lastFrame) {
      this.spriteSheet.currentFrame++;
      return false;
    }

    return true;
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

  // ─── Attack hit detection ─────────────────────────────────────────────────────

  isInAttackDamageFrame() {
    if (!this.attackActive || !this.currentAttackName || !this.spriteSheet) {
      return false;
    }

    const window = this.ATTACK_DAMAGE_WINDOWS[this.currentAttackName];
    if (!window) {
      return false;
    }

    const frameNumber = (this.spriteSheet.currentFrame ?? 0) + 1;
    return frameNumber >= window.startFrame && frameNumber <= window.endFrame;
  }

  canDealDamageToEnemy(enemy, isAttackColliding) {
    if (!isAttackColliding || !this.isInAttackDamageFrame()) {
      return false;
    }

    return !this.hitEnemiesThisAttack.has(enemy);
  }

  registerEnemyHit(enemy) {
    this.hitEnemiesThisAttack.add(enemy);
  }

  getAttackHitbox() {
    const reachX = 40;
    const reachY = 20;
    const w = (this.hitboxWidth ?? this.width) + reachX;
    const h = (this.hitboxHeight ?? this.height) - reachY;
    const offsetX = this.otherDirection
      ? (this.hitboxOffsetX ?? 0) - reachX
      : this.hitboxOffsetX ?? 0;
    const offsetY = (this.hitboxOffsetY ?? 0) + reachY / 2;

    return {
      x: this.x + offsetX,
      y: this.y + offsetY,
      width: w,
      height: h,
    };
  }
}

