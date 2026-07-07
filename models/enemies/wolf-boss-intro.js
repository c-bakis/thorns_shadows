import {
    finishEnemyBossIntro,
    holdEnemyForBossIntro,
    shouldEnemyWaitForBossIntro,
    startEnemyBossIntro,
    updateEnemyBossIntroAnimation,
} from "./enemy-boss-intro.js";

const WOLF_BOSS_INTRO_TYPE = "wolf";
const WOLF_BOSS_INTRO_ANIMATION = "HOWL";
const WOLF_BOSS_HOLD_ANIMATION = "ATTACK";
const WOLF_BOSS_FINISH_ANIMATION = "WALK";

/**
 * Starts wolf boss intro.
 * @param {object} wolf
 * @param {string} audioPath
 * @returns {void}
 */
export function startWolfBossIntro(wolf, audioPath = null) {
    startEnemyBossIntro(wolf, {
        audioPath,
        animationName: WOLF_BOSS_INTRO_ANIMATION,
        onStart: (enemy) => {
            enemy.bossIntroHowlLocked = true;
        },
    });
}

/**
 * Updates wolf boss intro animation.
 * @param {object} wolf
 * @returns {void}
 */
export function updateWolfBossIntroAnimation(wolf) {
    updateEnemyBossIntroAnimation(wolf, {
        animationName: WOLF_BOSS_INTRO_ANIMATION,
    });
}

/**
 * Finishes wolf boss intro.
 * @param {object} wolf
 * @returns {void}
 */
export function finishWolfBossIntro(wolf) {
    finishEnemyBossIntro(wolf, {
        animationName: WOLF_BOSS_FINISH_ANIMATION,
        onFinish: (enemy) => {
            enemy.bossIntroHowlLocked = false;
        },
    });
}

/**
 * Checks whether wolf wait for boss intro.
 * @param {object} wolf
 * @returns {boolean}
 */
export function shouldWolfWaitForBossIntro(wolf) {
    return shouldEnemyWaitForBossIntro(wolf, WOLF_BOSS_INTRO_TYPE);
}

/**
 * Runs hold wolf position until boss intro.
 * @param {object} wolf
 * @returns {void}
 */
export function holdWolfPositionUntilBossIntro(wolf) {
    holdEnemyForBossIntro(wolf, {
        animationName: WOLF_BOSS_HOLD_ANIMATION,
    });
}
