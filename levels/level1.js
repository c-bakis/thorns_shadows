import Level from "../models/level.class.js";

const level1 = new Level({
  spawn: { x: 100, y: 263 },
  cameraDeadZone: 150,
  enemies: [
    { type: "slime" },
    { type: "slime" },
    { type: "slime" },
  ],
  backgroundLayers: [
    { type: "background", imagePath: "img/backgrounds/sky.png", parallaxFactor: 0.32 },
    { type: "clouds", parallaxFactor: 0.35 },
    { type: "background", imagePath: "img/backgrounds/f1.png", parallaxFactor: 0.6 },
    { type: "background", imagePath: "img/backgrounds/f2.png", parallaxFactor: 0.85 },
  ],
  tiles: [
    { imagePath: "img/tiles/ground.png", x: 0, y: 440, width: 200, height: 50 },
    { imagePath: "img/tiles/ground.png", x: 0, y: 420, width: 200, height: 50 },
    { imagePath: "img/tiles/grass.png", x: -25, y: 390, width: 230, height: 52 },
    { imagePath: "img/tiles/floating_ground.png", x: 2010, y: 420, width: 160, height: 50 },
    { imagePath: "img/tiles/small_spikes.png", x: 2002, y: 380, width: 140, height: 50 },
    { imagePath: "img/tiles/floating_grass.png", x: 1880, y: 280, width: 160, height: 50 },
    { imagePath: "img/tiles/floating_grass.png", x: 2060, y: 200, width: 160, height: 50 },
  ],
});

export default level1;
