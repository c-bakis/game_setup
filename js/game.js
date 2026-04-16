import World from "../models/world.class.js";

let canvas;
let world;

function init() {
  canvas = document.getElementById("canvas");
  canvas.width = 720;
  canvas.height = 480;
  world = new World(canvas);
}

window.addEventListener("load", init);
window.addEventListener("keydown", (e) => {
  console.log(e);
  switch (e.code) {
    case "ArrowRight":
      world.keyboard.RIGHT = true;
      break;
    case "ArrowLeft":
      world.keyboard.LEFT = true;
      break;
    case "ArrowUp":
      world.keyboard.UP = true;
      break;
    case "ArrowDown":
      world.keyboard.DOWN = true;
      break;
    case "Space":
      world.keyboard.SPACE = true;
      break;
  }
});

window.addEventListener("keyup", (e) => {
  switch (e.code) {
    case "ArrowRight":
      world.keyboard.RIGHT = false;
      break;
    case "ArrowLeft":
      world.keyboard.LEFT = false;
      break;
    case "ArrowUp":
      world.keyboard.UP = false;
      break;
    case "ArrowDown":
      world.keyboard.DOWN = false;
      break;
    case "Space":
      world.keyboard.SPACE = false;
      break;
  }
});
