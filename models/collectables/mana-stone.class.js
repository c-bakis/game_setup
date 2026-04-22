import Collectable from "./collectables.class.js";

export default class ManaStone extends Collectable {
    manaAmount = 20;

    SPRITE_ANIMATIONS = {
        DEFAULT: {
        path: "img/objects/mana_stone.png",
        frameWidth: 160,
        frameHeight: 128,
        frameCount: 6,
        },
    };

    activeAnimation = "DEFAULT";

    constructor(config = {}) {
        super();
        this.x = Number.isFinite(config.x) ? config.x : 0;
        this.y = Number.isFinite(config.y) ? config.y : 0;
        this.width = Number.isFinite(config.width) ? config.width : 110;
        this.height = Number.isFinite(config.height) ? config.height : 110;
        this.hitboxOffsetX = this.width * 0.35;
        this.hitboxOffsetY = this.height * 0.18;
        this.hitboxWidth = this.width * 0.24;
        this.hitboxHeight = this.height * 0.50;
        this.manaAmount = Number.isFinite(config.manaAmount) ? config.manaAmount : this.manaAmount;
        const animationPaths = Object.values(this.SPRITE_ANIMATIONS).map(
            (config) => config.path,
        );
        this.loadImages(animationPaths);
        this.switchAnimation("DEFAULT");
        this.animate();
    }

    animate() {
        setInterval(() => {
            this.switchAnimation("DEFAULT");
            this.advanceSpriteAnimation(10);
        }, 1000 / 60);
    }

    onCollect(character) {
        if (typeof character.increaseMana === "function") {
            character.increaseMana(this.manaAmount);
        }
        this.collected = true;
    }
}