import BackgroundObject from "./background-object.class.js";
import Clouds from "./clouds.class.js";
import Tileset from "./tileset.class.js";
import Character from "./character.class.js";
import Slime from "./slime.class.js";
import Keyboard from "./keyboard.class.js";

export default class World {
    backgroundObjects = [
        new BackgroundObject("img/backgrounds/sky.png"),
        new Clouds(),
        new BackgroundObject("img/backgrounds/f1.png"),
        new BackgroundObject("img/backgrounds/f2.png")
    ];
    tileset = [
        new Tileset("img/tiles/ground.png", 0, 440, 200, 50),
        new Tileset("img/tiles/ground.png", 0, 420, 200, 50),
        new Tileset("img/tiles/grass.png", -25, 390, 230, 50)
    ];
    character = new Character();
    enemies = [
        new Slime(),
        new Slime(),
        new Slime()
    ];
    canvas;
    ctx;
    keyboard;

    constructor(canvas) {
        this.ctx = canvas.getContext("2d");
        this.canvas = canvas;
        this.keyboard = new Keyboard();
        this.character.world = this;
        this.fillTilesAcrossGround();
        this.draw();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        this.addObjToMap(this.backgroundObjects);
        this.addObjToMap(this.tileset);
        this.addToMap(this.character);
        this.addObjToMap(this.enemies);
        
        requestAnimationFrame(() => this.draw());
    }

    addObjToMap(objects) {
        objects.forEach(obj => {
            this.addToMap(obj);
        });
    }

    addToMap(movableObject) {
        if (!movableObject?.img) {
            return;
        }

        if (movableObject.img.complete && movableObject.img.naturalWidth > 0) {
            this.ctx.drawImage(movableObject.img, movableObject.x, movableObject.y, movableObject.width, movableObject.height);
        }   
        else {
            movableObject.img.onload = () => {
                if (movableObject.img.naturalWidth > 0) {
                    this.ctx.drawImage(movableObject.img, movableObject.x, movableObject.y, movableObject.width, movableObject.height);
                }
            };
            movableObject.img.onerror = () => console.error("Movable object image failed to load.");
        }
    }

    fillTilesAcrossGround() {
        const baseTiles = [...this.tileset];
        const filledTiles = [];

        baseTiles.forEach(tile => {
            const isGrassTile = tile.img.src.includes("grass");
            const stepX = isGrassTile ? tile.width - 25 : tile.width;

            for (let x = tile.x; x < this.canvas.width * 3; x += stepX) {
                filledTiles.push(new Tileset(tile.img.src, x, tile.y, tile.width, tile.height));
            }
        });

        this.tileset = filledTiles;
    }
}