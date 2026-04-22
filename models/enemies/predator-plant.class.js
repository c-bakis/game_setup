import MovableObject from "../core/movable-object.class.js";

export default class PredatorPlant extends MovableObject {
    damage = 10;
    energy = 10;
    damageWindowStartFrame = 5;
    damageWindowEndFrame = 6;
    damageWindowAnimation = "ATTACK";
    acceleration = 0;
    groundY = 100;
    defaultGroundY = 100;
    lockedY = null;
    platformYOffset = 0;

    SPRITE_ANIMATIONS = {
        ATTACK: {
            path: "img/enemies/predator_plant/Predator_plant.png",
            frameWidth: 195,
            frameHeight: 160,
            frameCount: 9,
            layout: "column",
        },
    };

    activeAnimation = "ATTACK";
    animationCounter = 0;

    
    constructor() {
        super();
        this.x = 980;
        this.y = 100;
        this.width = 180;
        this.height = 180;
        this.hitboxOffsetX = 70;
        this.hitboxOffsetY = 40;
        this.hitboxWidth = 65;
        this.hitboxHeight = 35;
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

    animate() {
        setInterval(() => {
            this.updatePlatformLock();
            this.switchAnimation("ATTACK");
            this.advanceSpriteAnimation(14);
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