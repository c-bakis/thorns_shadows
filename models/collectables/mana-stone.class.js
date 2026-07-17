import Collectable from "./collectables.class.js";

export default class ManaStone extends Collectable {
    manaAmount = 20;

    SPRITE_ANIMATIONS = {
        DEFAULT: {
        path: "img/objects/mana_stone.png",
        frameWidth: 160,
        frameHeight: 128,
        frameCount: 6,
        },
    };

    activeAnimation = "DEFAULT";

    constructor(config = {}) {
        super();
        this.applyPositionAndSize(config);
        this.applyHitboxFromSize();
        this.applyManaAmount(config);

        const animationPaths = this.getAnimationPaths();
        this.loadImages(animationPaths);
        this.switchAnimation("DEFAULT");
        this.animate();
    }

    /**
     * Applies configured position and size with defaults.
     * @param {object} config
     * @returns {void}
     */
    applyPositionAndSize(config) {
        this.x = Number.isFinite(config.x) ? config.x : 0;
        this.y = Number.isFinite(config.y) ? config.y : 0;
        this.width = Number.isFinite(config.width) ? config.width : 110;
        this.height = Number.isFinite(config.height) ? config.height : 110;
    }

    /**
     * Derives mana-stone hitbox based on current width/height.
     * @returns {void}
     */
    applyHitboxFromSize() {
        this.hitboxOffsetX = this.width * 0.35;
        this.hitboxOffsetY = this.height * 0.18;
        this.hitboxWidth = this.width * 0.24;
        this.hitboxHeight = this.height * 0.50;
    }

    /**
     * Applies optional mana amount override from config.
     * @param {object} config
     * @returns {void}
     */
    applyManaAmount(config) {
        this.manaAmount = Number.isFinite(config.manaAmount)
            ? config.manaAmount
            : this.manaAmount;
    }

    /**
     * Returns all sprite animation paths for preloading.
     * @returns {string[]}
     */
    getAnimationPaths() {
        return Object.values(this.SPRITE_ANIMATIONS).map((animation) => animation.path);
    }

    /**
     * Runs animate.
     * @returns {void}
     */
    animate() {
        this.startInterval(() => {
            this.switchAnimation("DEFAULT");
            this.advanceSpriteAnimation(10);
        }, 1000 / 60);
    }

    /**
     * Runs on collect.
     * @param {object} character
     * @returns {void}
     */
    onCollect(character) {
        if (typeof character.increaseMana === "function") {
            character.increaseMana(this.manaAmount);
        }
        this.collected = true;
    }
}
