"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.name = void 0;
const international_1 = __importDefault(require("../../libs/international"));
const config_1 = __importDefault(require("../../utils/config"));
exports.name = "bdesc";
exports.default = {
    category: "owner",
    aliases: ["botdesc", "bstatus", "botstatus"],
    desc: "Change bot profile description/status",
    ownerOnly: true,
    example: `
  @PREFIX@CMD desc~
  `.trimEnd(),
    execute: async ({ aruga, arg, user, message }) => {
        if (!arg)
            throw "noCmd";
        await aruga.updateProfileStatus(arg);
        const text = "┏━━「 𓆩 𝐻ɪᴅᴅᴇɴ 𝐹ɪɴᴅᴇʀ ⁣𓆪 」\n" +
            "┃\n" +
            `┃ ${international_1.default.translate("commands.owner.bot-desc", {}, user.language)}\n` +
            "┃\n" +
            `┗━━「 ꗥ${config_1.default.name}ꗥ 」`;
        return await message.reply(text, true);
    }
};
