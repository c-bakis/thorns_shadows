import OverlayDialog from "./overlay-dialog.class.js";

/**
 * Factory class to create a Pause Menu dialog.
 * Panel: frame 2 ("PAUSE") from Win_loose.png
 */
export default class PauseMenu {
  /**
   * Runs create.
   * @returns {object|null}
   */
  static create() {
    return new OverlayDialog({
      panelSrc: { sx: 90, sy: 0, sw: 90, sh: 176 },
      panelDst: { x: 270, y: 80, w: 220, h: 336 },
      buttons: [
        {
          label: "X",
          action: "close",
          x: 452, 
          y: 90, 
          w: 22, 
          h: 23,
          isIconButton: true, 
        },
        {
          label: "RESUME",
          action: "resume",
          x: 310,
          y: 145,
          w: 140,
          h: 38,
        },
        {
          label: "RESTART",
          action: "restart",
          x: 310,
          y: 185,
          w: 140,
          h: 38,
        },
        {
          label: "RETURN TO MENU",
          action: "menu",
          x: 310,
          y: 225,
          w: 140,
          h: 38,
        },
        {
          label: "MUSIC ON/OFF",
          action: "toggleMusic",
          x: 310,
          y: 265,
          w: 140,
          h: 38,
        },
        {
          label: "SOUND ON/OFF",
          action: "toggleSound",
          x: 310,
          y: 305,
          w: 140,
          h: 38,
        },
      ],
      keepOpenActions: ["toggleMusic", "toggleSound"],
      panelImg: new Image(),
      panelImgSrc: "img/gui/Main_menu.png",
    });
  }
}
