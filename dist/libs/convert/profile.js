"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WAProfile = void 0;
const jimp_1 = require("jimp");
const WAProfile = async (image, crop = false) => {
    const jimp = await (0, jimp_1.read)(image);
    let cropped;
    if (crop) {
        const minSize = Math.min(jimp.getWidth(), jimp.getHeight());
        cropped = jimp.crop(0, 0, minSize, minSize).resize(640, 640, jimp_1.RESIZE_BILINEAR);
    }
    else {
        cropped = jimp.resize(jimp.getWidth() * 0.7, jimp.getHeight() * 0.7, jimp_1.RESIZE_BILINEAR);
    }
    return cropped
        .scale(Math.abs(cropped.getWidth() <= cropped.getHeight() ? 640 / cropped.getHeight() : 640 / cropped.getWidth()))
        .quality(50)
        .getBufferAsync(jimp_1.MIME_JPEG);
};
exports.WAProfile = WAProfile;
