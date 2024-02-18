"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.name = void 0;
const international_1 = __importDefault(require("../../libs/international"));
const config_1 = __importDefault(require("../../utils/config"));
exports.name = "gdemote";
exports.default = {
    category: "group",
    aliases: ["gcdemote"],
    desc: "Demote group admins become members of group",
    groupOnly: true,
    adminGroup: true,
    botGroupAdmin: true,
    example: `
  Demote with number / mention
  @PREFIX@CMD <number | @mention>

  eg, @PREFIX@CMD 62851xxxxxx
  --------
  Demote multiple members / mentions
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
            await aruga.groupParticipantsUpdate(message.from, [member.jid], "demote");
            const text = "┏━━「 𓆩 𝐻ɪᴅᴅᴇɴ 𝐹ɪɴᴅᴇʀ ⁣𓆪 」\n" +
                "┃\n" +
                `┃ ${international_1.default.translate("commands.group.group-demote", { "@ADM": `@${member.jid.split("@")[0]}` }, group.language)}\n` +
                "┃\n" +
                `┗━━「 ꗥ${config_1.default.name}ꗥ 」`;
            return await message.reply(text, true);
        }
    }
};
