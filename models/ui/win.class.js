import OverlayDialog from "./overlay-dialog.class.js";

/**
 * Factory class to create a Win (victory) dialog.
 * Panel: frame 2 ("YOU WIN") from Win_loose.png
 */
export default class Win {
    static create() {
        return new OverlayDialog({
            panelSrc: { sx: 220, sy: 196, sw: 110, sh: 98 },
            panelDst: { x: 175, y: 120, w: 350, h: 285 },
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
            panelImg: new Image(),
            panelImgSrc: "img/gui/Win_loose.png",
        });
    }
}