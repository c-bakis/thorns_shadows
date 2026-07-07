/**
 * Updates wolf behavior.
 * @param {object} wolf
 * @param {number} now
 * @returns {void}
 */
export function updateWolfBehavior(wolf, now) {
    ensureSpawnAnchor(wolf);

    const character = wolf.getCharacter();
    if (!hasBehaviorTarget(wolf, character)) {
        return;
    }

    executeTargetBehavior(wolf, character, now);
}

/**
 * Runs ensure spawn anchor.
 * @param {object} wolf
 * @returns {void}
 */
function ensureSpawnAnchor(wolf) {
    if (!Number.isFinite(wolf.spawnX)) {
        wolf.spawnX = wolf.x;
    }
}

/**
 * Runs has behavior target.
 * @param {object} wolf
 * @param {object} character
 * @returns {boolean}
 */
function hasBehaviorTarget(wolf, character) {
    if (character) {
        return true;
    }

    patrol(wolf);
    return false;
}

/**
 * Runs execute target behavior.
 * @param {object} wolf
 * @param {object} character
 * @param {number} now
 * @returns {void}
 */
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

/**
 * Runs try keep combat animation running.
 * @param {object} wolf
 * @returns {void}
 */
function tryKeepCombatAnimationRunning(wolf) {
    if (!isCombatAnimationActive(wolf)) {
        return false;
    }

    if (isCurrentAnimationComplete(wolf)) {
        return false;
    }

    stopMovement(wolf);
    return true;
}

/**
 * Checks whether this object is combat animation active.
 * @param {object} wolf
 * @returns {boolean}
 */
function isCombatAnimationActive(wolf) {
    return wolf.activeAnimation === "ATTACK" || wolf.activeAnimation === "HOWL";
}

/**
 * Checks whether this object is current animation complete.
 * @param {object} wolf
 * @returns {boolean}
 */
function isCurrentAnimationComplete(wolf) {
    if (!wolf.spriteSheet) {
        return false;
    }

    return wolf.spriteSheet.currentFrame >= wolf.spriteSheet.endFrame;
}

/**
 * Runs try handle attack behavior.
 * @param {object} wolf
 * @param {number} now
 * @returns {void}
 */
function tryHandleAttackBehavior(wolf, now) {
    if (!wolf.isCharacterInAttackRange()) {
        return false;
    }

    handleAttack(wolf, now);
    return true;
}

/**
 * Runs try handle chase behavior.
 * @param {object} wolf
 * @param {object} character
 * @returns {void}
 */
function tryHandleChaseBehavior(wolf, character) {
    if (!wolf.isCharacterNearby()) {
        return false;
    }

    chaseCharacter(wolf, character);
    return true;
}

/**
 * Handles attack.
 * @param {object} wolf
 * @param {number} now
 * @returns {void}
 */
function handleAttack(wolf, now) {
    stopMovement(wolf);

    if (tryKeepCombatAnimationRunning(wolf)) {
        return;
    }

    if (tryStartAttack(wolf, now)) {
        return;
    }

    wolf.switchAnimation("HOWL");
}

/**
 * Runs try start attack.
 * @param {object} wolf
 * @param {number} now
 * @returns {void}
 */
function tryStartAttack(wolf, now) {
    if (!wolf.canAttackCharacter(now)) {
        return false;
    }

    wolf.markAttack(now);
    wolf.switchAnimation("ATTACK");
    return true;
}

/**
 * Runs stop movement.
 * @param {object} wolf
 * @returns {void}
 */
function stopMovement(wolf) {
    wolf.speed = 0;
}

/**
 * Runs chase character.
 * @param {object} wolf
 * @param {object} character
 * @returns {void}
 */
function chaseCharacter(wolf, character) {
    wolf.speed = wolf.runSpeed;
    wolf.switchAnimation("RUN");

    if (character.x < wolf.x) {
        wolf.moveLeft();
        return;
    }

    wolf.moveRight();
}

/**
 * Runs patrol.
 * @param {object} wolf
 * @returns {void}
 */
function patrol(wolf) {
    wolf.speed = wolf.walkSpeed;
    wolf.switchAnimation("WALK");

    const minX = wolf.spawnX - wolf.patrolRange;
    const maxX = wolf.spawnX + wolf.patrolRange;
    updatePatrolDirection(wolf, minX, maxX);

    if (wolf.patrolDirection < 0) {
        wolf.moveLeft();
        return;
    }

    wolf.moveRight();
}

/**
 * Updates patrol direction.
 * @param {object} wolf
 * @param {object} minX
 * @param {object} maxX
 * @returns {void}
 */
function updatePatrolDirection(wolf, minX, maxX) {
    if (wolf.x <= minX) {
        wolf.patrolDirection = 1;
    } else if (wolf.x >= maxX) {
        wolf.patrolDirection = -1;
    }
}
