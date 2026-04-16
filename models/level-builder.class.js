import BackgroundObject from "./background-object.class.js";
import Clouds from "./clouds.class.js";
import Tileset from "./tileset.class.js";
import Slime from "./slime.class.js";

export default class LevelBuilder {
    static build(level) {
        return {
            backgroundObjects: this.buildBackgrounds(level?.backgroundLayers ?? []),
            tileset: this.buildTiles(level?.tiles ?? []),
            enemies: this.buildEnemies(level?.enemies ?? []),
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

            return null;
        }).filter(Boolean);
    }
}
