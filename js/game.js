import World from "../models/core/world.class.js";
import AudioManager from "../models/core/audio-manager.class.js";
import level1 from "../levels/level1.js";

let canvas;
let world;
let audioManager;
let touchControlsInitialized = false;
const nonPassivePointerOptions = { passive: false };

const touchButtonBindings = [
  { id: "move-left-btn", key: "LEFT" },
  { id: "move-right-btn", key: "RIGHT" },
  { id: "jump-btn", key: "SPACE" },
  { id: "attack-btn", key: "ATTACK" },
  { id: "magic-attack-btn", key: "MAGIC_ATTACK" },
];

/**
 * Reads a persisted enabled-state from sessionStorage.
 * @param {string} key
 * @param {boolean} fallbackEnabled
 * @returns {boolean}
 */
function getStoredEnabledState(key, fallbackEnabled = true) {
  const storedValue = sessionStorage.getItem(key);
  if (storedValue === "true") {
    return true;
  }
  if (storedValue === "false") {
    return false;
  }
  return fallbackEnabled;
}


/**
 * Unlocks browser audio playback after a user interaction.
 * @returns {void}
 */
function unlockAudio() {
  audioManager?.unlock?.();
}

/**
 * Toggles pause state from touch UI.
 * @returns {void}
 */
function togglePause() {
  unlockAudio();
  world?.handlePauseToggle?.();
}

window.togglePause = togglePause;

/**
 * Sets a keyboard flag if world input is available.
 * @param {keyof import("../models/core/keyboard.class.js").default} key
 * @param {boolean} isPressed
 * @returns {void}
 */
function setTouchKeyState(key, isPressed) {
  if (!world?.keyboard) {
    return;
  }

  world.keyboard[key] = isPressed;
}

/**
 * Handles pointer down for hold-style touch controls.
 * @param {PointerEvent} event
 * @param {HTMLElement} button
 * @param {string} key
 * @returns {void}
 */
function onTouchHoldPointerDown(event, button, key) {
  event.preventDefault();
  unlockAudio();
  button.setPointerCapture?.(event.pointerId);
  setTouchKeyState(key, true);
}

/**
 * Creates a release handler for a touch control key.
 * @param {string} key
 * @returns {(event: PointerEvent) => void}
 */
function createTouchReleaseHandler(key) {
  return (event) => {
    event.preventDefault();
    setTouchKeyState(key, false);
  };
}

/**
 * Registers pointer release events for a hold-style button.
 * @param {HTMLElement} button
 * @param {(event: PointerEvent) => void} releaseHandler
 * @returns {void}
 */
function addTouchReleaseListeners(button, releaseHandler) {
  button.addEventListener("pointerup", releaseHandler, nonPassivePointerOptions);
  button.addEventListener("pointercancel", releaseHandler, nonPassivePointerOptions);
  button.addEventListener("pointerleave", releaseHandler, nonPassivePointerOptions);
}

/**
 * Binds a touch button to a keyboard flag using pointer events.
 * @param {string} buttonId
 * @param {string} key
 * @returns {void}
 */
function bindTouchHoldButton(buttonId, key) {
  const button = document.getElementById(buttonId);
  if (!button) {
    return;
  }

  button.addEventListener(
    "pointerdown",
    (event) => onTouchHoldPointerDown(event, button, key),
    nonPassivePointerOptions,
  );

  addTouchReleaseListeners(button, createTouchReleaseHandler(key));
}

/**
 * Initializes touch controls once.
 * @returns {void}
 */
function setupTouchControls() {
  if (touchControlsInitialized) {
    return;
  }

  touchButtonBindings.forEach(({ id, key }) => bindTouchHoldButton(id, key));

  const pauseButton = document.getElementById("pause-btn");
  pauseButton?.addEventListener("click", (event) => {
    event.preventDefault();
    togglePause();
  });

  touchControlsInitialized = true;
}

/**
 * Initializes the game state and core objects.
 * @returns {void}
 */
function init() {
  setupTouchControls();
  canvas = document.getElementById("canvas");
  canvas.width = 840;
  canvas.height = 472.5;
  const isMusicEnabled = getStoredEnabledState("musicIsEnabled", true);
  const isSoundEnabled = getStoredEnabledState("soundIsEnabled", true);
  audioManager = new AudioManager({
    initialMusicMuted: !isMusicEnabled,
    initialSfxMuted: !isSoundEnabled,
  });
  toggleMainMenuGame();
  createWorld();
}

window.init = init;

/**
 * Creates world.
 * @returns {void}
 */
function createWorld() {
  world = new World(canvas, level1, audioManager);
  world.setRestartHandler(restartGame);
  world.setQuitHandler(toggleMainMenuGame);
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

/**
 * Toggles the visibility of the main menu and game canvas.
 * @returns {void}
 */
function toggleMainMenuGame() {  
  if (world && typeof world.destroy === "function") {
    world.destroy();
  }
  const startScreen = document.getElementById("start-screen");
  const canvasElement = document.getElementById("canvas");
  const isStartScreenHidden = getComputedStyle(startScreen).getPropertyValue("display") === "none";
  const isGameActive = !isStartScreenHidden;

  startScreen.style.display = isStartScreenHidden ? "flex" : "none";
  canvasElement.style.display = isStartScreenHidden ? "none" : "block";
  document.body.classList.toggle("is-game-active", isGameActive);
  if (!isGameActive) {
    document.body.classList.remove("is-game-paused");
  }
}

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
