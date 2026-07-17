import Enemy from "./enemy.class.js";

export default class Spider extends Enemy {
    damage = 10;
    energy = 10;
    experiencePoints = 20;
    damageWindowStartFrame = 0;
    damageWindowEndFrame = 7;
    damageWindowAnimation = "ATTACK";
    acceleration = 0;
    groundY = 100;
    defaultGroundY = 100;
    lockedY = null;
    platformYOffset = 0;

    SPRITE_ANIMATIONS = {
        ATTACK: {
            path: "img/enemies/spider/spider11.png",
            frameWidth: 64,
            frameHeight: 64,
            frameCount: 8,
            columns: 8,
            startRow: 2,
        },
    };

    activeAnimation = "ATTACK";
    animationCounter = 0;

    constructor() {
        super();
        this.x = 1200;
        this.y = 100;
        this.width = 96;
        this.height = 96;
        this.hitboxOffsetX = 20;
        this.hitboxOffsetY = 20;
        this.hitboxWidth = 56;
        this.hitboxHeight = 55;
        this.speed = 0;
        const animationPaths = Object.values(this.SPRITE_ANIMATIONS).map(
            (config) => config.path,
        );
        this.loadImages(animationPaths);
        this.switchAnimation("ATTACK");

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
     * Runs draw.
     * @param {CanvasRenderingContext2D} ctx
     * @returns {void}
     */
    draw(ctx) {
        this.drawThread(ctx);
        super.draw(ctx);
    }

    /**
     * Runs draw thread.
     * @param {CanvasRenderingContext2D} ctx
     * @returns {void}
     */
    drawThread(ctx) {
        const x = this.x + this.width / 2;
        const y = this.y + this.hitboxOffsetY;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, y);
        ctx.strokeStyle = "rgba(220, 220, 240, 0.55)";
        ctx.lineWidth = 0.8;
        ctx.setLineDash([4, 6]);
        ctx.lineDashOffset = this.animationCounter * 0.4;
        ctx.stroke();
        ctx.restore();
    }

    /**
     * Runs animate.
     * @returns {void}
     */
    animate() {
        this.startInterval(() => {
            if (this.shouldSkipSpiderTick()) {
                return;
            }

            this.updatePlatformLock();
            this.switchAnimation("ATTACK");
            this.advanceSpriteAnimation(10);
        }, 1000 / 60);
    }

    /**
     * Returns true when spider tick should not continue this frame.
     * @returns {boolean}
     */
    shouldSkipSpiderTick() {
        if (this.world?.isGameplayFrozen?.(this)) {
            return true;
        }

        return this.handleDefeatAnimation(10);
    }

    /**
     * Updates platform lock.
     * @param {object} tileset
     * @returns {void}
     */
    updatePlatformLock(tileset) {
        this.ensureLockedY(tileset);
        if (!this.hasLockedY()) {
            return;
        }

        this.applyLockedY();
    }

    /**
     * Runs snap to floating platform.
     * @param {object} tileset
     * @returns {void}
     */
    snapToFloatingPlatform(tileset) {
        const floatingTiles = this.getFloatingTiles(tileset);
        if (floatingTiles.length === 0) {
            return;
        }

        const centerX = this.getCenterX();
        const targetTile = this.findTargetFloatingTile(floatingTiles, centerX);
        if (!targetTile) {
            return;
        }

        const standingY = this.calculateStandingY(targetTile);
        this.setLockedY(standingY);
    }

    /**
     * Sets platform yoffset.
     * @param {number} offset
     * @returns {void}
     */
    setPlatformYOffset(offset) {
        if (!Number.isFinite(offset)) {
            return;
        }

        this.platformYOffset = offset;
        if (Number.isFinite(this.lockedY)) {
            this.lockedY += offset;
        }
    }

    /**
     * Runs ensure locked y.
     * @param {object} tileset
     * @returns {void}
     */
    ensureLockedY(tileset) {
        if (!this.hasLockedY() && Array.isArray(tileset)) {
            this.snapToFloatingPlatform(tileset);
        }
    }

    /**
     * Runs has locked y.
     * @returns {boolean}
     */
    hasLockedY() {
        return Number.isFinite(this.lockedY);
    }

    /**
     * Applies locked y.
     * @returns {void}
     */
    applyLockedY() {
        this.y = this.lockedY;
        this.groundY = this.lockedY;
        this.defaultGroundY = this.lockedY;
        this.speedY = 0;
    }

    /**
     * Retrieves floating tiles.
     * @param {object} tileset
     * @returns {object[]}
     */
    getFloatingTiles(tileset) {
        return (tileset ?? []).filter((tile) => tile?.img?.src?.includes("floating"));
    }

    /**
     * Retrieves center x.
     * @returns {object|null}
     */
    getCenterX() {
        return this.x + this.width / 2;
    }

    /**
     * Runs find target floating tile.
     * @param {object[]} tiles
     * @param {object} centerX
     * @returns {object|null}
     */
    findTargetFloatingTile(tiles, centerX) {
        return this.findTileUnderCenter(tiles, centerX) ?? this.findClosestTile(tiles, centerX);
    }

    /**
     * Runs find tile under center.
     * @param {object[]} tiles
     * @param {object} centerX
     * @returns {object|null}
     */
    findTileUnderCenter(tiles, centerX) {
        return tiles.find((tile) => this.isCenterWithinTile(tile, centerX));
    }

    /**
     * Checks whether this object is center within tile.
     * @param {object} tile
     * @param {object} centerX
     * @returns {boolean}
     */
    isCenterWithinTile(tile, centerX) {
        return centerX >= tile.x && centerX <= tile.x + tile.width;
    }

    /**
     * Runs find closest tile.
     * @param {object[]} tiles
     * @param {object} centerX
     * @returns {object|null}
     */
    findClosestTile(tiles, centerX) {
        return tiles.reduce((closest, tile) => {
            if (!closest) {
                return tile;
            }

            const tileDistance = Math.abs(this.getTileCenterX(tile) - centerX);
            const closestDistance = Math.abs(this.getTileCenterX(closest) - centerX);
            return tileDistance < closestDistance ? tile : closest;
        }, null);
    }

    /**
     * Retrieves tile center x.
     * @param {object} tile
     * @returns {object|null}
     */
    getTileCenterX(tile) {
        return tile.x + tile.width / 2;
    }

    /**
     * Runs calculate standing y.
     * @param {object} tile
     * @returns {number}
     */
    calculateStandingY(tile) {
        return (
            tile.y -
            (this.hitboxOffsetY ?? 0) -
            (this.hitboxHeight ?? this.height) +
            this.platformYOffset
        );
    }

    /**
     * Sets locked y.
     * @param {object} standingY
     * @returns {void}
     */
    setLockedY(standingY) {
        this.lockedY = standingY;
        this.applyLockedY();
    }
}
