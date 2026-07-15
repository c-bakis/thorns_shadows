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
      panelDst: { x: 280, y: 80, w: 220, h: 320 },
      buttons: [
        {
          label: "X",
          action: "close",
          x: 461, 
          y: 90, 
          w: 21, 
          h: 18,
          isIconButton: true, 
        },
        {
          label: "RESUME",
          action: "resume",
          x: 320,
          y: 145,
          w: 135,
          h: 30,
        },
        {
          label: "RESTART",
          action: "restart",
          x: 320,
          y: 185,
          w: 135,
          h: 30,
        },
        {
          label: "RETURN TO MENU",
          action: "menu",
          x: 320,
          y: 225,
          w: 135,
          h: 30,
        },
        {
          label: "MUSIC ON/OFF",
          action: "toggleMusic",
          x: 320,
          y: 265,
          w: 135,
          h: 30,
        },
        {
          label: "SOUND ON/OFF",
          action: "toggleSound",
          x: 320,
          y: 305,
          w: 135,
          h: 30,
        },
      ],
      keepOpenActions: ["toggleMusic", "toggleSound"],
      panelImg: new Image(),
      panelImgSrc: "img/gui/Main_menu.png",
    });
  }
}
