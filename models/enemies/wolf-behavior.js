export function updateWolfBehavior(wolf, now) {
    ensureSpawnAnchor(wolf);

    const character = wolf.getCharacter();
    if (!hasBehaviorTarget(wolf, character)) {
        return;
    }

    executeTargetBehavior(wolf, character, now);
}

function ensureSpawnAnchor(wolf) {
    if (!Number.isFinite(wolf.spawnX)) {
        wolf.spawnX = wolf.x;
    }
}

function hasBehaviorTarget(wolf, character) {
    if (character) {
        return true;
    }

    patrol(wolf);
    return false;
}

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

function isCombatAnimationActive(wolf) {
    return wolf.activeAnimation === "ATTACK" || wolf.activeAnimation === "HOWL";
}

function isCurrentAnimationComplete(wolf) {
    if (!wolf.spriteSheet) {
        return false;
    }

    return wolf.spriteSheet.currentFrame >= wolf.spriteSheet.endFrame;
}

function tryHandleAttackBehavior(wolf, now) {
    if (!wolf.isCharacterInAttackRange()) {
        return false;
    }

    handleAttack(wolf, now);
    return true;
}

function tryHandleChaseBehavior(wolf, character) {
    if (!wolf.isCharacterNearby()) {
        return false;
    }

    chaseCharacter(wolf, character);
    return true;
}

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

function tryStartAttack(wolf, now) {
    if (!wolf.canAttackCharacter(now)) {
        return false;
    }

    wolf.markAttack(now);
    wolf.switchAnimation("ATTACK");
    return true;
}

function stopMovement(wolf) {
    wolf.speed = 0;
}

function chaseCharacter(wolf, character) {
    wolf.speed = wolf.runSpeed;
    wolf.switchAnimation("RUN");

    if (character.x < wolf.x) {
        wolf.moveLeft();
        return;
    }

    wolf.moveRight();
}

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

function updatePatrolDirection(wolf, minX, maxX) {
    if (wolf.x <= minX) {
        wolf.patrolDirection = 1;
    } else if (wolf.x >= maxX) {
        wolf.patrolDirection = -1;
    }
}