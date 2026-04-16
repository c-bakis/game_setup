import MovableObject from "./movable-object.class.js";

export default class Tileset extends MovableObject {

    constructor(imagePath, x, y, w, h) {
        super();
        this.loadImage(imagePath);
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
    }
}