import OverlayDialog from "./overlay-dialog.class.js";

/**
 * Factory class to create a Pause Menu dialog.
 * Panel: frame 2 ("PAUSE") from Win_loose.png
 */
export default class PauseMenu {
    static create() {
        return new OverlayDialog({
            panelSrc: { sx: 90, sy: 0, sw: 90, sh: 176 },
            panelDst: { x: 200, y: 100, w: 96, h: 210 },
            buttons: [
                {
                    label: "PLAY AGAIN",
                    action: "restart",
                    x: 260, y: 300, w: 110, h: 30,
                },
                {
                    label: "MENU",
                    action: "menu",
                    x: 380, y: 300, w: 110, h: 30,
                },
            ],
        });
    }
}