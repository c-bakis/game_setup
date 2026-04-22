import Level from "../models/core/level.class.js";

const level1 = new Level({
  spawn: { x: 100, y: 230 },
  cameraDeadZone: 150,
  levelEndX: 3700,
  collectables: [
    { type: "manaStone", x: 3400, y: 40},
    { type: "manaStone", x: 910, y: 42 },
    { type: "manaStone", x: 3115, y: 36 },
  ],
  enemies: [
    { type: "slime" },
    { type: "slime" },
    { type: "slime" },
    { type: "predatorPlant", x: 980, yOffset: -85 },
    { type: "spider", x: 1380, yOffset: -80 },
  ],
  backgroundLayers: [
    { type: "background", imagePath: "img/backgrounds/sky.png", parallaxFactor: 0.32 },
    { type: "clouds", parallaxFactor: 0.35 },
    { type: "background", imagePath: "img/backgrounds/f1.png", parallaxFactor: 0.6 },
    { type: "background", imagePath: "img/backgrounds/f2.png", parallaxFactor: 0.85 },
  ],
  decorations: [

    { imagePath: "img/objects/tree.png", x: 400, y: 212, width: 140, height: 200 },
    { imagePath: "img/objects/tree.png", x: 600, y: 214, width: 140, height: 200 },
    { imagePath: "img/objects/tree.png", x: 320, y: 218, width: 140, height: 200 },
    { imagePath: "img/objects/tree.png", x: 880, y: 210, width: 140, height: 200 },
    { imagePath: "img/objects/tree.png", x: 980, y: 212, width: 140, height: 200 },
    { imagePath: "img/objects/tree.png", x: 1130, y: 216, width: 140, height: 200 },
    { imagePath: "img/objects/tree.png", x: 2200, y: 214, width: 140, height: 200 },
    { imagePath: "img/objects/tree.png", x: 2400, y: 212, width: 140, height: 200 },
    { imagePath: "img/objects/tree.png", x: 2520, y: 210, width: 140, height: 200 },
    
    { imagePath: "img/objects/big_tree.png", x: 50, y: 90, width: 300, height: 380 },
    { imagePath: "img/objects/big_tree.png", x: 700, y: 90, width: 300, height: 380 },
    { imagePath: "img/objects/big_tree.png", x: 1600, y: 90, width: 300, height: 380 },
    { imagePath: "img/objects/big_tree.png", x: 2250, y: 90, width: 300, height: 380 },

    { imagePath: "img/objects/small_tree.png", x: 480, y: 250, width: 120, height: 170 },
    { imagePath: "img/objects/small_tree.png", x: 880, y: -18, width: 120, height: 170 },
    { imagePath: "img/objects/small_tree.png", x: 1580, y: 250, width: 120, height: 170 },

    
    { imagePath: "img/objects/double_bush.png", x: 2150, y: 145, width: 55, height: 60 },    
    { imagePath: "img/objects/double_bush.png", x: 1800, y: 350, width: 55, height: 60 },
    { imagePath: "img/objects/double_bush.png", x: 2680, y: 350, width: 55, height: 60 },
    { imagePath: "img/objects/double_bush.png", x: 3450, y: 100, width: 55, height: 60 },


    // Flower sheet (3x3). Visible placement on 3rd floating tile and grass below.
    { imagePath: "img/objects/flower_sheet.png", x: 1408, y: 247, width: 30, height: 48, frameWidth: 42, frameHeight: 66, columns: 3, frameCount: 9, frameIndex: 0 },
    { imagePath: "img/objects/flower_sheet.png", x: 1448, y: 247, width: 30, height: 48, frameWidth: 42, frameHeight: 66, columns: 3, frameCount: 9, frameIndex: 1 },
    { imagePath: "img/objects/flower_sheet.png", x: 1420, y: 245, width: 30, height: 48, frameWidth: 42, frameHeight: 66, columns: 3, frameCount: 9, frameIndex: 2 },

    { imagePath: "img/objects/flower_sheet.png", x: 1340, y: 358, width: 32, height: 52, frameWidth: 42, frameHeight: 66, columns: 3, frameCount: 9, frameIndex: 0 },
    { imagePath: "img/objects/flower_sheet.png", x: 1362, y: 358, width: 32, height: 52, frameWidth: 42, frameHeight: 66, columns: 3, frameCount: 9, frameIndex: 3 },
    { imagePath: "img/objects/flower_sheet.png", x: 1394, y: 358, width: 32, height: 52, frameWidth: 42, frameHeight: 66, columns: 3, frameCount: 9, frameIndex: 6 },
    { imagePath: "img/objects/flower_sheet.png", x: 1416, y: 358, width: 32, height: 52, frameWidth: 42, frameHeight: 66, columns: 3, frameCount: 9, frameIndex: 2 },
    { imagePath: "img/objects/flower_sheet.png", x: 1448, y: 358, width: 32, height: 52, frameWidth: 42, frameHeight: 66, columns: 3, frameCount: 9, frameIndex: 1 },
    { imagePath: "img/objects/flower_sheet.png", x: 1460, y: 358, width: 32, height: 52, frameWidth: 42, frameHeight: 66, columns: 3, frameCount: 9, frameIndex: 8 },
    { imagePath: "img/objects/flower_sheet.png", x: 1492, y: 358, width: 32, height: 52, frameWidth: 42, frameHeight: 66, columns: 3, frameCount: 9, frameIndex: 7 },
    { imagePath: "img/objects/flower_sheet.png", x: 1516, y: 358, width: 32, height: 52, frameWidth: 42, frameHeight: 66, columns: 3, frameCount: 9, frameIndex: 4 },
    { imagePath: "img/objects/flower_sheet.png", x: 1554, y: 358, width: 32, height: 52, frameWidth: 42, frameHeight: 66, columns: 3, frameCount: 9, frameIndex: 5 },
  
    { imagePath: "img/objects/flower_sheet.png", x: 1928, y: 247, width: 30, height: 48, frameWidth: 42, frameHeight: 66, columns: 3, frameCount: 9, frameIndex: 0 },
    { imagePath: "img/objects/flower_sheet.png", x: 1968, y: 247, width: 30, height: 48, frameWidth: 42, frameHeight: 66, columns: 3, frameCount: 9, frameIndex: 1 },
    { imagePath: "img/objects/flower_sheet.png", x: 1940, y: 245, width: 30, height: 48, frameWidth: 42, frameHeight: 66, columns: 3, frameCount: 9, frameIndex: 2 },
    
    { imagePath: "img/objects/flower_sheet.png", x: 2840, y: 358, width: 32, height: 52, frameWidth: 42, frameHeight: 66, columns: 3, frameCount: 9, frameIndex: 0 },
    { imagePath: "img/objects/flower_sheet.png", x: 2862, y: 358, width: 32, height: 52, frameWidth: 42, frameHeight: 66, columns: 3, frameCount: 9, frameIndex: 3 },
    { imagePath: "img/objects/flower_sheet.png", x: 2894, y: 358, width: 32, height: 52, frameWidth: 42, frameHeight: 66, columns: 3, frameCount: 9, frameIndex: 6 },
    { imagePath: "img/objects/flower_sheet.png", x: 2916, y: 358, width: 32, height: 52, frameWidth: 42, frameHeight: 66, columns: 3, frameCount: 9, frameIndex: 2 },
    { imagePath: "img/objects/flower_sheet.png", x: 2948, y: 358, width: 32, height: 52, frameWidth: 42, frameHeight: 66, columns: 3, frameCount: 9, frameIndex: 1 },
    { imagePath: "img/objects/flower_sheet.png", x: 2960, y: 358, width: 32, height: 52, frameWidth: 42, frameHeight: 66, columns: 3, frameCount: 9, frameIndex: 8 },
    { imagePath: "img/objects/flower_sheet.png", x: 2992, y: 358, width: 32, height: 52, frameWidth: 42, frameHeight: 66, columns: 3, frameCount: 9, frameIndex: 7 },
    { imagePath: "img/objects/flower_sheet.png", x: 3016, y: 358, width: 32, height: 52, frameWidth: 42, frameHeight: 66, columns: 3, frameCount: 9, frameIndex: 4 },
    { imagePath: "img/objects/flower_sheet.png", x: 3054, y: 358, width: 32, height: 52, frameWidth: 42, frameHeight: 66, columns: 3, frameCount: 9, frameIndex: 5 },
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
    { imagePath: "img/tiles/long_small_floating_grass.png", x: 2560, y: 130, width: 40, height: 80 },
    { imagePath: "img/tiles/long_small_floating_grass.png", x: 2660, y: 120, width: 40, height: 80 },
    { imagePath: "img/tiles/long_small_floating_grass.png", x: 2760, y: 110, width: 40, height: 80 },
    { imagePath: "img/tiles/long_small_floating_grass.png", x: 2890, y: 140, width: 40, height: 80 },
    { imagePath: "img/tiles/floating_grass.png", x: 3060, y: 135, width: 160, height: 50 },
    { imagePath: "img/tiles/floating_grass.png", x: 3360, y: 145, width: 160, height: 50 },
  ],
});

export default level1;
