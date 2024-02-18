"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.name = void 0;
const international_1 = __importDefault(require("../../libs/international"));
const config_1 = __importDefault(require("../../utils/config"));
exports.name = "gpicture";
exports.default = {
    category: "group",
    aliases: ["gcpicture", "gprofile", "gcprofile"],
    desc: "Change group profile picture",
    groupOnly: true,
    adminGroup: true,
    botGroupAdmin: true,
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
    execute: async ({ aruga, message, arg, group }) => {
        if (message.type.includes("image") || (message.quoted && message.quoted.type.includes("image"))) {
            const imgBuffer = message.quoted ? await aruga.downloadMediaMessage(message.quoted) : await aruga.downloadMediaMessage(message);
            const crop = arg && arg.toLowerCase() === "crop";
            await aruga.updateProfilePicture(message.from, imgBuffer, crop);
            const text = "┏━━「 𓆩 𝐻ɪᴅᴅᴇɴ 𝐹ɪɴᴅᴇʀ ⁣𓆪 」\n" +
                "┃\n" +
                `┃ ${international_1.default.translate("commands.group.change-picture", { "@ADM": `@${message.sender.split("@")[0]}` }, group.language)}\n` +
                "┃\n" +
                `┗━━「 ꗥ${config_1.default.name}ꗥ 」`;
            return await message.reply(text, true);
        }
        throw "noCmd";
    }
};
