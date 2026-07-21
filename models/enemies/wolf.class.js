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
        this.maxEnergy = this.energy;
        this.loadImages(getWolfAnimationPaths());
        this.switchAnimation("WALK");

        this.animate();
    }

    /**
     * Draws wolf sprite and boss health bar.
     * @param {CanvasRenderingContext2D} ctx
     * @returns {void}
     */
    draw(ctx) {
        super.draw(ctx);
        this.drawBossHealthBar(ctx);
    }

    /**
     * Draws the boss health bar above the wolf.
     * @param {CanvasRenderingContext2D} ctx
     * @returns {void}
     */
    drawBossHealthBar(ctx) {
        if (!this.shouldDrawBossHealthBar()) {
            return;
        }

        const metrics = this.getBossHealthBarMetrics();

        ctx.save();
        this.drawBossHealthBarBackground(ctx, metrics);
        this.drawBossHealthBarFill(ctx, metrics);
        this.drawBossHealthBarOutline(ctx, metrics);
        ctx.restore();
    }

    /**
     * Returns geometry values for boss health bar drawing.
     * @returns {{barWidth: number, barHeight: number, border: number, barX: number, barY: number, fillWidth: number}}
     */
    getBossHealthBarMetrics() {
        const barWidth = Math.max(100, this.width * 0.7);
        const barHeight = 10;
        const border = 2;
        const barX = this.x + (this.width - barWidth) / 2;
        const barY = this.y - 14;
        const fillWidth = Math.max(0, (barWidth - border * 2) * this.getBossHealthRatio());

        return { barWidth, barHeight, border, barX, barY, fillWidth };
    }

    /**
     * Draws the boss health bar background layers.
     * @param {CanvasRenderingContext2D} ctx
     * @param {{barWidth: number, barHeight: number, border: number, barX: number, barY: number}} metrics
     * @returns {void}
     */
    drawBossHealthBarBackground(ctx, metrics) {
        const { barX, barY, barWidth, barHeight, border } = metrics;

        ctx.fillStyle = "rgba(10, 10, 10, 0.72)";
        ctx.fillRect(barX, barY, barWidth, barHeight);

        ctx.fillStyle = "#501515";
        ctx.fillRect(barX + border, barY + border, barWidth - border * 2, barHeight - border * 2);
    }

    /**
     * Draws the red foreground fill of the boss health bar.
     * @param {CanvasRenderingContext2D} ctx
     * @param {{barHeight: number, border: number, barX: number, barY: number, fillWidth: number}} metrics
     * @returns {void}
     */
    drawBossHealthBarFill(ctx, metrics) {
        const { barX, barY, barHeight, border, fillWidth } = metrics;

        ctx.fillStyle = "#e23b3b";
        ctx.fillRect(barX + border, barY + border, fillWidth, barHeight - border * 2);
    }

    /**
     * Draws the boss health bar outline.
     * @param {CanvasRenderingContext2D} ctx
     * @param {{barWidth: number, barHeight: number, barX: number, barY: number}} metrics
     * @returns {void}
     */
    drawBossHealthBarOutline(ctx, metrics) {
        const { barX, barY, barWidth, barHeight } = metrics;

        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        ctx.lineWidth = 1;
        ctx.strokeRect(barX + 0.5, barY + 0.5, barWidth - 1, barHeight - 1);
    }

    /**
     * Returns true when the wolf health bar should be visible.
     * @returns {boolean}
     */
    shouldDrawBossHealthBar() {
        return !this.isDefeated && Number.isFinite(this.energy) && Number.isFinite(this.maxEnergy);
    }

    /**
     * Returns normalized boss health ratio between 0 and 1.
     * @returns {number}
     */
    getBossHealthRatio() {
        if (!this.maxEnergy || this.maxEnergy <= 0) {
            return 0;
        }

        const ratio = this.energy / this.maxEnergy;
        return Math.max(0, Math.min(1, ratio));
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