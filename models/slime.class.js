import MovableObject from "./movable-object.class.js";

export default class Slime extends MovableObject {

    IMAGES_WALKING = [
        "img/enemies/blue_slime/Walk1.png",
        "img/enemies/blue_slime/Walk2.png",
        "img/enemies/blue_slime/Walk3.png",
        "img/enemies/blue_slime/Walk4.png",
        "img/enemies/blue_slime/Walk5.png",
        "img/enemies/blue_slime/Walk6.png",
        "img/enemies/blue_slime/Walk7.png",
        "img/enemies/blue_slime/Walk8.png",
    ];

    currentImg = 0;
  animationCounter = 0;

    
    constructor() {
        super();
        this.loadImage("img/enemies/blue_slime/Walk1.png");
        this.x = Math.random() * 350 + 350;
        this.y = 370;
        this.width = 50;
        this.height = 40;
        this.speed = 0.15 + Math.random() * 0.25; 
        this.loadImages(this.IMAGES_WALKING);

        this.animate();
    }

    animate() {
        setInterval(() => {
            this.moveLeft();
            this.initiateAnimation(14, this.IMAGES_WALKING);
        }, 1000 / 60);

    }
}