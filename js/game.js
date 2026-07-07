import World from "../models/core/world.class.js";
import AudioManager from "../models/core/audio-manager.class.js";
import level1 from "../levels/level1.js";

let canvas;
let world;
let audioManager;

/**
 * Unlocks browser audio playback after a user interaction.
 * @returns {void}
 */
function unlockAudio() {
  audioManager?.unlock?.();
}

/**
 * Initializes the game state and core objects.
 * @returns {void}
 */
function init() {
  canvas = document.getElementById("canvas");
  canvas.width = 720;
  canvas.height = 480;
  audioManager = new AudioManager();
  createWorld();
}

/**
 * Creates world.
 * @returns {void}
 */
function createWorld() {
  world = new World(canvas, level1, audioManager);
  world.setRestartHandler(restartGame);
}

/**
 * Destroys the current world and recreates it from the level definition.
 * @returns {void}
 */
function restartGame() {
  if (!canvas) {
    return;
  }

  if (world && typeof world.destroy === "function") {
    world.destroy();
  }

  createWorld();
}

window.addEventListener("load", init);
window.addEventListener("keydown", (e) => {
  unlockAudio();

  if (!world) {
    return;
  }

  if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "Space", "KeyW", "KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyP"].includes(e.code)) {
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
      case "KeyG":
        world.keyboard.MAGIC_ATTACK = true;
        break;
    case "KeyP":
        if (!e.repeat) {
          world.handlePauseToggle();
        }
      break;
  }
});

window.addEventListener("pointerdown", unlockAudio, { passive: true });
window.addEventListener("touchstart", unlockAudio, { passive: true });

window.addEventListener("keyup", (e) => {
    if (!world) {
      return;
    }

  if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "Space", "KeyW", "KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyP"].includes(e.code)) {
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
      case "KeyG":
        world.keyboard.MAGIC_ATTACK = false;
        break;
  }
});
