import MovableObject from "../core/movable-object.class.js";

export default class Clouds extends MovableObject {

    constructor(parallaxFactor = 0.35) {
        super();
        this.loadImage("img/backgrounds/clouds.png");
        this.x = 0;
        this.y = 0;
        this.width = 720;
        this.height = 480;
        this.parallaxFactor = parallaxFactor;
    }
}