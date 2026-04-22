import MovableObject from "../core/movable-object.class.js";

export default class Tileset extends MovableObject {

    constructor(imagePath, x, y, w, h) {
        super();
        this.loadImage(imagePath);
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.hitboxOffsetX = 0;
        this.hitboxOffsetY = 0;
        this.hitboxWidth = w;
        this.hitboxHeight = h;
    }
}