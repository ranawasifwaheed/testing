"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ai2d_1 = __importDefault(require("@arugaz/ai2d"));
exports.default = {
    category: "convert",
    cd: 10,
    desc: "Generate a hyper-realistic photo an anime style",
    example: `
  Send a image message with caption
  @PREFIX@CMD
  --------
  or Reply a image message with text
  @PREFIX@CMD
  --------
  `.trimEnd(),
    execute: async ({ aruga, message }) => {
        if (message.type.includes("image") || (message.quoted && message.quoted.type.includes("image"))) {
            const buffer = message.quoted ? await aruga.downloadMediaMessage(message.quoted) : await aruga.downloadMediaMessage(message);
            const result = await (0, ai2d_1.default)(buffer, {
                crop: "SINGLE"
            });
            return await aruga.sendMessage(message.from, { image: result }, { quoted: message, ephemeralExpiration: message.expiration });
        }
        throw "noCmd";
    }
};
