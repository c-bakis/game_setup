import MovableObject from "./movable-object.class.js";

export default class Character extends MovableObject {

    IMAGES_WALKING = [
        "img/character/wizard/Walk1.png",
        "img/character/wizard/Walk2.png",
        "img/character/wizard/Walk3.png",
        "img/character/wizard/Walk4.png"
    ];

    IMAGES_JUMPING = [
        "img/character/wizard/Jump1.png",
        "img/character/wizard/Jump1.png",
        "img/character/wizard/Jump2.png",
        "img/character/wizard/Jump2.png"
    ];

    currentImg = 0;

    constructor() {
        super();
        this.loadImage("img/character/wizard/Walk1.png");
        this.loadImages(this.IMAGES_WALKING);

        this.animate();
    }

    animate() {
        setInterval(() => {
            if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
                // this.playAnimation(this.IMAGES_WALKING);
            
            const i = this.currentImg % this.IMAGES_WALKING.length;
            const path = this.IMAGES_WALKING[i];
            this.img.src = path;
            this.currentImg++;
        }
        }, 100);
    }
}
