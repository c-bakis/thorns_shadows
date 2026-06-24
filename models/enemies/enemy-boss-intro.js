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

function playBossIntroAudio(enemy, audioPath, audioProperty) {
    if (!audioPath) {
        return;
    }

    if (!enemy[audioProperty] || enemy[audioProperty].src !== audioPath) {
        enemy[audioProperty] = new Audio(audioPath);
        enemy[audioProperty].preload = "auto";
    }

    enemy[audioProperty].currentTime = 0;
    enemy[audioProperty].play().catch(() => {});
}

function stopEnemyMovement(enemy) {
    enemy.speed = 0;
}

function resetToAnimationStart(enemy) {
    if (!enemy.spriteSheet) {
        return;
    }

    enemy.spriteSheet.currentFrame = enemy.spriteSheet.startFrame ?? 0;
}

function getAnimationEndFrame(enemy) {
    if (Number.isFinite(enemy.spriteSheet?.endFrame)) {
        return enemy.spriteSheet.endFrame;
    }

    return enemy.spriteSheet.frameCount - 1;
}