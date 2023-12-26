"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const convert_1 = require("../../libs/convert");
const config_1 = __importDefault(require("../../utils/config"));
const wasticker = new convert_1.WASticker({
    pack: config_1.default.name,
    author: config_1.default.footer,
    categories: ["👋"]
});
exports.default = {
    category: "convert",
    aliases: ["stiker", "s"],
    cd: 5,
    desc: "Create sticker from photo or video",
    example: `
  Send a image/video message with caption
  @PREFIX@CMD
  --------
  or Reply a image/video message with text
  @PREFIX@CMD
  --------
  `.trimEnd(),
    execute: async ({ aruga, message }) => {
        if (message.type.includes("image") || (message.quoted && message.quoted.type.includes("image"))) {
            const buffer = message.quoted ? await aruga.downloadMediaMessage(message.quoted) : await aruga.downloadMediaMessage(message);
            const result = await wasticker.ConvertMedia(buffer, "image");
            return await aruga.sendMessage(message.from, { sticker: result }, { quoted: message, ephemeralExpiration: message.expiration });
        }
        if (message.type.includes("video") || (message.quoted && message.quoted.type.includes("video"))) {
            const duration = message.quoted ? message.quoted.message.videoMessage.seconds : message.message.videoMessage.seconds;
            if (duration && !isNaN(duration) && duration > 10)
                throw "Video duration is too long! Maximum duration of 10 seconds";
            const buffer = message.quoted ? await aruga.downloadMediaMessage(message.quoted) : await aruga.downloadMediaMessage(message);
            const result = await wasticker.ConvertMedia(buffer, "video");
            return await aruga.sendMessage(message.from, { sticker: result }, { quoted: message, ephemeralExpiration: message.expiration });
        }
        if (message.type.includes("sticker") || (message.quoted && message.quoted.type.includes("sticker"))) {
            const buffer = message.quoted ? await aruga.downloadMediaMessage(message.quoted) : await aruga.downloadMediaMessage(message);
            const result = await wasticker.ConvertExif(buffer);
            return await aruga.sendMessage(message.from, { sticker: result }, { quoted: message, ephemeralExpiration: message.expiration });
        }
        throw "noCmd";
    }
};
