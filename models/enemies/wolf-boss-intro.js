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

export function startWolfBossIntro(wolf, audioPath) {
    startEnemyBossIntro(wolf, {
        audioPath: audioPath,
        animationName: WOLF_BOSS_INTRO_ANIMATION,
        onStart: (enemy) => {
            enemy.bossIntroHowlLocked = true;
        },
    });
}

export function updateWolfBossIntroAnimation(wolf) {
    updateEnemyBossIntroAnimation(wolf, {
        animationName: WOLF_BOSS_INTRO_ANIMATION,
    });
}

export function finishWolfBossIntro(wolf) {
    finishEnemyBossIntro(wolf, {
        animationName: WOLF_BOSS_FINISH_ANIMATION,
        onFinish: (enemy) => {
            enemy.bossIntroHowlLocked = false;
        },
    });
}

export function shouldWolfWaitForBossIntro(wolf) {
    return shouldEnemyWaitForBossIntro(wolf, WOLF_BOSS_INTRO_TYPE);
}

export function holdWolfPositionUntilBossIntro(wolf) {
    holdEnemyForBossIntro(wolf, {
        animationName: WOLF_BOSS_HOLD_ANIMATION,
    });
}