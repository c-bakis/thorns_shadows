export const WOLF_SPRITE_ANIMATIONS = {
    HOWL: {
        path: "img/enemies/wolf/wolf.png",
        frameWidth: 64,
        frameHeight: 40,
        frameCount: 4,
        sheetFrameCount: 5,
        startFrame: 1,
        endFrame: 4,
        sourceY: 0,
        speed: 20,
    },
    WALK: {
        path: "img/enemies/wolf/wolf.png",
        frameWidth: 64,
        frameHeight: 32,
        frameCount: 4,
        sourceY: 41,
        speed: 12,
    },
    RUN: {
        path: "img/enemies/wolf/wolf.png",
        frameWidth: 64,
        frameHeight: 32,
        frameCount: 4,
        sourceY: 73,
        speed: 14,
    },
    ATTACK: {
        path: "img/enemies/wolf/wolf.png",
        frameWidth: 64,
        frameHeight: 32,
        frameCount: 4,
        sourceY: 105,
        speed: 16,
    },
};

/**
 * Applies wolf defaults.
 * @param {object} wolf
 * @returns {void}
 */
export function applyWolfDefaults(wolf) {
    wolf.damage = 25;
    wolf.energy = 50;
    wolf.experiencePoints = 30;
    wolf.damageWindowStartFrame = 2;
    wolf.damageWindowEndFrame = 3;
    wolf.damageWindowAnimation = "ATTACK";
    wolf.aggroRangeX = 320;
    wolf.attackRangeX = 105;
    wolf.attackRangeY = 85;
    wolf.attackCooldownMs = 1400;
    wolf.walkSpeed = 0.65;
    wolf.runSpeed = 5;
    wolf.patrolRange = 240;
    wolf.patrolDirection = -1;
    wolf.spawnX = null;
    wolf.bossIntroAudio = null;
    wolf.bossIntroHowlLocked = false;
    wolf.activeAnimation = "WALK";
    wolf.animationCounter = 0;

    wolf.x = 700;
    wolf.y = 290;
    wolf.width = 190;
    wolf.height = 120;
    wolf.hitboxOffsetX = 0;
    wolf.hitboxOffsetY = 0;
    wolf.hitboxWidth = 190;
    wolf.hitboxHeight = 80;
    wolf.speed = wolf.walkSpeed;
}

/**
 * Retrieves wolf animation paths.
 * @returns {object|null}
 */
export function getWolfAnimationPaths() {
    return Object.values(WOLF_SPRITE_ANIMATIONS).map((config) => config.path);
}
