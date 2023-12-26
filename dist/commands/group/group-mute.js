"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.name = void 0;
const international_1 = __importDefault(require("../../libs/international"));
const whatsapp_1 = require("../../libs/whatsapp");
const config_1 = __importDefault(require("../../utils/config"));
exports.name = "gmute";
exports.default = {
    category: "group",
    aliases: ["gcmute"],
    desc: "Mute/Unmute bot on group",
    groupOnly: true,
    adminGroup: true,
    botGroupAdmin: true,
    example: `
  Turn on / Activate @CMD
  @PREFIX@CMD on
  --------
  Turn off / Deactivate @CMD
  @PREFIX@CMD off
  --------
  `.trimEnd(),
    execute: async ({ message, args, group, command }) => {
        if (args[0] && (args[0].toLowerCase() === "on" || args[0].toLowerCase() === "enable")) {
            if (!group.mute) {
                await whatsapp_1.database.updateGroup(message.from, {
                    mute: true
                });
            }
            const text = "┏━━「 𓆩 𝐻ɪᴅᴅᴇɴ 𝐹ɪɴᴅᴇʀ ⁣𓆪 」\n" +
                "┃\n" +
                `┃ ${international_1.default.translate("commands.group.group-mute.enable", { "@CMD": command }, group.language)}\n` +
                "┃\n" +
                `┗━━「 ꗥ${config_1.default.name}ꗥ 」`;
            return await message.reply(text, true);
        }
        if (args[0] && (args[0].toLowerCase() === "off" || args[0].toLowerCase() === "disable")) {
            if (group.mute) {
                await whatsapp_1.database.updateGroup(message.from, {
                    mute: false
                });
            }
            const text = "┏━━「 𓆩 𝐻ɪᴅᴅᴇɴ 𝐹ɪɴᴅᴇʀ ⁣𓆪 」\n" +
                "┃\n" +
                `┃ ${international_1.default.translate("commands.group.group-mute.disable", { "@CMD": command }, group.language)}\n` +
                "┃\n" +
                `┗━━「 ꗥ${config_1.default.name}ꗥ 」`;
            return await message.reply(text, true);
        }
        throw "noCmd";
    }
};
