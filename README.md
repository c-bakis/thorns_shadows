<img align="left" src="https://github.com/c-bakis/thorns_shadows/blob/main/img/character/wizard/wizard_avatare3.png" width="100" alt="logo"/> 
<br/>


# Thorns and Shadows - a Wizard Platformer Game

A 2D canvas platformer with a modular architecture (World, Render, Collision, Input, Audio), combo/magic combat, a boss intro flow, and data-driven levels.


<br>
<p align="center">https://thornsandshadows.netlify.app/</p>

<br>
<p align="center">This action-packed 2D pixel-art platformer immerses players in an atmospheric forest world filled with danger and challenges. 
  Through precise jumps, strategic combat against enemies like slimes and spiders, and collecting valuable items, players skillfully navigate through the dynamic level.</p>

<br>
<br clear="left"/>

## Features

<br/>

<p align="center">Attack, Jump, collect Mana Stones and use a strong Fire Magic.</p>

<p align="center"></p>

<br/>
  
<img align="left" src="https://github.com/c-bakis/thorns_shadows/blob/main/img/screenshots/Screenshot_idle.png" alt="screenshot thorns and shadows"/>
<br/>
<br clear="left">

<br/>

<img align="left" src="https://github.com/c-bakis/thorns_shadows/blob/main/img/screenshots/Screenshot_attack.png" alt="screenshot thorns and shadows"/>

<img align="left" src="https://github.com/c-bakis/thorns_shadows/blob/main/img/screenshots/screenshoot_responsive.jpeg" alt="screenshot thorns and shadows"/>

<p></p>
<p></p>
<br clear="right"/> <br clear="left"/>
<br/>


## My Process

The following snippets highlight the most important technical decisions:
- Input detection for touch/desktop/hybrid
- Orchestration of game objects in a central World
- Render loop with freeze/pause mechanics
- Collision and combat systems with clear separation of responsibilities
- Data-driven level and enemy setup

---

## 1) Initialization and input profile

File: [js/game.js](js/game.js)

~~~js
function refreshInputProfile() {
  const inputProfile = detectInputProfile();
  applyInputProfileToBody(inputProfile);
  initializeLastInputMode(inputProfile);
  return inputProfile;
}

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
~~~

What it shows:
- Device-aware input profiling instead of fixed control assumptions
- A clean startup point for canvas, audio, and world creation

---

## 2) Central orchestration in the World

File: [models/core/world.class.js](models/core/world.class.js)

~~~js
constructor(canvas, level, audioManager = null) {
  this.ctx = canvas.getContext("2d");
  this.canvas = canvas;
  this.level = level;
  this.audioManager = audioManager;
  this.keyboard = new Keyboard();

  this.cameraController = new WorldCameraController(this);
  this.bossController = new WorldBossController(this);
  this.flowController = new WorldFlowController(this);
  this.overlayController = new WorldOverlayController(this);
  this.renderController = new WorldRenderController(this);

  const builtLevel = LevelBuilder.build(level);
  this.backgroundObjects = builtLevel.backgroundObjects;
  this.tileset = builtLevel.tileset;
  this.enemies = builtLevel.enemies;
  this.collectables = builtLevel.collectables ?? [];
  this.decorations = builtLevel.decorations ?? [];

  this.character.world = this;
  this.enemies.forEach((enemy) => {
    enemy.world = this;
  });

  this.collisionSystem = new CollisionSystem(this);
  this.plattformGroundResolver = new PlattformGroundResolver(this);
  this.backgroundRenderer = new BackgroundRenderer(this);

  this.initializeAudio();
  this.draw();
}
~~~

What it shows:
- Composition over monolith: specialized controllers per responsibility
- Clear wiring of level data, entities, and systems

---

## 3) Render loop with freeze and pause logic

File: [models/core/world-render.controller.js](models/core/world-render.controller.js)

~~~js
draw() {
  this.prepareFrame();
  this.drawWorldObjects();
  this.finalizeFrame();
}

drawWorldObjects() {
  this.world.plattformGroundResolver.resolvePlatformGround();
  this.world.backgroundRenderer.drawAll(this.world.backgroundObjects);
  this.addObjToMap(this.world.tileset);
  this.addObjToMap(this.world.decorations);
  this.addObjToMap(this.world.collectables);

  if (!this.world.isGameplayFrozen()) {
    this.updateMagicAttacks();
  }
  this.addObjToMap(this.world.magicAttacks);

  this.addToMap(this.world.character);
  if (!this.world.isGameplayFrozen()) {
    this.updateEnemyPlatformLocks();
  }
  this.addObjToMap(this.world.enemies);

  if (!this.world.isGameplayFrozen()) {
    this.world.collisionSystem.run(Date.now());
  }
}
~~~

What it shows:
- Rendering layer order
- Decoupling of draw and gameplay updates
- Temporary gameplay freeze (for example during boss intro) without stopping rendering

---

## 4) Collision + combat as separate systems

Files:
- [models/systems/collision-system.class.js](models/systems/collision-system.class.js)
- [models/systems/collision-combat-system.class.js](models/systems/collision-combat-system.class.js)

~~~js
run(now) {
  this.checkCollectableCollisions();
  this.combatSystem.checkEnemyCollisions(now);
  this.combatSystem.checkMagicAttackCollisions(now);
  this.cleanupDefeatedAndCollected();
}

checkCharacterAttackOnEnemy(enemy, isColliding, now) {
  const canAttack = this.checkIfCanDealDamageToEnemy(enemy, isColliding);
  if (!canAttack) {
    return;
  }

  const damage = this.getCharacterAttackDamage();
  const didTakeDamage = this.applyDamageToEnemy(enemy, damage, now);
  this.playEnemyHitSfx(didTakeDamage);

  if (didTakeDamage) {
    this.onEnemyHitByCharacter(enemy);
  }
}
~~~

What it shows:
- A good boundary between generic collision handling and combat rules
- Extensible for additional damage types or status effects

---

## 5) Combo and magic combat on the character

File: [models/player/character-combat.class.js](models/player/character-combat.class.js)

~~~js
handleAttackInput(now) {
  if (this.character.energy <= 0) {
    return;
  }

  if (!this.attackActive) {
    this.startAttack("ATTACK_1", now);
    return;
  }

  if (now <= this.comboExpiresAt) {
    this.queueNextComboAttack();
  }
}

handleFinishedAttack(now) {
  if (this.magicAttackActive) {
    this.releaseMagicProjectile();
    this.finishAttack();
    return;
  }

  if (this.queuedAttackName && now <= this.comboExpiresAt) {
    this.startAttack(this.queuedAttackName, now);
    return;
  }

  this.finishAttack();
}
~~~

What it shows:
- Input windows for combos
- Shared attack pipeline for melee and magic

---

## 6) Enemy behavior as a decision chain

File: [models/enemies/wolf-behavior.js](models/enemies/wolf-behavior.js)

~~~js
function executeTargetBehavior(wolf, character, now) {
  wolf.faceCharacter();

  if (tryKeepCombatAnimationRunning(wolf)) {
    return;
  }

  if (tryHandleAttackBehavior(wolf, now)) {
    return;
  }

  if (tryHandleChaseBehavior(wolf, character)) {
    return;
  }

  patrol(wolf);
}
~~~

What it shows:
- Readable prioritization of AI decisions
- A solid foundation for later state-machine refactoring

---

## 7) Data-driven level construction

Files:
- [models/core/level-builder.class.js](models/core/level-builder.class.js)
- [levels/level1.js](levels/level1.js)

~~~js
static build(level) {
  const tileConfigs = level?.tiles ?? [];
  const builtTiles = this.buildTiles(tileConfigs);
  const builtEnemies = this.buildEnemies(level?.enemies ?? []);
  const trapEnemies = this.buildSpikeTrapsFromTiles(tileConfigs);

  return {
    backgroundObjects: this.buildBackgrounds(level?.backgroundLayers ?? []),
    tileset: builtTiles,
    enemies: [...builtEnemies, ...trapEnemies],
    collectables: this.buildCollectables(level?.collectables ?? []),
    decorations: this.buildDecorations(level?.decorations ?? []),
  };
}
~~~

What it shows:
- Separation of content (level data) and instantiation (builder)
- Fast gameplay iteration without touching core logic

---

## Optional: "Architecture" section in the README

You can also explain the classes above with a small diagram:

~~~mermaid
flowchart TD
  Game[js/game.js] --> World[World]
  World --> Render[WorldRenderController]
  World --> Flow[WorldFlowController]
  World --> Boss[WorldBossController]
  World --> Overlay[WorldOverlayController]
  World --> Collision[CollisionSystem]
  Collision --> Combat[CollisionCombatSystem]
  World --> LevelBuilder[LevelBuilder]
  LevelBuilder --> LevelData[levels/level1.js]
~~~

This makes it immediately clear in the README how runtime logic, UI, and content data work together.
