import MovableObject from "./movable-object.class.js";

export default class Slime extends MovableObject {

    IMAGES_WALKING = [
        "img/enemies/blue_slime/Walk1.png",
        "img/enemies/blue_slime/Walk2.png"
    ];

    currentImg = 0;

    
    constructor() {
        super();
        this.loadImage("img/enemies/blue_slime/walk1.png");
        this.x = Math.random() * 350 + 350;
        console.log("Slime x position:", this.x);
        this.y = 280;
        this.width = 50;
        this.height = 130;
        this.speed = 0.15 + Math.random() * 0.25; 
        this.loadImages(this.IMAGES_WALKING);

        this.animate();
    }

    animate() {
        this.moveLeft();

        setInterval(() => {
            const i = this.currentImg % this.IMAGES_WALKING.length;
            const path = this.IMAGES_WALKING[i];
            this.img.src = path;
            this.currentImg++;
        }, 440);
    }
}