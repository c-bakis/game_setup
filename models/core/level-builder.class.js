import BackgroundObject from "../environment/background-object.class.js";
import Clouds from "../environment/clouds.class.js";
import Tileset from "../environment/tileset.class.js";
import Slime from "../enemies/slime.class.js";
import PredatorPlant from "../enemies/predator-plant.class.js";
import Spider from "../enemies/spider.class.js";
import DecorationObject from "../environment/decoration-object.class.js";
import ManaStone from "../collectables/mana-stone.class.js";

export default class LevelBuilder {
    static build(level) {
        return {
            backgroundObjects: this.buildBackgrounds(level?.backgroundLayers ?? []),
            tileset: this.buildTiles(level?.tiles ?? []),
            enemies: this.buildEnemies(level?.enemies ?? []),
            collectables: this.buildCollectables(level?.collectables ?? []),
            decorations: this.buildDecorations(level?.decorations ?? []),
        };
    }

    static buildBackgrounds(layers) {
        return layers.map((layer) => {
            if (layer.type === "clouds") {
                return new Clouds(layer.parallaxFactor ?? 0.35);
            }

            return new BackgroundObject(layer.imagePath, layer.parallaxFactor ?? 1);
        });
    }

    static buildTiles(tiles) {
        return tiles.map((tile) => {
            return new Tileset(tile.imagePath, tile.x, tile.y, tile.width, tile.height);
        });
    }

    static buildDecorations(decorations) {
        return decorations.map((deco) => {
            return new DecorationObject(deco);
        });
    }

    static buildCollectables(collectables) {
        return collectables.map((collectable) => {
            if (collectable.type === "manaStone") {
                return new ManaStone(collectable);
            }

            return null;
        }).filter(Boolean);
    }

    static buildEnemies(enemies) {
        return enemies.map((enemy) => {
            if (enemy.type === "slime") {
                const slime = new Slime();
                if (typeof enemy.x === "number") {
                    slime.x = enemy.x;
                }
                if (typeof enemy.y === "number") {
                    slime.y = enemy.y;
                }
                return slime;
            }

            if (enemy.type === "predatorPlant") {
                const predatorPlant = new PredatorPlant();
                if (typeof enemy.x === "number") {
                    predatorPlant.x = enemy.x;
                }
                if (typeof enemy.y === "number") {
                    predatorPlant.y = enemy.y;
                }
                if (typeof enemy.yOffset === "number") {
                    predatorPlant.platformYOffset = enemy.yOffset;
                }
                return predatorPlant;
            }

            if (enemy.type === "spider") {
                const spider = new Spider();
                if (typeof enemy.x === "number") {
                    spider.x = enemy.x;
                }
                if (typeof enemy.y === "number") {
                    spider.y = enemy.y;
                }
                if (typeof enemy.yOffset === "number") {
                    spider.platformYOffset = enemy.yOffset;
                }
                return spider;
            }

            return null;
        }).filter(Boolean);
    }
}
