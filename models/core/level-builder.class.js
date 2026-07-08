import BackgroundObject from "../environment/background-object.class.js";
import Clouds from "../environment/clouds.class.js";
import Tileset from "../environment/tileset.class.js";
import Slime from "../enemies/slime.class.js";
import PredatorPlant from "../enemies/predator-plant.class.js";
import Spider from "../enemies/spider.class.js";
import Wolf from "../enemies/wolf.class.js";
import SpikeTrap from "../enemies/spike-trap.class.js";
import DecorationObject from "../environment/decoration-object.class.js";
import ManaStone from "../collectables/mana-stone.class.js";

export default class LevelBuilder {
    /**
     * Handles build.
     * @param {object} level
     * @returns {object|null}
     */
    static build(level) {
        const tileConfigs = level?.tiles ?? [];
        const builtTiles = this.buildTiles(tileConfigs);
        const builtEnemies = this.buildEnemies(level?.enemies ?? []);
        const trapEnemies = this.buildSpikeTrapsFromTiles(tileConfigs);

        return {
            backgroundObjects: this.buildBackgrounds(level?.backgroundLayers ?? []),
            tileset: builtTiles,
            enemies: [...builtEnemies, ...trapEnemies],
            collectables: this.buildCollectables(level?.collectables ?? []),
            decorations: this.buildDecorations(level?.decorations ?? []),
        };
    }

    /**
     * Handles build backgrounds.
     * @param {object} layers
     * @returns {object|null}
     */
    static buildBackgrounds(layers) {
        return layers.map((layer) => {
            if (layer.type === "clouds") {
                return new Clouds(layer.parallaxFactor ?? 0.35);
            }

            return new BackgroundObject(layer.imagePath, layer.parallaxFactor ?? 1);
        });
    }

    /**
     * Handles build tiles.
     * @param {object} tiles
     * @returns {object[]}
     */
    static buildTiles(tiles) {
        return tiles.map((tile) => {
            return new Tileset(tile.imagePath, tile.x, tile.y, tile.width, tile.height);
        });
    }

    /**
     * Handles build decorations.
     * @param {object[]} decorations
     * @returns {object|null}
     */
    static buildDecorations(decorations) {
        return decorations.map((deco) => {
            return new DecorationObject(deco);
        });
    }

    /**
     * Handles build collectables.
     * @param {object[]} collectables
     * @returns {object|null}
     */
    static buildCollectables(collectables) {
        return collectables.map((collectable) => {
            if (collectable.type === "manaStone") {
                return new ManaStone(collectable);
            }

            return null;
        }).filter(Boolean);
    }

    /**
     * Handles build enemies.
     * @param {object[]} enemies
     * @returns {object[]}
     */
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

            if (enemy.type === "wolf") {
                const wolf = new Wolf();
                if (typeof enemy.x === "number") {
                    wolf.x = enemy.x;
                }
                if (typeof enemy.y === "number") {
                    wolf.y = enemy.y;
                }
                return wolf;
            }

            if (enemy.type === "spikeTrap") {
                const trapHitbox = enemy.hitbox ?? null;
                return new SpikeTrap({
                    x: enemy.x,
                    y: enemy.y,
                    width: enemy.width,
                    height: enemy.height,
                    damage: enemy.damage,
                    hitbox: trapHitbox,
                });
            }

            return null;
        }).filter(Boolean);
    }

    /**
     * Builds spike traps from tiles that are marked as traps.
     * @param {object[]} tiles
     * @returns {object[]}
     */
    static buildSpikeTrapsFromTiles(tiles) {
        return tiles
            .filter((tile) => this.isSpikeTrapTile(tile))
            .map((tile) => {
                const trapConfig = tile.trap === true ? {} : (tile.trap ?? {});
                const hitboxConfig = trapConfig.hitbox ?? {};

                return new SpikeTrap({
                    x: tile.x,
                    y: tile.y,
                    width: tile.width,
                    height: tile.height,
                    damage: trapConfig.damage,
                    hitbox: {
                        offsetX: hitboxConfig.offsetX,
                        offsetY: hitboxConfig.offsetY,
                        width: hitboxConfig.width,
                        height: hitboxConfig.height,
                    },
                });
            });
    }

    /**
     * Returns true if tile should also act as spike trap.
     * @param {object} tile
     * @returns {boolean}
     */
    static isSpikeTrapTile(tile) {
        if (!tile || !tile.imagePath) {
            return false;
        }

        if (tile.trap === true || typeof tile.trap === "object") {
            return true;
        }

        return tile.imagePath.includes("spikes");
    }
}
