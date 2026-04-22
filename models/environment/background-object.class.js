import MovableObject from "../core/movable-object.class.js";

export default class BackgroundObject extends MovableObject {

    constructor(imagePath, parallaxFactor = 1) {
        super();
        this.loadImage(imagePath);
        this.x = 0;
        this.y = 0;
        this.width = 720;
        this.height = 480;
        this.parallaxFactor = parallaxFactor;
    }
}