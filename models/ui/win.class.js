import OverlayDialog from "./overlay-dialog.class.js";

/**
 * Factory class to create a Win (victory) dialog.
 * Panel: frame 2 ("YOU WIN") from Win_loose.png
 */
export default class Win {
  /**
   * Runs create.
   * @returns {object|null}
   */
  static create() {
    return new OverlayDialog({
      panelSrc: { sx: 220, sy: 196, sw: 110, sh: 98 },
      panelDst: { x: 175, y: 90, w: 350, h: 360 },
      buttons: [
        {
          label: "X",
          action: "close",
          x: 473,
          y: 126,
          w: 28,
          h: 32,
          isIconButton: true,
        },
        {
          label: "PLAY AGAIN",
          action: "restart",
          x: 250,
          y: 320,
          w: 110,
          h: 34,
        },
        {
          label: "MENU",
          action: "menu",
          x: 370,
          y: 320,
          w: 110,
          h: 34,
        },
      ],
      panelImg: new Image(),
      panelImgSrc: "img/gui/Win_loose.png",
    });
  }
}
