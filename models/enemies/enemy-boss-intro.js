/**
 * Checks whether enemy wait for boss intro.
 * @param {object} enemy
 * @param {string} enemyType
 * @returns {boolean}
 */
export function shouldEnemyWaitForBossIntro(enemy, enemyType = null) {
    const bossIntro = enemy.world?.level?.bossIntro;
    if (!bossIntro) {
        return false;
    }

    const resolvedEnemyType = (enemyType ?? enemy.constructor?.name ?? "").toLowerCase();
    if (bossIntro.enemyType?.toLowerCase() !== resolvedEnemyType) {
        return false;
    }

    return enemy.world?.bossIntroState?.played !== true;
}

/**
 * Runs hold enemy for boss intro.
 * @param {object} enemy
 * @param {object} options
 * @returns {void}
 */
export function holdEnemyForBossIntro(enemy, options = {}) {
    const {
        animationName,
        faceCharacter = true,
    } = options;

    stopEnemyMovement(enemy);
    if (faceCharacter) {
        enemy.faceCharacter();
    }
    if (animationName) {
        enemy.switchAnimation(animationName);
    }

    resetToAnimationStart(enemy);
}

/**
 * Starts enemy boss intro.
 * @param {object} enemy
 * @param {object} options
 * @returns {void}
 */
export function startEnemyBossIntro(enemy, options = {}) {
    const {
        audioPath = null,
        animationName,
        faceCharacter = true,
        audioProperty = "bossIntroAudio",
        onStart = null,
    } = options;

    stopEnemyMovement(enemy);
    if (faceCharacter) {
        enemy.faceCharacter();
    }
    if (typeof onStart === "function") {
        onStart(enemy);
    }
    if (animationName) {
        enemy.switchAnimation(animationName);
    }

    resetToAnimationStart(enemy);
    playBossIntroAudio(enemy, audioPath, audioProperty);
}

/**
 * Updates enemy boss intro animation.
 * @param {object} enemy
 * @param {object} options
 * @returns {void}
 */
export function updateEnemyBossIntroAnimation(enemy, options = {}) {
    const {
        animationName,
        faceCharacter = true,
    } = options;

    stopEnemyMovement(enemy);
    if (faceCharacter) {
        enemy.faceCharacter();
    }
    if (animationName) {
        enemy.switchAnimation(animationName);
    }

    if (!enemy.spriteSheet) {
        return;
    }

    const endFrame = getAnimationEndFrame(enemy);
    if (enemy.spriteSheet.currentFrame >= endFrame) {
        enemy.spriteSheet.currentFrame = endFrame;
        return;
    }

    enemy.advanceSpriteAnimation();
}

/**
 * Finishes enemy boss intro.
 * @param {object} enemy
 * @param {object} options
 * @returns {void}
 */
export function finishEnemyBossIntro(enemy, options = {}) {
    const {
        animationName = null,
        onFinish = null,
    } = options;

    if (typeof onFinish === "function") {
        onFinish(enemy);
    }

    if (animationName) {
        enemy.switchAnimation(animationName);
    }
}

/**
 * Plays boss intro audio.
 * @param {object} enemy
 * @param {string} audioPath
 * @param {object} audioProperty
 * @returns {void}
 */
function playBossIntroAudio(enemy, audioPath, audioProperty) {
    if (!audioPath) {
        return;
    }

    const isWolfHowl = /wolf-howl\./i.test(audioPath);

    const audioManager = enemy.world?.audioManager;
    if (typeof audioManager?.playSfx === "function") {
        audioManager.playSfx(audioPath, {
            volume: 0.6,
            maxDurationMs: 2450,
            startTimeSec: isWolfHowl ? 1 : 0,
        });
        return;
    }

    enemy[audioProperty].currentTime = isWolfHowl ? 1 : 0;
    enemy[audioProperty].play().catch(() => {});
}

/**
 * Runs stop enemy movement.
 * @param {object} enemy
 * @returns {void}
 */
function stopEnemyMovement(enemy) {
    enemy.speed = 0;
}

/**
 * Resets to animation start.
 * @param {object} enemy
 * @returns {void}
 */
function resetToAnimationStart(enemy) {
    if (!enemy.spriteSheet) {
        return;
    }

    enemy.spriteSheet.currentFrame = enemy.spriteSheet.startFrame ?? 0;
}

/**
 * Retrieves animation end frame.
 * @param {object} enemy
 * @returns {object|null}
 */
function getAnimationEndFrame(enemy) {
    if (Number.isFinite(enemy.spriteSheet?.endFrame)) {
        return enemy.spriteSheet.endFrame;
    }

    return enemy.spriteSheet.frameCount - 1;
}
