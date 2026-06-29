import OverlayDialog from "./overlay-dialog.class.js";

/**
 * Factory class to create a Game Over dialog.
 * Panel: frame 1 ("GAME OVER") from Win_loose.png
 */
export default class GameOver {
  static create() {
    return new OverlayDialog({
      panelSrc: { sx: 330, sy: 196, sw: 110, sh: 98 },
      panelDst: { x: 175, y: 120, w: 350, h: 285 },
      buttons: [
        {
          label: "X",
          action: "close",
          x: 478, // Position des "x" im Panel
          y: 146, // (adjustieren je nach Panel-Position)
          w: 28, // Kleine Hit-Box um das x
          h: 28,
          isIconButton: true, // optional, um anders zu rendern
        },
        {
          label: "PLAY AGAIN",
          action: "restart",
          x: 260,
          y: 300,
          w: 110,
          h: 30,
        },
        {
          label: "MENU",
          action: "menu",
          x: 380,
          y: 300,
          w: 110,
          h: 30,
        },
      ],
      panelImg: new Image(),
      panelImgSrc: "img/gui/Win_loose.png",
    });
  }
}
