import MovableObject from "../core/movable-object.class.js";

export default class Spider extends MovableObject {
    damage = 10;
    energy = 10;
    damageWindowStartFrame = 0;
    damageWindowEndFrame = 7;
    damageWindowAnimation = "ATTACK";
    acceleration = 0;
    groundY = 100;
    defaultGroundY = 100;
    lockedY = null;
    platformYOffset = 0;

    SPRITE_ANIMATIONS = {
        ATTACK: {
            path: "img/enemies/spider/spider11.png",
            frameWidth: 64,
            frameHeight: 64,
            frameCount: 8,
            columns: 8,
            startRow: 2,
        },
    };

    activeAnimation = "ATTACK";
    animationCounter = 0;

    constructor() {
        super();
        this.x = 1200;
        this.y = 100;
        this.width = 96;
        this.height = 96;
        this.hitboxOffsetX = 20;
        this.hitboxOffsetY = 20;
        this.hitboxWidth = 56;
        this.hitboxHeight = 55;
        this.speed = 0;
        const animationPaths = Object.values(this.SPRITE_ANIMATIONS).map(
            (config) => config.path,
        );
        this.loadImages(animationPaths);
        this.switchAnimation("ATTACK");

        this.animate();
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

    draw(ctx) {
        this.drawThread(ctx);
        super.draw(ctx);
    }

    drawThread(ctx) {
        const x = this.x + this.width / 2;
        const y = this.y + this.hitboxOffsetY;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, y);
        ctx.strokeStyle = "rgba(220, 220, 240, 0.55)";
        ctx.lineWidth = 0.8;
        ctx.setLineDash([4, 6]);
        ctx.lineDashOffset = this.animationCounter * 0.4;
        ctx.stroke();
        ctx.restore();
    }

    animate() {
        setInterval(() => {
            this.updatePlatformLock();
            this.switchAnimation("ATTACK");
            this.advanceSpriteAnimation(10);
        }, 1000 / 60);
    }

    updatePlatformLock(tileset) {
        this.ensureLockedY(tileset);
        if (!this.hasLockedY()) {
            return;
        }

        this.applyLockedY();
    }

    snapToFloatingPlatform(tileset) {
        const floatingTiles = this.getFloatingTiles(tileset);
        if (floatingTiles.length === 0) {
            return;
        }

        const centerX = this.getCenterX();
        const targetTile = this.findTargetFloatingTile(floatingTiles, centerX);
        if (!targetTile) {
            return;
        }

        const standingY = this.calculateStandingY(targetTile);
        this.setLockedY(standingY);
    }

    setPlatformYOffset(offset) {
        if (!Number.isFinite(offset)) {
            return;
        }

        this.platformYOffset = offset;
        if (Number.isFinite(this.lockedY)) {
            this.lockedY += offset;
        }
    }

    ensureLockedY(tileset) {
        if (!this.hasLockedY() && Array.isArray(tileset)) {
            this.snapToFloatingPlatform(tileset);
        }
    }

    hasLockedY() {
        return Number.isFinite(this.lockedY);
    }

    applyLockedY() {
        this.y = this.lockedY;
        this.groundY = this.lockedY;
        this.defaultGroundY = this.lockedY;
        this.speedY = 0;
    }

    getFloatingTiles(tileset) {
        return (tileset ?? []).filter((tile) => tile?.img?.src?.includes("floating"));
    }

    getCenterX() {
        return this.x + this.width / 2;
    }

    findTargetFloatingTile(tiles, centerX) {
        return this.findTileUnderCenter(tiles, centerX) ?? this.findClosestTile(tiles, centerX);
    }

    findTileUnderCenter(tiles, centerX) {
        return tiles.find((tile) => this.isCenterWithinTile(tile, centerX));
    }

    isCenterWithinTile(tile, centerX) {
        return centerX >= tile.x && centerX <= tile.x + tile.width;
    }

    findClosestTile(tiles, centerX) {
        return tiles.reduce((closest, tile) => {
            if (!closest) {
                return tile;
            }

            const tileDistance = Math.abs(this.getTileCenterX(tile) - centerX);
            const closestDistance = Math.abs(this.getTileCenterX(closest) - centerX);
            return tileDistance < closestDistance ? tile : closest;
        }, null);
    }

    getTileCenterX(tile) {
        return tile.x + tile.width / 2;
    }

    calculateStandingY(tile) {
        return (
            tile.y -
            (this.hitboxOffsetY ?? 0) -
            (this.hitboxHeight ?? this.height) +
            this.platformYOffset
        );
    }

    setLockedY(standingY) {
        this.lockedY = standingY;
        this.applyLockedY();
    }
}
