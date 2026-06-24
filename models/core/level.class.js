export default class Level {
    enemies;
    backgroundLayers;
    keys;
    tiles;
    collectables;
    decorations;
    cameraDeadZone;
    spawn;
    levelEndX;
    bossIntro;
    winCondition;

    constructor({
        enemies = [],
        backgroundLayers = [],
        keys = [],
        tiles = [],
        collectables = [],
        decorations = [],
        cameraDeadZone = 150,
        spawn = { x: 100, y: 263 },
        levelEndX = 1000,
        bossIntro = null,
        winCondition = null,
    } = {}) {
        this.enemies = enemies;
        this.backgroundLayers = backgroundLayers;
        this.keys = keys;
        this.tiles = tiles;
        this.collectables = collectables;
        this.decorations = decorations;
        this.cameraDeadZone = cameraDeadZone;
        this.spawn = spawn;
        this.levelEndX = levelEndX;
        this.bossIntro = bossIntro;
        this.winCondition = winCondition;
    }
}