import DrawableObject from "../core/drawableObject.class.js";

export default class StatusBar extends DrawableObject {
    health = 100;
    mana = 20;
    exp = 0;
    imageBoundsCache = new Map();

    constructor() {
        super();
        this.x = 20;
        this.y = 20;
        this.width = 210;
        this.height = 70;
        this.panelImg = new Image();
        this.panelImg.src = "img/gui/character_panel2.png";
        this.avatarImg = new Image();
        this.avatarImg.src = "img/character/wizard/wizard_avatare2.png";
        this.healthBarImg = new Image();
        this.healthBarImg.src = "img/gui/health_bar.png";
        this.manaBarImg = new Image();
        this.manaBarImg.src = "img/gui/mana_bar.png";
        this.expBarImg = new Image();
        this.expBarImg.src = "img/gui/exp_bar.png";
    }

    setPercentage(value, type) {
        this[type] = this.clampPercentage(value);
    }

    clampPercentage(value) {
        return Math.max(0, Math.min(100, value));
    }

    getRatio(type) {
        return this[type] / 100;
    }

    isImageReady(img) {
        return img && img.complete && img.naturalWidth > 0;
    }

    getImageContentBounds(img) {
        const cacheKey = this.getImageCacheKey(img);
        if (!cacheKey) {
            return { x: 0, width: 0, height: 0 };
        }

        const cachedBounds = this.getCachedImageBounds(cacheKey);
        if (cachedBounds) {
            return cachedBounds;
        }

        const fallbackBounds = this.getFallbackBounds(img);
        if (!this.isImageReady(img)) {
            return fallbackBounds;
        }

        const contextData = this.createImageAnalysisContext(img);
        if (!contextData) {
            return fallbackBounds;
        }

        const alphaRange = this.findHorizontalAlphaBounds(
            contextData.pixels,
            contextData.width,
            contextData.height,
        );
        const bounds = this.buildBoundsFromAlphaRange(alphaRange, img, fallbackBounds);
        this.cacheImageBounds(cacheKey, bounds);
        return bounds;
    }

    getImageCacheKey(img) {
        return img?.src;
    }

    getCachedImageBounds(cacheKey) {
        return this.imageBoundsCache.get(cacheKey);
    }

    cacheImageBounds(cacheKey, bounds) {
        this.imageBoundsCache.set(cacheKey, bounds);
    }

    getFallbackBounds(img) {
        return {
            x: 0,
            width: img.naturalWidth,
            height: img.naturalHeight,
        };
    }

    createImageAnalysisContext(img) {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const context = canvas.getContext("2d");

        if (!context) {
            return null;
        }

        context.drawImage(img, 0, 0);
        return {
            pixels: context.getImageData(0, 0, canvas.width, canvas.height).data,
            width: canvas.width,
            height: canvas.height,
        };
    }

    findHorizontalAlphaBounds(pixels, width, height) {
        let minX = width;
        let maxX = -1;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const alpha = pixels[(y * width + x) * 4 + 3];
                if (alpha === 0) {
                    continue;
                }

                if (x < minX) {
                    minX = x;
                }
                if (x > maxX) {
                    maxX = x;
                }
            }
        }

        return { minX, maxX };
    }

    buildBoundsFromAlphaRange(alphaRange, img, fallbackBounds) {
        if (alphaRange.maxX < alphaRange.minX) {
            return fallbackBounds;
        }

        return {
            x: alphaRange.minX,
            width: alphaRange.maxX - alphaRange.minX + 1,
            height: img.naturalHeight,
        };
    }

    drawStaticElements(ctx) {
        if (this.panelImg) {
            ctx.drawImage(this.panelImg, this.x, this.y, this.width, this.height);
        }

        if (this.avatarImg) {
            ctx.drawImage(this.avatarImg, this.x + 14, this.y + 9, 52, 52);
        }
    }

    drawBar(ctx, img, x, y, maxWidth, barHeight, fallbackColor, type) {
        const ratio = this.getRatio(type);

        if (this.isImageReady(img)) {
            const bounds = this.getImageContentBounds(img);
            this.drawImageBar(ctx, img, bounds, x, y, maxWidth, barHeight, ratio);
            return;
        }

        this.drawFallbackBar(ctx, x, y, maxWidth, barHeight, fallbackColor, ratio);
    }

    getScaledBarWidths(ratio, sourceMaxWidth, destinationMaxWidth) {
        if (ratio <= 0) {
            return { srcW: 0, dstW: 0 };
        }

        return {
            srcW: Math.max(1, sourceMaxWidth * ratio),
            dstW: Math.max(1, destinationMaxWidth * ratio),
        };
    }

    drawImageBar(ctx, img, bounds, x, y, maxWidth, barHeight, ratio) {
        const widths = this.getScaledBarWidths(ratio, bounds.width, maxWidth);
        if (widths.srcW <= 0 || widths.dstW <= 0) {
            return;
        }

        ctx.drawImage(
            img,
            bounds.x, 0, widths.srcW, bounds.height,
            x, y, widths.dstW, barHeight
        );
    }

    drawFallbackBar(ctx, x, y, maxWidth, barHeight, fallbackColor, ratio) {
        ctx.fillStyle = fallbackColor;
        ctx.fillRect(x, y, maxWidth * ratio, barHeight);
    }

    draw(ctx) {
        this.drawStaticElements(ctx);
        this.drawBar(ctx, this.healthBarImg, this.x + 70, this.y + 10, 128, 16, "#d33", "health");
        this.drawBar(ctx, this.manaBarImg, this.x + 74, this.y + 23, 108, 16, "#2a7fff", "mana");
        this.drawBar(ctx, this.expBarImg, this.x + 74, this.y + 36, 94, 16, "#3fd603", "exp");
    }
    
}