import DrawableObject from "../core/drawableObject.class.js";

const BTN_SRC = {
    normal:  { sx: 350, sy: 273, sw: 50, sh: 16 },
    hover:   { sx: 206, sy: 272, sw: 50, sh: 16 },
    pressed: { sx: 254, sy: 273, sw: 50, sh: 16 },
};

export default class OverlayDialog extends DrawableObject {
    hoveredAction = null;
    pressedAction = null;

    constructor(config) {
        super();
        this.panelSrc = config.panelSrc;      // { sx, sy, sw, sh }
        this.panelDst = config.panelDst || { x: 175, y: 120, w: 350, h: 285 };
        this.buttons = config.buttons || [];
        this.panelImg = config.panelImg || new Image();
        this.panelImg.src = config.panelImgSrc || "img/gui/Win_loose.png";
        this.buttonSheet = new Image();
        this.buttonSheet.src = "img/gui/Buttons.png";
    }

    draw(ctx) {
        this._drawPanel(ctx);
        this.buttons.forEach(btn => this._drawButton(ctx, btn));
    }

    _drawPanel(ctx) {
        ctx.drawImage(
            this.panelImg,
            this.panelSrc.sx, this.panelSrc.sy, this.panelSrc.sw, this.panelSrc.sh,
            this.panelDst.x,  this.panelDst.y,  this.panelDst.w,  this.panelDst.h,
        );
    }

    _drawButton(ctx, btn) {
        const sprite = this.getButtonSpriteForState(btn);

        // Sprite background
        ctx.drawImage(
            this.buttonSheet,
            sprite.sx, sprite.sy, sprite.sw, sprite.sh,
            btn.x, btn.y, btn.w, btn.h,
        );

        // Text label on top of the button
        ctx.save();
        ctx.font = "bold 12px monospace";
        ctx.fillStyle = "#1a3d1a";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        if (this.pressedAction === btn.action) {
            ctx.fillStyle = "#102910";
        }
        ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2);
        ctx.restore();
    }

    getButtonSpriteForState(btn) {
        if (this.pressedAction === btn.action) {
            return BTN_SRC.pressed;
        }

        if (this.hoveredAction === btn.action) {
            return BTN_SRC.hover;
        }

        return BTN_SRC.normal;
    }

    setHoveredButton(action) {
        this.hoveredAction = action ?? null;
    }

    setPressedButton(action) {
        this.pressedAction = action ?? null;
    }

    /** Returns the button whose area contains (mouseX, mouseY), or null. */
    getClickedButton(mouseX, mouseY) {
        return this.buttons.find(btn =>
            mouseX >= btn.x && mouseX <= btn.x + btn.w &&
            mouseY >= btn.y && mouseY <= btn.y + btn.h,
        ) ?? null;
    }
}
