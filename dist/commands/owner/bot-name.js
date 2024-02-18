"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.name = void 0;
const international_1 = __importDefault(require("../../libs/international"));
const config_1 = __importDefault(require("../../utils/config"));
exports.name = "bname";
exports.default = {
    category: "owner",
    aliases: ["botname"],
    desc: "Change bot profile name",
    ownerOnly: true,
    example: `
  @PREFIX@CMD name~
  `.trimEnd(),
    execute: async ({ aruga, arg, user, message }) => {
        if (!arg)
            throw "noCmd";
        await aruga.updateProfileName(arg);
        const text = "┏━━「 𓆩 𝐻ɪᴅᴅᴇɴ 𝐹ɪɴᴅᴇʀ ⁣𓆪 」\n" +
            "┃\n" +
            `┃ ${international_1.default.translate("commands.owner.bot-name", {}, user.language)}\n` +
            "┃\n" +
            `┗━━「 ꗥ${config_1.default.name}ꗥ 」`;
        return await message.reply(text, true);
    }
};
