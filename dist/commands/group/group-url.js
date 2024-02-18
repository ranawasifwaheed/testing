"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.name = void 0;
const international_1 = __importDefault(require("../../libs/international"));
const config_1 = __importDefault(require("../../utils/config"));
exports.name = "gurl";
exports.default = {
    category: "group",
    aliases: ["gcurl", "glink", "gclink"],
    desc: "Get group invite url",
    groupOnly: true,
    adminGroup: true,
    botGroupAdmin: true,
    execute: async ({ aruga, message, group }) => {
        const code = await aruga.groupInviteCode(message.from);
        const text = "┏━━「 𓆩 𝐻ɪᴅᴅᴇɴ 𝐹ɪɴᴅᴇʀ ⁣𓆪 」\n" +
            "┃\n" +
            `┃ ${international_1.default.translate("commands.group.group-url", { "@URL": `https://chat.whatsapp.com/${code}` }, group.language)}\n` +
            "┃\n" +
            `┗━━「 ꗥ${config_1.default.name}ꗥ 」`;
        return await message.reply(text, true);
    }
};
