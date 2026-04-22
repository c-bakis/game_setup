import DrawableObject from "../core/drawableObject.class.js";

export default class Collectable extends DrawableObject {
    collected = false;
    activeAnimation = null;
    animationCounter = 0;
    hitboxOffsetX = 0;
    hitboxOffsetY = 0;
    hitboxWidth = this.width;
    hitboxHeight = this.height;

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

    drawBoundingBox(ctx) {
        const shouldDrawBoundingBox = this.constructor?.name === "ManaStone";

        if (!shouldDrawBoundingBox) {
            return;
        }

        const hitbox = this.getHitbox();
        ctx.beginPath();
        ctx.rect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 5;
        ctx.stroke();
    }

    switchAnimation(name) {
        if (this.activeAnimation === name && this.spriteSheet) {
            return;
        }

        const config = this.SPRITE_ANIMATIONS?.[name];
        if (!config) {
            return;
        }

        this.activeAnimation = name;
        this.animationCounter = 0;
        this.spriteSheet = {
            frameWidth: config.frameWidth,
            frameHeight: config.frameHeight,
            frameCount: config.frameCount,
            columns: config.columns ?? 1,
            startRow: config.startRow ?? 0,
            layout: config.layout ?? "row",
            currentFrame: 0,
        };
        this.img = this.imgCache[config.path];

        if (!this.img) {
            this.loadImage(config.path);
        }
    }

    advanceSpriteAnimation(speed) {
        if (!this.spriteSheet || !Number.isFinite(speed) || speed <= 0) {
            return;
        }

        this.animationCounter++;
        if (this.animationCounter % speed !== 0) {
            return;
        }

        this.spriteSheet.currentFrame =
            (this.spriteSheet.currentFrame + 1) % this.spriteSheet.frameCount;
    }

    onCollect(character) {
        // overridden in subclasses
    }

}