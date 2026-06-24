export default class WorldBossController {
  constructor(world) {
    this.world = world;
  }

  updateBossIntro(now = Date.now()) {
    if (!this.world.level?.bossIntro) {
      return;
    }

    if (this.world.bossIntroState.active) {
      if (now >= this.world.bossIntroState.endsAt) {
        this.finishBossIntro();
      }
      return;
    }

    if (this.world.bossIntroState.played) {
      return;
    }

    const triggerX = this.world.level.bossIntro.triggerX;
    if (!Number.isFinite(triggerX) || this.world.character.x < triggerX) {
      return;
    }

    this.startBossIntro(now);
  }

  startBossIntro(now = Date.now()) {
    const actor = this.findBossIntroActor();
    if (!actor) {
      this.world.bossIntroState.played = true;
      return;
    }

    const durationMs = this.world.level?.bossIntro?.durationMs ?? 1800;
    const audioPath = this.world.level?.bossIntro?.audioPath ?? null;
    this.world.bossIntroState = {
      active: true,
      played: true,
      actor,
      endsAt: now + durationMs,
    };
    this.freezeGameplay(durationMs, actor, now);
    if (typeof actor.startBossIntro === "function") {
      actor.startBossIntro(audioPath);
    }
  }

  finishBossIntro() {
    const actor = this.world.bossIntroState.actor;
    if (typeof actor?.finishBossIntro === "function") {
      actor.finishBossIntro();
    }

    this.world.bossIntroState = {
      ...this.world.bossIntroState,
      active: false,
      actor: null,
      endsAt: 0,
    };
    this.world.focusedScriptActor = null;
    this.world.gameplayFreezeUntil = 0;
  }

  findBossIntroActor() {
    const enemyType = this.world.level?.bossIntro?.enemyType;
    if (!enemyType) {
      return null;
    }

    return this.world.enemies.find((enemy) => {
      return enemy?.constructor?.name?.toLowerCase() === enemyType.toLowerCase();
    }) ?? null;
  }

  freezeGameplay(durationMs, actor = null, now = Date.now()) {
    this.world.gameplayFreezeUntil = now + durationMs;
    this.world.focusedScriptActor = actor;
  }

  isGameplayFrozen(actor = null, now = Date.now()) {
    if (this.world.pause) {
      return true;
    }

    const isFrozen = now < this.world.gameplayFreezeUntil;
    if (!isFrozen) {
      return false;
    }

    if (actor && actor === this.world.focusedScriptActor) {
      return false;
    }

    return true;
  }

  isBossIntroActive() {
    return this.world.bossIntroState.active;
  }
}