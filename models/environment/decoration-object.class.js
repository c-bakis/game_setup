import DrawableObject from "../core/drawableObject.class.js";

export default class DecorationObject extends DrawableObject {
    constructor(configOrImagePath, x, y, width, height) {
        super();

        const isConfigObject =
            configOrImagePath !== null && typeof configOrImagePath === "object";
        const config = isConfigObject
            ? configOrImagePath
            : { imagePath: configOrImagePath, x, y, width, height };

        this.x = Number.isFinite(config.x) ? config.x : 0;
        this.y = Number.isFinite(config.y) ? config.y : 0;
        this.width = Number.isFinite(config.width) ? config.width : 0;
        this.height = Number.isFinite(config.height) ? config.height : 0;
        this.loadImage(config.imagePath);
        this.applyOptionalSpriteSheet(config);
    }

    applyOptionalSpriteSheet(config) {
        if (!Number.isFinite(config.frameWidth) || !Number.isFinite(config.frameHeight)) {
            return;
        }

        this.spriteSheet = this.buildSpriteSheet(config);
    }

    buildSpriteSheet(config) {
        const columns = Number.isFinite(config.columns) ? config.columns : 1;
        const rows = Number.isFinite(config.rows) ? config.rows : 1;
        const frameCount = Number.isFinite(config.frameCount) ? config.frameCount : columns * rows;
        const frameIndex = this.resolveFrameIndex(config.frameIndex, frameCount);

        return {
            frameWidth: config.frameWidth,
            frameHeight: config.frameHeight,
            frameCount,
            columns,
            startRow: config.startRow ?? 0,
            layout: config.layout ?? "row",
            currentFrame: frameIndex,
        };
    }

    resolveFrameIndex(frameIndex, frameCount) {
        const index = Number.isFinite(frameIndex) ? Math.max(0, Math.floor(frameIndex)) : 0;
        return Math.min(index, frameCount - 1);
    }
}
