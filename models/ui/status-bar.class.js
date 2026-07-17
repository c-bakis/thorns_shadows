import DrawableObject from "../core/drawableObject.class.js";

export default class StatusBar extends DrawableObject {
    health = 100;
    mana = 20;
    exp = 0;
    imageBoundsCache = new Map();

    constructor() {
        super();
        this.x = 20;
        this.y = 20;
        this.width = 210;
        this.height = 80;
        this.panelImg = new Image();
        this.panelImg.src = "img/gui/character_panel2.png";
        this.avatarImg = new Image();
        this.avatarImg.src = "img/character/wizard/wizard_avatare2.png";
        this.healthBarImg = new Image();
        this.healthBarImg.src = "img/gui/health_bar.png";
        this.manaBarImg = new Image();
        this.manaBarImg.src = "img/gui/mana_bar.png";
        this.expBarImg = new Image();
        this.expBarImg.src = "img/gui/exp_bar.png";
    }

    /**
     * Sets percentage.
     * @param {number} value
     * @param {string} type
     * @returns {void}
     */
    setPercentage(value, type) {
        this[type] = this.clampPercentage(value);
    }

    /**
     * Runs clamp percentage.
     * @param {number} value
     * @returns {number}
     */
    clampPercentage(value) {
        return Math.max(0, Math.min(100, value));
    }

    /**
     * Retrieves ratio.
     * @param {string} type
     * @returns {object|null}
     */
    getRatio(type) {
        return this[type] / 100;
    }

    /**
     * Checks whether this object is image ready.
     * @param {object} img
     * @returns {boolean}
     */
    isImageReady(img) {
        return img && img.complete && img.naturalWidth > 0;
    }

    /**
     * Retrieves image content bounds.
     * @param {object} img
     * @returns {object}
     */
    getImageContentBounds(img) {
        const cacheKey = this.getImageCacheKey(img);
        if (!cacheKey) {
            return { x: 0, width: 0, height: 0 };
        }

        const cachedBounds = this.getCachedImageBounds(cacheKey);
        if (cachedBounds) {
            return cachedBounds;
        }

        return this.computeAndCacheImageBounds(cacheKey, img);
    }

    /**
     * Computes image bounds once and stores them in cache.
     * @param {string} cacheKey
     * @param {object} img
     * @returns {object}
     */
    computeAndCacheImageBounds(cacheKey, img) {
        const fallbackBounds = this.getFallbackBounds(img);
        const computedBounds = this.computeImageContentBounds(img, fallbackBounds);
        this.cacheImageBounds(cacheKey, computedBounds);
        return computedBounds;
    }

    /**
     * Computes alpha-based horizontal bounds or returns fallback.
     * @param {object} img
     * @param {object} fallbackBounds
     * @returns {object}
     */
    computeImageContentBounds(img, fallbackBounds) {
        if (!this.isImageReady(img)) {
            return fallbackBounds;
        }

        const contextData = this.createImageAnalysisContext(img);
        if (!contextData) {
            return fallbackBounds;
        }

        const alphaRange = this.findHorizontalAlphaBounds(
            contextData.pixels,
            contextData.width,
            contextData.height,
        );

        return this.buildBoundsFromAlphaRange(alphaRange, img, fallbackBounds);
    }

    /**
     * Retrieves image cache key.
     * @param {object} img
     * @returns {object|null}
     */
    getImageCacheKey(img) {
        return img?.src;
    }

    /**
     * Retrieves cached image bounds.
     * @param {object} cacheKey
     * @returns {object}
     */
    getCachedImageBounds(cacheKey) {
        return this.imageBoundsCache.get(cacheKey);
    }

    /**
     * Runs cache image bounds.
     * @param {object} cacheKey
     * @param {object} bounds
     * @returns {void}
     */
    cacheImageBounds(cacheKey, bounds) {
        this.imageBoundsCache.set(cacheKey, bounds);
    }

    /**
     * Retrieves fallback bounds.
     * @param {object} img
     * @returns {object}
     */
    getFallbackBounds(img) {
        return {
            x: 0,
            width: img.naturalWidth,
            height: img.naturalHeight,
        };
    }

    /**
     * Creates image analysis context.
     * @param {object} img
     * @returns {object|null}
     */
    createImageAnalysisContext(img) {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const context = canvas.getContext("2d");

        if (!context) {
            return null;
        }

        context.drawImage(img, 0, 0);
        return {
            pixels: context.getImageData(0, 0, canvas.width, canvas.height).data,
            width: canvas.width,
            height: canvas.height,
        };
    }

    /**
     * Runs find horizontal alpha bounds.
     * @param {object} pixels
     * @param {number} width
     * @param {number} height
     * @returns {object}
     */
    findHorizontalAlphaBounds(pixels, width, height) {
        let minX = width;
        let maxX = -1;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const alpha = pixels[(y * width + x) * 4 + 3];
                if (alpha === 0) {
                    continue;
                }

                ({ minX, maxX } = this.expandAlphaRange({ minX, maxX }, x));
            }
        }

        return { minX, maxX };
    }

    /**
     * Expands alpha range with a visible x-position.
     * @param {{minX: number, maxX: number}} range
     * @param {number} x
     * @returns {{minX: number, maxX: number}}
     */
    expandAlphaRange(range, x) {
        return {
            minX: x < range.minX ? x : range.minX,
            maxX: x > range.maxX ? x : range.maxX,
        };
    }

    /**
     * Runs build bounds from alpha range.
     * @param {object} alphaRange
     * @param {object} img
     * @param {object} fallbackBounds
     * @returns {object|null}
     */
    buildBoundsFromAlphaRange(alphaRange, img, fallbackBounds) {
        if (alphaRange.maxX < alphaRange.minX) {
            return fallbackBounds;
        }

        return {
            x: alphaRange.minX,
            width: alphaRange.maxX - alphaRange.minX + 1,
            height: img.naturalHeight,
        };
    }

    /**
     * Draws static elements.
     * @param {CanvasRenderingContext2D} ctx
     * @returns {void}
     */
    drawStaticElements(ctx) {
        if (this.panelImg) {
            ctx.drawImage(this.panelImg, this.x, this.y, this.width, this.height);
        }

        if (this.avatarImg) {
            ctx.drawImage(this.avatarImg, this.x + 14, this.y + 13, 52, 54);
        }
    }

    /**
     * Draws bar.
     * @param {CanvasRenderingContext2D} ctx
     * @param {object} img
     * @param {number} x
     * @param {number} y
     * @param {object} maxWidth
     * @param {object} barHeight
     * @param {object} fallbackColor
     * @param {string} type
     * @returns {void}
     */
    drawBar(ctx, img, x, y, maxWidth, barHeight, fallbackColor, type) {
        const ratio = this.getRatio(type);

        if (this.isImageReady(img)) {
            const bounds = this.getImageContentBounds(img);
            this.drawImageBar(ctx, img, bounds, x, y, maxWidth, barHeight, ratio);
            return;
        }

        this.drawFallbackBar(ctx, x, y, maxWidth, barHeight, fallbackColor, ratio);
    }

    /**
     * Retrieves scaled bar widths.
     * @param {object} ratio
     * @param {object} sourceMaxWidth
     * @param {object} destinationMaxWidth
     * @returns {object|null}
     */
    getScaledBarWidths(ratio, sourceMaxWidth, destinationMaxWidth) {
        if (ratio <= 0) {
            return { srcW: 0, dstW: 0 };
        }

        return {
            srcW: Math.max(1, sourceMaxWidth * ratio),
            dstW: Math.max(1, destinationMaxWidth * ratio),
        };
    }

    /**
     * Draws image bar.
     * @param {CanvasRenderingContext2D} ctx
     * @param {object} img
     * @param {object} bounds
     * @param {number} x
     * @param {number} y
     * @param {object} maxWidth
     * @param {object} barHeight
     * @param {object} ratio
     * @returns {void}
     */
    drawImageBar(ctx, img, bounds, x, y, maxWidth, barHeight, ratio) {
        const widths = this.getScaledBarWidths(ratio, bounds.width, maxWidth);
        if (widths.srcW <= 0 || widths.dstW <= 0) {
            return;
        }

        ctx.drawImage(
            img,
            bounds.x, 0, widths.srcW, bounds.height,
            x, y, widths.dstW, barHeight
        );
    }

    /**
     * Draws fallback bar.
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} x
     * @param {number} y
     * @param {object} maxWidth
     * @param {object} barHeight
     * @param {object} fallbackColor
     * @param {object} ratio
     * @returns {void}
     */
    drawFallbackBar(ctx, x, y, maxWidth, barHeight, fallbackColor, ratio) {
        ctx.fillStyle = fallbackColor;
        ctx.fillRect(x, y, maxWidth * ratio, barHeight);
    }

    /**
     * Runs draw.
     * @param {CanvasRenderingContext2D} ctx
     * @returns {void}
     */
    draw(ctx) {
        this.drawStaticElements(ctx);
        this.drawBar(ctx, this.healthBarImg, this.x + 70, this.y + 10, 128, 18, "#d33", "health");
        this.drawBar(ctx, this.manaBarImg, this.x + 74, this.y + 26, 108, 18, "#2a7fff", "mana");
        this.drawBar(ctx, this.expBarImg, this.x + 74, this.y + 41, 94, 18, "#3fd603", "exp");
    }
    
}
