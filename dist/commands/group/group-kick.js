"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.name = void 0;
const international_1 = __importDefault(require("../../libs/international"));
const config_1 = __importDefault(require("../../utils/config"));
exports.name = "gkick";
exports.default = {
    category: "group",
    aliases: ["gckick"],
    desc: "Kick member from group with phone number / mention",
    groupOnly: true,
    adminGroup: true,
    botGroupAdmin: true,
    example: `
  Kick member from group with number / mention
  @PREFIX@CMD <number | @mention>

  eg, @PREFIX@CMD 62851xxxxxx
  --------
  Kick multiple members / mention
  @PREFIX@CMD <number> <@mention> ...<other member>

  eg, @PREFIX@CMD 62851xxxxx @mention
  --------
  `.trimEnd(),
    execute: async ({ aruga, message, args, group }) => {
        if (!args.length)
            throw "noCmd";
        for (const number of args) {
            const members = await aruga.onWhatsApp(number.replace(/\D+/g, "").trim());
            const member = members[0];
            if (!members.length || !member.exists) {
                const text = "┏━━「 𓆩 𝐻ɪᴅᴅᴇɴ 𝐹ɪɴᴅᴇʀ ⁣𓆪 」\n" +
                    "┃\n" +
                    `┃ ${international_1.default.translate("default.onWhatsApp", { "@NUM": number }, group.language)}\n` +
                    "┃\n" +
                    `┗━━「 ꗥ${config_1.default.name}ꗥ 」`;
                return await message.reply(text, true);
            }
            const kick = (await aruga.groupParticipantsUpdate(message.from, [member.jid], "remove"))[0];
            if (kick.status === "404") {
                const text = "┏━━「 𓆩 𝐻ɪᴅᴅᴇɴ 𝐹ɪɴᴅᴇʀ ⁣𓆪 」\n" +
                    "┃\n" +
                    `┃ ${international_1.default.translate("commands.group.group-kick.failed", { "@NUM": number }, group.language)}\n` +
                    "┃\n" +
                    `┗━━「 ꗥ${config_1.default.name}ꗥ 」`;
                return await message.reply(text, true);
            }
            const text = "┏━━「 𓆩 𝐻ɪᴅᴅᴇɴ 𝐹ɪɴᴅᴇʀ ⁣𓆪 」\n" +
                "┃\n" +
                `┃ ${international_1.default.translate("commands.group.group-kick.success", { "@NUM": number }, group.language)}\n` +
                "┃\n" +
                `┗━━「 ꗥ${config_1.default.name}ꗥ 」`;
            return await message.reply(text, true);
        }
    }
};
