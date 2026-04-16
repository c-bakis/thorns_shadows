export default class Level {
    enemies;
    backgroundLayers;
    keys;
    tiles;
    stones;
    cameraDeadZone;
    spawn;

    constructor({
        enemies = [],
        backgroundLayers = [],
        keys = [],
        tiles = [],
        stones = [],
        cameraDeadZone = 150,
        spawn = { x: 100, y: 263 },
    } = {}) {
        this.enemies = enemies;
        this.backgroundLayers = backgroundLayers;
        this.keys = keys;
        this.tiles = tiles;
        this.stones = stones;
        this.cameraDeadZone = cameraDeadZone;
        this.spawn = spawn;
    }
}