import MovableObject from "./movable-object.class.js";

export default class Slime extends MovableObject {
    damage = 10;

    SPRITE_ANIMATIONS = {
        WALK: {
            path: "img/enemies/blue_slime/walk.png",
            frameWidth: 128,
            frameHeight: 128,
            frameCount: 8,
        },
    };

    activeAnimation = "WALK";
    animationCounter = 0;

    
    constructor() {
        super();
        this.x = Math.random() * 1000 + 350;
        this.y = 270;
        this.width = 130;
        this.height = 140;
        this.hitboxOffsetX = 35;
        this.hitboxOffsetY = 110;
        this.hitboxWidth = 50;
        this.hitboxHeight = 35;
        this.speed = 0.15 + Math.random() * 0.25; 
        const animationPaths = Object.values(this.SPRITE_ANIMATIONS).map(
            (config) => config.path,
        );
        this.loadImages(animationPaths);
        this.switchAnimation("WALK");

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
            this.moveLeft();
            this.switchAnimation("WALK");
            this.advanceSpriteAnimation(14);
        }, 1000 / 60);

    }
}