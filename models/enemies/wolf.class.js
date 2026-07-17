import Enemy from "./enemy.class.js";
import {
    applyWolfDefaults,
    getWolfAnimationPaths,
    WOLF_SPRITE_ANIMATIONS,
} from "./wolf-config.js";
import { updateWolfBehavior } from "./wolf-behavior.js";
import {
    finishWolfBossIntro,
    holdWolfPositionUntilBossIntro,
    shouldWolfWaitForBossIntro,
    startWolfBossIntro,
    updateWolfBossIntroAnimation,
} from "./wolf-boss-intro.js";

export default class Wolf extends Enemy {
    SPRITE_ANIMATIONS = WOLF_SPRITE_ANIMATIONS;

    constructor() {
        super();
        applyWolfDefaults(this);
        this.loadImages(getWolfAnimationPaths());
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

        const speed = this.getCurrentAnimationSpeed();
        this.animationCounter++;
        if (this.animationCounter % speed !== 0) {
            return;
        }

        const { startFrame, endFrame } = this.getCurrentAnimationFrameRange();

        if (this.spriteSheet.currentFrame >= endFrame) {
            this.spriteSheet.currentFrame = startFrame;
            return;
        }

        this.spriteSheet.currentFrame++;
    }

    /**
     * Returns current animation speed.
     * @returns {number}
     */
    getCurrentAnimationSpeed() {
        return this.spriteSheet.speed || 2;
    }

    /**
     * Returns start/end frame range for current animation.
     * @returns {{startFrame: number, endFrame: number}}
     */
    getCurrentAnimationFrameRange() {
        const startFrame = Number.isFinite(this.spriteSheet.startFrame)
            ? this.spriteSheet.startFrame
            : 0;
        const endFrame = Number.isFinite(this.spriteSheet.endFrame)
            ? this.spriteSheet.endFrame
            : this.spriteSheet.frameCount - 1;

        return { startFrame, endFrame };
    }

    ensureSpawnAnchor() {
        if (!Number.isFinite(this.spawnX)) {
            this.spawnX = this.x;
        }
    }

    updateBehavior(now) {
        updateWolfBehavior(this, now);
    }

    startBossIntro(audioPath) {
        startWolfBossIntro(this, audioPath);
    }

    updateBossIntroAnimation() {
        updateWolfBossIntroAnimation(this);
    }

    finishBossIntro() {
        finishWolfBossIntro(this);
    }

    shouldWaitForBossIntro() {
        return shouldWolfWaitForBossIntro(this);
    }

    holdPositionUntilBossIntro() {
        holdWolfPositionUntilBossIntro(this);
    }

    animate() {
        this.startInterval(() => {
            if (this.shouldSkipWolfTick()) {
                return;
            }

            if (this.handleDefeatAnimation(14)) {
                return;
            }

            this.updateBehavior(Date.now());
            this.advanceSpriteAnimation();
        }, 1000 / 60);

    }

    /**
     * Returns true when the wolf tick should exit early.
     * @returns {boolean}
     */
    shouldSkipWolfTick() {
        if (this.world?.isBossIntroActive?.()) {
            this.updateBossIntroAnimation();
            return true;
        }

        if (this.world?.isGameplayFrozen?.(this)) {
            return true;
        }

        if (!this.shouldWaitForBossIntro()) {
            return false;
        }

        this.holdPositionUntilBossIntro();
        return true;
    }
}