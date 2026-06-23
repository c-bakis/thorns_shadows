import Enemy from "./enemy.class.js";

export default class Wolf extends Enemy {
    damage = 25;
    energy = 50;
    experiencePoints = 30;
    damageWindowStartFrame = 2;
    damageWindowEndFrame = 3;
    damageWindowAnimation = "ATTACK";
    aggroRangeX = 320;
    attackRangeX = 105;
    attackRangeY = 85;
    attackCooldownMs = 1400;
    walkSpeed = 0.65;
    runSpeed = 5;
    patrolRange = 240;
    patrolDirection = -1;
    spawnX = null;

    SPRITE_ANIMATIONS = {
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

    activeAnimation = "WALK";
    animationCounter = 0;

    constructor() {
        super();
        this.x = 700;
        this.y = 290;
        this.width = 190;
        this.height = 120;
        this.hitboxOffsetX = 0;
        this.hitboxOffsetY = 0;
        this.hitboxWidth = 190;
        this.hitboxHeight = 80;
        this.speed = this.walkSpeed;
        const animationPaths = Object.values(this.SPRITE_ANIMATIONS).map(
            (config) => config.path,
        );
        this.loadImages(animationPaths);
        this.switchAnimation("WALK");

        this.animate();
    }

    getHitbox() {
        const width = this.hitboxWidth ?? this.width;
        const height = this.hitboxHeight ?? this.height;
        const baseOffsetX = this.hitboxOffsetX ?? 0;
        const offsetY = this.hitboxOffsetY ?? 0;
        const mirroredOffsetX = this.width - baseOffsetX - width;
        const offsetX = this.otherDirection ? mirroredOffsetX : baseOffsetX;

        return {
            x: this.x + offsetX,
            y: this.y + offsetY,
            width,
            height,
        };
    }

    advanceSpriteAnimation() {
        if (!this.spriteSheet) {
            return;
        }

        const speed = this.spriteSheet.speed || 2;
        this.animationCounter++;
        if (this.animationCounter % speed !== 0) {
            return;
        }

        const startFrame = Number.isFinite(this.spriteSheet.startFrame)
            ? this.spriteSheet.startFrame
            : 0;
        const endFrame = Number.isFinite(this.spriteSheet.endFrame)
            ? this.spriteSheet.endFrame
            : this.spriteSheet.frameCount - 1;

        if (this.spriteSheet.currentFrame >= endFrame) {
            this.spriteSheet.currentFrame = startFrame;
            return;
        }

        this.spriteSheet.currentFrame++;
    }

    ensureSpawnAnchor() {
        if (!Number.isFinite(this.spawnX)) {
            this.spawnX = this.x;
        }
    }

    updateBehavior(now) {
        this.ensureSpawnAnchor();

        const character = this.getCharacter();
        if (!this.hasBehaviorTarget(character)) {
            return;
        }

        this.executeTargetBehavior(character, now);
    }

    hasBehaviorTarget(character) {
        if (character) {
            return true;
        }

        this.handleNoTargetBehavior();
        return false;
    }

    executeTargetBehavior(character, now) {
        this.faceCharacter();

        if (this.tryKeepCombatAnimationRunning()) {
            return;
        }

        if (this.tryHandleAttackBehavior(now)) {
            return;
        }

        if (this.tryHandleChaseBehavior(character)) {
            return;
        }

        this.patrol();
    }

    handleNoTargetBehavior() {
        this.patrol();
    }

    tryKeepCombatAnimationRunning() {
        if (!this.isCombatAnimationActive()) {
            return false;
        }

        if (this.isCurrentAnimationComplete()) {
            return false;
        }

        this.stopMovement();
        return true;
    }

    isCombatAnimationActive() {
        return this.activeAnimation === "ATTACK" || this.activeAnimation === "HOWL";
    }

    isCurrentAnimationComplete() {
        if (!this.spriteSheet) {
            return false;
        }

        return this.spriteSheet.currentFrame >= this.spriteSheet.endFrame;
    }

    tryHandleAttackBehavior(now) {
        if (!this.isCharacterInAttackRange()) {
            return false;
        }

        this.handleAttack(now);
        return true;
    }

    tryHandleChaseBehavior(character) {
        if (!this.isCharacterNearby()) {
            return false;
        }

        this.chaseCharacter(character);
        return true;
    }

    handleAttack(now) {
        this.stopMovement();

        if (this.tryKeepCombatAnimationRunning()) {
            return;
        }

        if (this.tryStartAttack(now)) {
            return;
        }

        this.playHowl();
    }

    tryStartAttack(now) {
        if (!this.canAttackCharacter(now)) {
            return false;
        }

        this.markAttack(now);
        this.switchAnimation("ATTACK");
        return true;
    }

    playHowl() {
        this.switchAnimation("HOWL");
    }

    stopMovement() {
        this.speed = 0;
    }

    chaseCharacter(character) {
        this.prepareRun();
        this.moveTowardsX(character.x);
    }

    prepareRun() {
        this.speed = this.runSpeed;
        this.switchAnimation("RUN");
    }

    moveTowardsX(targetX) {
        if (targetX < this.x) {
            this.moveLeft();
            return;
        }

        this.moveRight();
    }

    patrol() {
        this.prepareWalk();

        const minX = this.spawnX - this.patrolRange;
        const maxX = this.spawnX + this.patrolRange;
        this.updatePatrolDirection(minX, maxX);
        this.moveInPatrolDirection();
    }

    prepareWalk() {
        this.speed = this.walkSpeed;
        this.switchAnimation("WALK");
    }

    updatePatrolDirection(minX, maxX) {
        if (this.x <= minX) {
            this.patrolDirection = 1;
        } else if (this.x >= maxX) {
            this.patrolDirection = -1;
        }
    }

    moveInPatrolDirection() {
        if (this.patrolDirection < 0) {
            this.moveLeft();
            return;
        }

        this.moveRight();
    }

    animate() {
        setInterval(() => {
            if (this.handleDefeatAnimation(14)) {
                return;
            }

            this.updateBehavior(Date.now());
            this.advanceSpriteAnimation();
        }, 1000 / 60);

    }
}