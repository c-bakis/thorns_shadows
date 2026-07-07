export default class DrawableObject {
    x = 100;
    y = 100;
    width = 100;
    height = 100;
    hitboxOffsetX = 0;
    hitboxOffsetY = 0;
    hitboxWidth = this.width;
    hitboxHeight = this.height;
    img;
    imgCache = {};
    currentImg = 0;
    intervalIds = new Set();

  /**
   * Handles load image.
   * @param {string} path
   * @returns {void}
   */
  loadImage(path) {
    this.img = new Image();
    this.img.src = path;
  }

  /**
   * Handles load images.
   * @param {string[]} arr
   * @returns {void}
   */
  loadImages(arr) {
    arr.forEach((path) => {
      const img = new Image();
      img.src = path;
      this.imgCache[path] = img;
    });
  }

  /**
   * Handles draw.
   * @param {CanvasRenderingContext2D} ctx
   * @returns {void}
   */
  draw(ctx) {
    if (this.spriteSheet && this.img) {
      this.drawSpriteFrame(ctx);
      return;
    }

    if (this.img) {
      ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
  }

  /**
   * Handles draw sprite frame.
   * @param {CanvasRenderingContext2D} ctx
   * @returns {void}
   */
  drawSpriteFrame(ctx) {
    const { frameWidth, frameHeight } = this.spriteSheet;
    const currentFrame = this.resolveCurrentFrame();
    const { frameX, frameY } = this.resolveFramePosition(currentFrame);

    ctx.drawImage(this.img, frameX, frameY, frameWidth, frameHeight, this.x, this.y, this.width, this.height);
  }

  /**
   * Handles resolve current frame.
    * @returns {number}
   */
  resolveCurrentFrame() {
    const frameCount = this.spriteSheet.frameCount;
    return Math.max(0, Math.min(this.spriteSheet.currentFrame ?? 0, frameCount - 1));
  }

  /**
   * Handles resolve frame position.
    * @param {number} currentFrame
   * @returns {object}
   */
  resolveFramePosition(currentFrame) {
    const { frameWidth, frameHeight } = this.spriteSheet;
    const layout = this.spriteSheet.layout ?? "row";
    const columns = this.spriteSheet.columns ?? 1;

    if (columns > 1) {
      return this.resolveGridPosition(currentFrame, frameWidth, frameHeight, columns);
    }

    return {
      frameX: layout === "column" ? 0 : currentFrame * frameWidth,
      frameY: layout === "column" ? currentFrame * frameHeight : 0,
    };
  }

  /**
   * Handles resolve grid position.
    * @param {number} currentFrame
    * @param {number} frameWidth
    * @param {number} frameHeight
   * @param {number} columns
   * @returns {object}
   */
  resolveGridPosition(currentFrame, frameWidth, frameHeight, columns) {
    const sourceY = Number.isFinite(this.spriteSheet.sourceY)
      ? this.spriteSheet.sourceY
      : (this.spriteSheet.startRow ?? 0) * frameHeight;

    return {
      frameX: (currentFrame % columns) * frameWidth,
      frameY: Math.floor(currentFrame / columns) * frameHeight + sourceY,
    };
  }

  /**
   * Handles start interval.
   * @param {Function} callback
   * @param {number} delay
    * @returns {number}
   */
  startInterval(callback, delay) {
    const intervalId = setInterval(callback, delay);
    this.intervalIds.add(intervalId);
    return intervalId;
  }

  /**
   * Handles clear intervals.
   * @returns {void}
   */
  clearIntervals() {
    this.intervalIds.forEach((intervalId) => clearInterval(intervalId));
    this.intervalIds.clear();
  }
  
  /**
   * Handles draw bounding box.
   * @param {CanvasRenderingContext2D} ctx
   * @returns {void}
   */
  drawBoundingBox(ctx) {
    const shouldDrawBoundingBox =
      this.constructor?.name === "Character" ||
      this.constructor?.name === "Slime" ||
      this.constructor?.name === "PredatorPlant" ||
      this.constructor?.name === "Spider" ||
      this.constructor?.name === "Wolf" ||
      this.constructor?.name === "Tileset";

    if (shouldDrawBoundingBox) {
      const hitbox = this.getHitbox();
      ctx.beginPath();
      ctx.rect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 5;
      ctx.stroke();
    }
  }

  /**
   * Handles retrieve hitbox.
   * @returns {object}
   */
  getHitbox() {
    const width = this.hitboxWidth ?? this.width;
    const height = this.hitboxHeight ?? this.height;
    const offsetX = this.hitboxOffsetX ?? 0;
    const offsetY = this.hitboxOffsetY ?? 0;

    return {
      x: this.x + offsetX,
      y: this.y + offsetY,
      width,
      height,
    };
  }
}
