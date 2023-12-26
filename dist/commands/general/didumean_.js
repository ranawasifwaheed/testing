"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const didyoumean_1 = require("@hidden-finder/didyoumean");
const command_1 = require("../../libs/whatsapp/command");
const international_1 = __importDefault(require("../../libs/international"));
const config_1 = __importDefault(require("../../utils/config"));
exports.default = {
    execute: async ({ command, user, prefix, message }) => {
        if (!command)
            return;
        const hasCmd = command_1.commands.get(command) ?? command_1.commands.find((v) => v.aliases && v.aliases.includes(command));
        if (hasCmd)
            return;
        const mean = (0, didyoumean_1.didyoumean)(command, [
            ...command_1.commands.keys(),
            ...new Set(command_1.commands
                .map((v) => v.aliases)
                .filter((v) => v)
                .flat())
        ]);
        const cmd = command_1.commands.get(mean) ?? command_1.commands.find((v) => v.aliases && v.aliases.includes(mean));
        const keyCmd = command_1.commands.findKey((v) => v === cmd);
        const listCmds = cmd.aliases.length !== 0 ? cmd.aliases.concat(keyCmd) : [keyCmd];
        let addText = "";
        for (const cmd of listCmds) {
            addText += `┃ *${prefix}${cmd}*\n`;
            addText += `┃ ${international_1.default.translate("commands.general.didyoumean.same", {}, user.language)}: ${((0, didyoumean_1.similarity)(command, cmd) * 100).toFixed(2)}%\n`;
            addText += `┃ \n`;
        }
        const text = "┏━━「 𓆩 𝐻ɪᴅᴅᴇɴ 𝐹ɪɴᴅᴇʀ ⁣𓆪 」\n" +
            "┃\n" +
            `┃ ${international_1.default.translate("commands.general.didyoumean.title", {}, user.language)}\n` +
            "┃\n" +
            addText +
            `┗━━「 ꗥ${config_1.default.name}ꗥ 」`;
        return message.reply(text, true);
    }
};
