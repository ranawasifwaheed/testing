"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.name = void 0;
const international_1 = __importDefault(require("../../libs/international"));
const config_1 = __importDefault(require("../../utils/config"));
exports.name = "bpicture";
exports.default = {
    category: "owner",
    aliases: ["botpicture"],
    desc: "Change bot profile picture",
    ownerOnly: true,
    example: `
  Send a image message with caption
  @PREFIX@CMD
  --------
  or Reply a image message with text
  @PREFIX@CMD
  --------
  If you want to crop the image
  @PREFIX@CMD crop
  --------
  `.trimEnd(),
    execute: async ({ aruga, message, arg, user }) => {
        if (message.type.includes("image") || (message.quoted && message.quoted.type.includes("image"))) {
            const imgBuffer = message.quoted ? await aruga.downloadMediaMessage(message.quoted) : await aruga.downloadMediaMessage(message);
            const crop = arg && arg.toLowerCase() === "crop";
            await aruga.updateProfilePicture(aruga.decodeJid(aruga.user.id), imgBuffer, crop);
            const text = "┏━━「 𓆩 𝐻ɪᴅᴅᴇɴ 𝐹ɪɴᴅᴇʀ ⁣𓆪 」\n" +
                "┃\n" +
                `┃ ${international_1.default.translate("commands.owner.bot-picture", {}, user.language)}\n` +
                "┃\n" +
                `┗━━「 ꗥ${config_1.default.name}ꗥ 」`;
            return await message.reply(text, true);
        }
        throw "noCmd";
    }
};
