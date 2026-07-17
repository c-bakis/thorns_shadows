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

const GAME_INPUT_CODES = [
  "ArrowRight",
  "ArrowLeft",
  "ArrowUp",
  "ArrowDown",
  "Space",
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "KeyF",
  "KeyG",
  "KeyP",
];

const KEYBOARD_FLAG_BY_CODE = {
  ArrowRight: "RIGHT",
  KeyD: "RIGHT",
  ArrowLeft: "LEFT",
  KeyA: "LEFT",
  ArrowUp: "UP",
  KeyW: "UP",
  ArrowDown: "DOWN",
  KeyS: "DOWN",
  Space: "SPACE",
  KeyF: "ATTACK",
  KeyG: "MAGIC_ATTACK",
};

/**
 * Reads current input capabilities from browser APIs.
 * @returns {{hasTouch: boolean, hasCoarsePointer: boolean, hasFinePointer: boolean, canHover: boolean}}
 */
function getInputCapabilities() {
  return {
    hasTouch: navigator.maxTouchPoints > 0,
    hasCoarsePointer: window.matchMedia("(pointer: coarse)").matches,
    hasFinePointer: window.matchMedia("(pointer: fine)").matches,
    canHover: window.matchMedia("(hover: hover)").matches,
  };
}

/**
 * Resolves an input profile from current device capabilities.
 * @param {{hasTouch: boolean, hasCoarsePointer: boolean, hasFinePointer: boolean, canHover: boolean}} capabilities
 * @returns {"touchOptimized"|"desktopOptimized"|"hybrid"}
 */
function resolveInputProfile(capabilities) {
  const touchLike = capabilities.hasTouch || capabilities.hasCoarsePointer;
  const desktopLike = capabilities.hasFinePointer && capabilities.canHover;

  if (touchLike && desktopLike) {
    return "hybrid";
  }

  if (touchLike) {
    return "touchOptimized";
  }

  return "desktopOptimized";
}

/**
 * Detects current input profile and capability flags.
 * @returns {{profile: "touchOptimized"|"desktopOptimized"|"hybrid", capabilities: {hasTouch: boolean, hasCoarsePointer: boolean, hasFinePointer: boolean, canHover: boolean}}}
 */
function detectInputProfile() {
  const capabilities = getInputCapabilities();
  const profile = resolveInputProfile(capabilities);
  return { profile, capabilities };
}

/**
 * Applies input profile information as body data and state classes.
 * @param {{profile: "touchOptimized"|"desktopOptimized"|"hybrid", capabilities: {hasTouch: boolean, hasCoarsePointer: boolean, hasFinePointer: boolean, canHover: boolean}}} inputProfile
 * @returns {void}
 */
function applyInputProfileToBody(inputProfile) {
  const body = document.body;
  if (!body) {
    return;
  }

  body.dataset.inputProfile = inputProfile.profile;
  body.classList.toggle("is-touch-optimized", inputProfile.profile === "touchOptimized");
  body.classList.toggle("is-desktop-optimized", inputProfile.profile === "desktopOptimized");
  body.classList.toggle("is-input-hybrid", inputProfile.profile === "hybrid");
}

/**
 * Applies last-input classes to the body.
 * @param {"touch"|"mouse"} mode
 * @returns {void}
 */
function applyLastInputModeToBody(mode) {
  const body = document.body;
  if (!body) {
    return;
  }

  body.classList.toggle("is-last-input-touch", mode === "touch");
  body.classList.toggle("is-last-input-mouse", mode === "mouse");
}

/**
 * Sets and applies the last detected input mode.
 * @param {"touch"|"mouse"} mode
 * @returns {void}
 */
function setLastInputMode(mode) {
  const body = document.body;
  if (!body) {
    return;
  }

  body.dataset.lastInputMode = mode;
  applyLastInputModeToBody(mode);
}

/**
 * Reads current last input mode from body dataset.
 * @returns {"touch"|"mouse"|null}
 */
function getLastInputMode() {
  const mode = document.body?.dataset?.lastInputMode;
  return mode === "touch" || mode === "mouse" ? mode : null;
}

/**
 * Initializes last-input mode after profile detection.
 * @param {{profile: "touchOptimized"|"desktopOptimized"|"hybrid"}} inputProfile
 * @returns {void}
 */
function initializeLastInputMode(inputProfile) {
  if (inputProfile.profile === "touchOptimized") {
    setLastInputMode("touch");
    return;
  }

  if (inputProfile.profile === "desktopOptimized") {
    setLastInputMode("mouse");
    return;
  }

  const existingMode = getLastInputMode();
  if (existingMode) {
    applyLastInputModeToBody(existingMode);
    return;
  }

  setLastInputMode("mouse");
}

/**
 * Returns true when hybrid input profile is active.
 * @returns {boolean}
 */
function isHybridInputProfileActive() {
  return document.body?.classList.contains("is-input-hybrid") ?? false;
}

/**
 * Detects and applies the current input profile.
 * @returns {{profile: "touchOptimized"|"desktopOptimized"|"hybrid", capabilities: {hasTouch: boolean, hasCoarsePointer: boolean, hasFinePointer: boolean, canHover: boolean}}}
 */
function refreshInputProfile() {
  const inputProfile = detectInputProfile();
  applyInputProfileToBody(inputProfile);
  initializeLastInputMode(inputProfile);
  return inputProfile;
}

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

  const touchButtons = document.querySelector(".touch-button-container");
  touchButtons?.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

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
  refreshInputProfile();
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

/**
 * Prevents default browser behavior for gameplay input keys.
 * @param {KeyboardEvent} event
 * @returns {void}
 */
function preventDefaultForGameInput(event) {
  if (GAME_INPUT_CODES.includes(event.code)) {
    event.preventDefault();
  }
}

/**
 * Sets a world keyboard flag based on key code mapping.
 * @param {string} code
 * @param {boolean} isPressed
 * @returns {void}
 */
function setKeyboardStateForCode(code, isPressed) {
  const keyboardFlag = KEYBOARD_FLAG_BY_CODE[code];
  if (!keyboardFlag || !world?.keyboard) {
    return;
  }

  world.keyboard[keyboardFlag] = isPressed;
}

/**
 * Handles pause key toggle on keydown (without repeat).
 * @param {KeyboardEvent} event
 * @returns {void}
 */
function handlePauseKeyDown(event) {
  if (event.code === "KeyP" && !event.repeat) {
    world.handlePauseToggle();
  }
}

/**
 * Updates last-input mode from pointer interaction.
 * @param {PointerEvent} event
 * @returns {void}
 */
function handlePointerInput(event) {
  unlockAudio();
  if (event.pointerType === "touch") {
    setLastInputMode("touch");
    return;
  }

  setLastInputMode("mouse");
}

/**
 * Handles touchstart fallback for browsers without pointer events.
 * @returns {void}
 */
function handleTouchStartInput() {
  unlockAudio();
  setLastInputMode("touch");
}

window.addEventListener("keydown", (e) => {
  unlockAudio();

  if (isHybridInputProfileActive()) {
    setLastInputMode("mouse");
  }

  if (!world) {
    return;
  }

  preventDefaultForGameInput(e);
  setKeyboardStateForCode(e.code, true);
  handlePauseKeyDown(e);
});

window.addEventListener("pointerdown", handlePointerInput, { passive: true });
window.addEventListener("touchstart", handleTouchStartInput, { passive: true });
window.addEventListener("resize", refreshInputProfile);

["(pointer: coarse)", "(pointer: fine)", "(hover: hover)"]
  .map((query) => window.matchMedia(query))
  .forEach((mediaQueryList) => {
    if (typeof mediaQueryList.addEventListener === "function") {
      mediaQueryList.addEventListener("change", refreshInputProfile);
      return;
    }

    mediaQueryList.addListener(refreshInputProfile);
  });

window.getInputProfile = detectInputProfile;
window.refreshInputProfile = refreshInputProfile;
window.getLastInputMode = getLastInputMode;

window.addEventListener("keyup", (e) => {
    if (!world) {
      return;
    }

  preventDefaultForGameInput(e);
  setKeyboardStateForCode(e.code, false);
});
