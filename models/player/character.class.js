import MovableObject from "../core/movable-object.class.js";
import CharacterCombat from "./character-combat.class.js";
import CharacterAnimator from "./character-animator.class.js";

export default class Character extends MovableObject {
  speed = 10;
  attackDamage = 5;
  comboInputWindowMs = 850;
  mana = 20;
  maxMana = 100;
  experience = 0;
  maxExperience = 100;

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

  MAGIC_ATTACK = {
    ATTACK_1: { startFrame: 6, endFrame: 8 }
  };

  MAGIC_ATTACK_SEQUENCE = ["ATTACK_1"];

  currentImg = 0;
  animationCounter = 0;
  activeAnimation = "WALK";
  deathAnimationFinished = false;
  wasMagicAttackPressed = false;
  wasAttackPressed = false;
  combat;
  animator;

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
    this.combat = new CharacterCombat(this);
    this.animator = new CharacterAnimator(this);
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
      this.combat.handleAttackInput(now);
    }

    if (this.isMagicAttackPressedNow()) {
      this.combat.handleMagicAttackInput(now);
    }

    if (!this.combat.isBusy()) {
      this.handleMovementInput();
    }
  }

  isAttackPressedNow() {
    const isPressed = Boolean(this.world?.keyboard?.ATTACK);
    const pressedNow = isPressed && !this.wasAttackPressed;
    this.wasAttackPressed = isPressed;
    return pressedNow;
  }

  isMagicAttackPressedNow() {
    const isPressed = Boolean(this.world?.keyboard?.MAGIC_ATTACK);
    const pressedNow = isPressed && !this.wasMagicAttackPressed;
    this.wasMagicAttackPressed = isPressed;
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

  gainExperience(amount) {
  if (!Number.isFinite(amount)) {
    return this.experience;
  }

  this.experience = Math.min(this.maxExperience, this.experience + amount);
  const percentageExp = (this.experience / this.maxExperience) * 100;
  this.world?.statusBar?.setPercentage(percentageExp, "exp");
  return this.experience;
}

  // ─── Animation state machine ──────────────────────────────────────────────────

  updateAnimation(isMovingHorizontally, isAirborne, isHurt, now) {
    this.animator.updateAnimation(isMovingHorizontally, isAirborne, isHurt, now);
  }

  playHurtAnimation() {
    this.animator.playHurtAnimation();
  }

  playJumpAnimation() {
    this.animator.playJumpAnimation();
  }

  playRunAnimation() {
    this.animator.playRunAnimation();
  }

  playIdleAnimation() {
    this.animator.playIdleAnimation();
  }

  playDeadAnimation() {
    this.animator.playDeadAnimation();
  }

  // ─── Sprite sheet advancement ─────────────────────────────────────────────────

  advanceLoopingAnimation(speed) {
    this.animator.advanceLoopingAnimation(speed);
  }

  advanceOneShotAnimation(speed) {
    return this.animator.advanceOneShotAnimation(speed);
  }

  switchAnimation(name) {
    this.animator.switchAnimation(name);
  }

  draw(ctx) {
    const now = Date.now();

    if (this.isHitFlashing && now > this.hitFlashEndAt) {
      this.isHitFlashing = false;
    }

    if (this.isHitFlashing) {
      ctx.save();
      ctx.filter = "brightness(1.8)";
    }

    super.draw(ctx);

    if (this.isHitFlashing) {
      ctx.restore();
    }
  }

  // ─── Attack hit detection ─────────────────────────────────────────────────────

  isInAttackDamageFrame() {
    return this.combat.isInAttackDamageFrame();
  }

  canDealDamageToEnemy(enemy, isAttackColliding) {
    return this.combat.canDealDamageToEnemy(enemy, isAttackColliding);
  }

  registerEnemyHit(enemy) {
    this.combat.registerEnemyHit(enemy);
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

  handleGameOver() {
    this.world.handleGameOver();
  }

}

