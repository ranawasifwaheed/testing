"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.name = void 0;
const international_1 = __importDefault(require("../../libs/international"));
const config_1 = __importDefault(require("../../utils/config"));
exports.name = "gdesc";
exports.default = {
    category: "group",
    aliases: ["gbio", "gcbio", "gcdesc"],
    desc: "Change group description",
    groupOnly: true,
    adminGroup: true,
    botGroupAdmin: true,
    example: `
  Change group description
  @PREFIX@CMD <desc>
  --------
  `.trimEnd(),
    execute: async ({ aruga, message, arg, group }) => {
        if (!arg)
            throw "noCmd";
        await aruga.groupUpdateDescription(message.from, arg);
        const text = "┏━━「 𓆩 𝐻ɪᴅᴅᴇɴ 𝐹ɪɴᴅᴇʀ ⁣𓆪 」\n" +
            "┃\n" +
            `┃ ${international_1.default.translate("commands.group.change-description", { "@ADM": `@${message.sender.split("@")[0]}` }, group.language)}\n` +
            `${arg}\n` +
            "┃\n" +
            `┗━━「 ꗥ${config_1.default.name}ꗥ 」`;
        return await message.reply(text, true);
    }
};
