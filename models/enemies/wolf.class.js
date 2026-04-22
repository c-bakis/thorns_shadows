import Enemy from "./enemy.class.js";

export default class Wolf extends Enemy {
    damage = 25;
    energy = 50;
    damageWindowStartFrame = 2;
    damageWindowEndFrame = 3;
    damageWindowAnimation = "ATTACK";
    aggroRangeX = 320;
    attackRangeX = 105;
    attackRangeY = 85;
    attackCooldownMs = 900;
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
            frameCount: 3,
            sourceY: 0,
        },
        WALK: {
            path: "img/enemies/wolf/wolf.png",
            frameWidth: 64,
            frameHeight: 32,
            frameCount: 4,
            sourceY: 41,
        },        
        RUN: {
            path: "img/enemies/wolf/wolf.png",
            frameWidth: 64,
            frameHeight: 32,
            frameCount: 4,
            sourceY: 73,
        },
        ATTACK: {
            path: "img/enemies/wolf/wolf.png",
            frameWidth: 64,
            frameHeight: 32,
            frameCount: 4,
            sourceY: 105,
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

    switchAnimation(name) {
        if (this.activeAnimation === name && this.spriteSheet) {
            return;
        }

        const config = this.SPRITE_ANIMATIONS[name];
        if (!config) {
            return;
        }

        this.activeAnimation = name;
        this.animationCounter = 0;
        this.spriteSheet = {
            frameWidth: config.frameWidth,
            frameHeight: config.frameHeight,
            frameCount: config.frameCount,
            columns: config.frameCount,
            sourceY: config.sourceY,
            startRow: config.startRow ?? 0,
            layout: "row",
            currentFrame: 0,
        };
        this.img = this.imgCache[config.path];

        if (!this.img) {
            this.loadImage(config.path);
        }
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

    advanceSpriteAnimation(speed) {
        if (!this.spriteSheet) {
            return;
        }

        this.animationCounter++;
        if (this.animationCounter % speed !== 0) {
            return;
        }

        this.spriteSheet.currentFrame =
            (this.spriteSheet.currentFrame + 1) % this.spriteSheet.frameCount;
    }

    ensureSpawnAnchor() {
        if (!Number.isFinite(this.spawnX)) {
            this.spawnX = this.x;
        }
    }

    updateBehavior(now) {
        this.ensureSpawnAnchor();

        const character = this.getCharacter();
        if (!character) {
            this.patrol();
            return;
        }

        this.faceCharacter();

        if (this.isCharacterInAttackRange()) {
            this.handleAttack(now);
            return;
        }

        if (this.isCharacterNearby()) {
            this.chaseCharacter(character);
            return;
        }

        this.patrol();
    }

    handleAttack(now) {
        this.speed = 0;

        if (this.activeAnimation === "ATTACK" && !this.canAttackCharacter(now)) {
            return;
        }

        if (this.canAttackCharacter(now)) {
            this.markAttack(now);
            this.switchAnimation("ATTACK");
            return;
        }

        this.switchAnimation("HOWL");
    }

    chaseCharacter(character) {
        this.speed = this.runSpeed;
        this.switchAnimation("RUN");

        if (character.x < this.x) {
            this.moveLeft();
            return;
        }

        this.moveRight();
    }

    patrol() {
        this.speed = this.walkSpeed;
        this.switchAnimation("WALK");

        const minX = this.spawnX - this.patrolRange;
        const maxX = this.spawnX + this.patrolRange;

        if (this.x <= minX) {
            this.patrolDirection = 1;
        } else if (this.x >= maxX) {
            this.patrolDirection = -1;
        }

        if (this.patrolDirection < 0) {
            this.moveLeft();
            return;
        }

        this.moveRight();
    }

    animate() {
        setInterval(() => {
            this.updateBehavior(Date.now());
            this.advanceSpriteAnimation(14);
        }, 1000 / 60);

    }
}