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

    /**
     * Retrieves hitbox.
     * @returns {object|null}
     */
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

    /**
     * Advances sprite animation.
     * @returns {void}
     */
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

    /**
     * Runs ensure spawn anchor.
     * @returns {void}
     */
    ensureSpawnAnchor() {
        if (!Number.isFinite(this.spawnX)) {
            this.spawnX = this.x;
        }
    }

    /**
     * Updates behavior.
     * @param {number} now
     * @returns {void}
     */
    updateBehavior(now) {
        updateWolfBehavior(this, now);
    }

    /**
     * Starts boss intro.
     * @param {string} audioPath
     * @returns {void}
     */
    startBossIntro(audioPath = null) {
        startWolfBossIntro(this, audioPath);
    }

    /**
     * Updates boss intro animation.
     * @returns {void}
     */
    updateBossIntroAnimation() {
        updateWolfBossIntroAnimation(this);
    }

    /**
     * Finishes boss intro.
     * @returns {void}
     */
    finishBossIntro() {
        finishWolfBossIntro(this);
    }

    /**
     * Checks whether wait for boss intro.
     * @returns {boolean}
     */
    shouldWaitForBossIntro() {
        return shouldWolfWaitForBossIntro(this);
    }

    /**
     * Runs hold position until boss intro.
     * @returns {void}
     */
    holdPositionUntilBossIntro() {
        holdWolfPositionUntilBossIntro(this);
    }

    /**
     * Runs animate.
     * @returns {void}
     */
    animate() {
        this.startInterval(() => {
            if (this.world?.isBossIntroActive?.()) {
                this.updateBossIntroAnimation();
                return;
            }

            if (this.world?.isGameplayFrozen?.(this)) {
                return;
            }

            if (this.shouldWaitForBossIntro()) {
                this.holdPositionUntilBossIntro();
                return;
            }

            if (this.handleDefeatAnimation(14)) {
                return;
            }

            this.updateBehavior(Date.now());
            this.advanceSpriteAnimation();
        }, 1000 / 60);

    }
}
