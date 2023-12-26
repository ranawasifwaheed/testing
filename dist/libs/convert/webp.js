"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _WASticker_instances, _WASticker_opts, _WASticker_exif, _WASticker_$_createExif, _WASticker_$_convert;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WASticker = exports.WebpToImage = void 0;
const node_webpmux_1 = __importDefault(require("node-webpmux"));
const cli_1 = require("../../utils/cli");
const WebpToImage = (webp) => {
    return new Promise((resolve, reject) => {
        (0, cli_1.ffmpeg)(webp, ["-f", "image2"]).then(resolve).catch(reject);
    });
};
exports.WebpToImage = WebpToImage;
const defaultStickerOptions = {
    author: "arugaz",
    pack: "whatsapp-bot",
    id: "arugaz",
    width: 256,
    fps: 25,
    loop: true,
    compress: 0
};
class WASticker {
    constructor(opts) {
        _WASticker_instances.add(this);
        _WASticker_opts.set(this, void 0);
        _WASticker_exif.set(this, void 0);
        __classPrivateFieldSet(this, _WASticker_opts, Object.assign(defaultStickerOptions, opts || {}), "f");
        __classPrivateFieldSet(this, _WASticker_exif, null, "f");
    }
    setPack(pack) {
        __classPrivateFieldGet(this, _WASticker_opts, "f").pack = pack;
        __classPrivateFieldSet(this, _WASticker_exif, __classPrivateFieldGet(this, _WASticker_instances, "m", _WASticker_$_createExif).call(this), "f");
        return this;
    }
    setAuthor(author) {
        __classPrivateFieldGet(this, _WASticker_opts, "f").author = author;
        __classPrivateFieldSet(this, _WASticker_exif, __classPrivateFieldGet(this, _WASticker_instances, "m", _WASticker_$_createExif).call(this), "f");
        return this;
    }
    setID(id) {
        __classPrivateFieldGet(this, _WASticker_opts, "f").id = id;
        __classPrivateFieldSet(this, _WASticker_exif, __classPrivateFieldGet(this, _WASticker_instances, "m", _WASticker_$_createExif).call(this), "f");
        return this;
    }
    setCategories(categories) {
        __classPrivateFieldGet(this, _WASticker_opts, "f").categories = categories;
        __classPrivateFieldSet(this, _WASticker_exif, __classPrivateFieldGet(this, _WASticker_instances, "m", _WASticker_$_createExif).call(this), "f");
        return this;
    }
    async ConvertMedia(bufferData, type = "image") {
        __classPrivateFieldSet(this, _WASticker_exif, __classPrivateFieldGet(this, _WASticker_exif, "f") ? __classPrivateFieldGet(this, _WASticker_exif, "f") : __classPrivateFieldGet(this, _WASticker_instances, "m", _WASticker_$_createExif).call(this), "f");
        const result = await __classPrivateFieldGet(this, _WASticker_instances, "m", _WASticker_$_convert).call(this, bufferData, type);
        return result;
    }
    async ConvertExif(bufferData) {
        __classPrivateFieldSet(this, _WASticker_exif, __classPrivateFieldGet(this, _WASticker_exif, "f") ? __classPrivateFieldGet(this, _WASticker_exif, "f") : __classPrivateFieldGet(this, _WASticker_instances, "m", _WASticker_$_createExif).call(this), "f");
        const image = new node_webpmux_1.default.Image();
        await image.load(bufferData);
        image.exif = __classPrivateFieldGet(this, _WASticker_exif, "f");
        return image.save(null);
    }
}
exports.WASticker = WASticker;
_WASticker_opts = new WeakMap(), _WASticker_exif = new WeakMap(), _WASticker_instances = new WeakSet(), _WASticker_$_createExif = function _WASticker_$_createExif() {
    const data = JSON.stringify({
        "sticker-pack-id": __classPrivateFieldGet(this, _WASticker_opts, "f").id,
        "sticker-pack-name": __classPrivateFieldGet(this, _WASticker_opts, "f").pack,
        "sticker-pack-publisher": __classPrivateFieldGet(this, _WASticker_opts, "f").author,
        "sticker-pack-publisher-email": "arugaastri@gmail.com",
        "sticker-pack-publisher-website": "https://github.com/ArugaZ/whatsapp-bot",
        ...(__classPrivateFieldGet(this, _WASticker_opts, "f").categories && __classPrivateFieldGet(this, _WASticker_opts, "f").categories?.length >= 1 ? { emojis: __classPrivateFieldGet(this, _WASticker_opts, "f").categories } : {}),
        "android-app-store-link": "https://play.google.com/store/apps/details?id=com.supercell.clashofclans",
        "is-first-party-sticker": 1,
        "ios-app-store-link": "https://apps.apple.com/id/app/clash-of-clans/id529479190"
    });
    const exif = Buffer.concat([Buffer.from([73, 73, 42, 0, 8, 0, 0, 0, 1, 0, 65, 87, 7, 0, 0, 0, 0, 0, 22, 0, 0, 0]), Buffer.from(data)]);
    exif.writeUIntLE(new TextEncoder().encode(data).length, 14, 4);
    return exif;
}, _WASticker_$_convert = function _WASticker_$_convert(bufferData, type) {
    const bufferSize = bufferData.byteLength;
    return new Promise((resolve, reject) => (0, cli_1.ffmpeg)(bufferData, [
        "-vf",
        `scale='min(${__classPrivateFieldGet(this, _WASticker_opts, "f").width},iw)':min'(${__classPrivateFieldGet(this, _WASticker_opts, "f").width},ih)':force_original_aspect_ratio=decrease,fps=${__classPrivateFieldGet(this, _WASticker_opts, "f").fps}, pad=${__classPrivateFieldGet(this, _WASticker_opts, "f").width}:${__classPrivateFieldGet(this, _WASticker_opts, "f").width}:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`,
        "-loop",
        __classPrivateFieldGet(this, _WASticker_opts, "f").loop ? "0" : "1",
        "-lossless",
        type === "image" ? "1" : "0",
        "-compression_level",
        `${__classPrivateFieldGet(this, _WASticker_opts, "f").compress}`,
        "-quality",
        type === "image" ? "75" : `${bufferSize < 300000 ? 30 : bufferSize < 400000 ? 20 : 15}`,
        "-preset",
        "picture",
        "-an",
        "-vsync",
        "0",
        "-f",
        "webp"
    ])
        .then((bufferResult) => resolve(this.ConvertExif(bufferResult)))
        .catch(reject));
};
