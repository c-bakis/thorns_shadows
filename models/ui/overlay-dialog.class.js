import DrawableObject from "../core/drawableObject.class.js";

const BTN_SRC = {
  normal: { sx: 350, sy: 273, sw: 50, sh: 16 },
  hover: { sx: 206, sy: 272, sw: 50, sh: 16 },
  pressed: { sx: 254, sy: 273, sw: 50, sh: 16 },
};

const BTN_ICON_EFFECTS = {
  normal: { filter: "none" },
  hover: {
    filter: "invert(16%) sepia(50%) saturate(145%) brightness(92%) contrast(112%) drop-shadow(-1px 1px 2px #653e29)",
  },
  pressed:  {
    filter: "invert(16%) sepia(50%) saturate(145%) brightness(92%) contrast(112%) drop-shadow(-1px 1px 4px #653e29)",
  },
};

export default class OverlayDialog extends DrawableObject {
  hoveredAction = null;
  pressedAction = null;
  btnIsActive = false;

  constructor(config) {
    super();
    this.panelSrc = config.panelSrc; // { sx, sy, sw, sh }
    this.panelDst = config.panelDst || { x: 175, y: 120, w: 350, h: 285 };
    this.buttons = config.buttons || [];
    this.keepOpenActions = config.keepOpenActions || [];
    this.panelImg = config.panelImg || new Image();
    this.panelImg.src = config.panelImgSrc || "img/gui/Win_loose.png";
    this.buttonSheet = new Image();
    this.buttonSheet.src = "img/gui/Buttons.png";
    this.x_btn = new Image();
    this.x_btn.src = "img/gui/x_btn.png";
  }

  /**
   * Runs draw.
   * @param {CanvasRenderingContext2D} ctx
   * @returns {void}
   */
  draw(ctx) {
    this._drawPanel(ctx);
    this.buttons.forEach((btn) => this._drawButton(ctx, btn));
  }

  /**
   * Runs _draw panel.
   * @param {CanvasRenderingContext2D} ctx
   * @returns {void}
   */
  _drawPanel(ctx) {
    ctx.drawImage(
      this.panelImg,
      this.panelSrc.sx,
      this.panelSrc.sy,
      this.panelSrc.sw,
      this.panelSrc.sh,
      this.panelDst.x,
      this.panelDst.y,
      this.panelDst.w,
      this.panelDst.h,
    );
  }

  /**
   * Runs _draw button.
   * @param {CanvasRenderingContext2D} ctx
   * @param {object} btn
   * @returns {void}
   */
  _drawButton(ctx, btn) {
    if (btn.isIconButton) {
      ctx.drawImage(this.x_btn, btn.x, btn.y, btn.w, btn.h);
      this.drawIconButton(ctx, btn);
    } else {
      const sprite = this.getButtonSpriteForState(btn, BTN_SRC);

      // Sprite background
      ctx.drawImage(
        this.buttonSheet,
        sprite.sx,
        sprite.sy,
        sprite.sw,
        sprite.sh,
        btn.x,
        btn.y,
        btn.w,
        btn.h,
      );

      this.drawTextButton(ctx, btn);
    }
  }

  /**
   * Draws icon button.
   * @param {CanvasRenderingContext2D} ctx
   * @param {object} btn
   * @returns {void}
   */
  drawIconButton(ctx, btn) {
    ctx.save();
    ctx.filter = this.getButtonSpriteForState(btn, BTN_ICON_EFFECTS).filter;
    ctx.drawImage(this.x_btn, btn.x, btn.y, btn.w, btn.h);

    ctx.restore();
  }

  /**
   * Draws text button.
   * @param {CanvasRenderingContext2D} ctx
   * @param {object} btn
   * @returns {void}
   */
  drawTextButton(ctx, btn) {
    ctx.save();
    ctx.font = "bold 12px monospace";
    ctx.fillStyle = "#1a3d1a";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (this.isButtonInPressedState(btn)) {
      ctx.fillStyle = "#102910";
    }
    ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2);
    ctx.restore();
  }

  /**
   * Retrieves button sprite for state.
   * @param {object} btn
   * @param {object} btnSrc
   * @returns {object|null}
   */
  getButtonSpriteForState(btn, btnSrc) {
    if (this.isButtonInPressedState(btn)) {
      return btnSrc.pressed;
    } else if (this.hoveredAction === btn.action) {
      return btnSrc.hover;
    } else {
      return btnSrc.normal;
    }
  }

  /**
   * Checks whether a button should render in pressed state.
   * @param {object} btn
   * @returns {boolean}
   */
  isButtonInPressedState(btn) {
    return (
      this.pressedAction === btn.action ||
      this.btnIsActive ||
      this.isPersistentTogglePressed(btn)
    );
  }

  /**
   * Keeps music/sound toggle buttons pressed while the option is disabled.
   * @param {object} btn
   * @returns {boolean}
   */
  isPersistentTogglePressed(btn) {
    if (!btn?.action || typeof sessionStorage === "undefined") {
      return false;
    }

    if (btn.action === "toggleMusic") {
      return sessionStorage.getItem("musicIsEnabled") === "false";
    }

    if (btn.action === "toggleSound") {
      return sessionStorage.getItem("soundIsEnabled") === "false";
    }

    return false;
  }

  /**
   * Sets hovered button.
   * @param {string} action
   * @returns {void}
   */
  setHoveredButton(action) {
    this.hoveredAction = action ?? null;
  }

  /**
   * Sets pressed button.
   * @param {string} action
   * @returns {void}
   */
  setPressedButton(action) {
    this.pressedAction = action ?? null;
  }

  /** Returns the button whose area contains (mouseX, mouseY), or null. */
  /**
   * Retrieves clicked button.
   * @param {object} mouseX
   * @param {object} mouseY
   * @returns {object|null}
   */
  getClickedButton(mouseX, mouseY) {
    return (
      this.buttons.find(
        (btn) =>
          mouseX >= btn.x &&
          mouseX <= btn.x + btn.w &&
          mouseY >= btn.y &&
          mouseY <= btn.y + btn.h,
      ) ?? null
    );
  }
}
