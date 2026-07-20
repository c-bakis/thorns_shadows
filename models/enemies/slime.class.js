import Enemy from "./enemy.class.js";

export default class Slime extends Enemy {
    damage = 10;
    energy= 10;
    experiencePoints = 0;

    SPRITE_ANIMATIONS = {
        WALK: {
            path: "img/enemies/blue_slime/walk.png",
            frameWidth: 128,
            frameHeight: 128,
            frameCount: 8,
        },
    };

    activeAnimation = "WALK";
    animationCounter = 0;

    
    constructor() {
        super();
        this.x = Math.random() * 1000 + 350;
        this.y = 270;
        this.width = 130;
        this.height = 140;
        this.hitboxOffsetX = 35;
        this.hitboxOffsetY = 110;
        this.hitboxWidth = 50;
        this.hitboxHeight = 35;
        this.speed = 0.15 + Math.random() * 0.25; 
        const animationPaths = Object.values(this.SPRITE_ANIMATIONS).map(
            (config) => config.path,
        );
        this.loadImages(animationPaths);
        this.switchAnimation("WALK");

        this.animate();
    }

    /**
     * Advances sprite animation.
     * @param {number} speed
     * @returns {void}
     */
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

    /**
     * Runs animate.
     * @returns {void}
     */
    animate() {
        this.startInterval(() => {
            if (this.shouldSkipSlimeTick()) {
                return;
            }

            this.moveLeft();
            this.switchAnimation("WALK");
            this.advanceSpriteAnimation(14);
        }, 1000 / 60);

    }

    /**
     * Returns true when slime tick should not continue this frame.
     * @returns {boolean}
     */
    shouldSkipSlimeTick() {
        if (this.world?.isGameplayFrozen?.(this)) {
            return true;
        }

        return this.handleDefeatAnimation(14);
    }
}
