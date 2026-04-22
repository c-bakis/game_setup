import World from "../models/core/world.class.js";
import level1 from "../levels/level1.js";

let canvas;
let world;

function init() {
  canvas = document.getElementById("canvas");
  canvas.width = 720;
  canvas.height = 480;
  world = new World(canvas, level1);
}

window.addEventListener("load", init);
window.addEventListener("keydown", (e) => {
  if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "Space", "KeyW", "KeyA", "KeyS", "KeyD", "KeyF"].includes(e.code)) {
    e.preventDefault();
  }

  switch (e.code) {
    case "ArrowRight":
    case "KeyD":
      world.keyboard.RIGHT = true;
      break;
    case "ArrowLeft":
    case "KeyA":
      world.keyboard.LEFT = true;
      break;
    case "ArrowUp":
    case "KeyW":
      world.keyboard.UP = true;
      break;
    case "ArrowDown":
    case "KeyS":
      world.keyboard.DOWN = true;
      break;
    case "Space":
      world.keyboard.SPACE = true;
      break;
    case "KeyF":
      world.keyboard.ATTACK = true;
      break;
  }
});

window.addEventListener("keyup", (e) => {
  if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "Space", "KeyW", "KeyA", "KeyS", "KeyD", "KeyF"].includes(e.code)) {
    e.preventDefault();
  }

  switch (e.code) {
    case "ArrowRight":
    case "KeyD":
      world.keyboard.RIGHT = false;
      break;
    case "ArrowLeft":
    case "KeyA":
      world.keyboard.LEFT = false;
      break;
    case "ArrowUp":
    case "KeyW":
      world.keyboard.UP = false;
      break;
    case "ArrowDown":
    case "KeyS":
      world.keyboard.DOWN = false;
      break;
    case "Space":
      world.keyboard.SPACE = false;
      break;
    case "KeyF":
      world.keyboard.ATTACK = false;
      break;
  }
});
