import Level from "../models/level.class.js";

const level1 = new Level({
  spawn: { x: 100, y: 230 },
  cameraDeadZone: 150,
  levelEndX: 3700,
  enemies: [
    { type: "slime" },
    { type: "slime" },
    { type: "slime" },
    { type: "predatorPlant", x: 980, yOffset: -85 },
  ],
  backgroundLayers: [
    { type: "background", imagePath: "img/backgrounds/sky.png", parallaxFactor: 0.32 },
    { type: "clouds", parallaxFactor: 0.35 },
    { type: "background", imagePath: "img/backgrounds/f1.png", parallaxFactor: 0.6 },
    { type: "background", imagePath: "img/backgrounds/f2.png", parallaxFactor: 0.85 },
  ],
  tiles: [
    { imagePath: "img/tiles/black_ground.png", x: 0, y: 440, width: 100, height: 50 },
    { imagePath: "img/tiles/small-grass.png", x: 0, y: 390, width: 48, height: 55 },
    { imagePath: "img/tiles/stone-ground.png", x: 0, y: 435, width: 210, height: 42 },
    { imagePath: "img/tiles/small_spikes2.png", x: 2053, y: 380, width: 121, height: 63 },
    { imagePath: "img/tiles/floating_grass.png", x: 1880, y: 280, width: 160, height: 50 },
    { imagePath: "img/tiles/floating_grass.png", x: 1060, y: 175, width: 160, height: 50 },
    { imagePath: "img/tiles/floating_grass.png", x: 900, y: 135, width: 150, height: 50 },
    { imagePath: "img/tiles/floating_grass.png", x: 1380, y: 270, width: 160, height: 50 },
    { imagePath: "img/tiles/floating_grass.png", x: 2060, y: 190, width: 160, height: 50 },
    { imagePath: "img/tiles/floating_grass.png", x: 2360, y: 140, width: 160, height: 50 },
  ],
});

export default level1;
