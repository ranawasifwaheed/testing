"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = __importDefault(require("os"));
const international_1 = __importDefault(require("../../libs/international"));
const config_1 = __importDefault(require("../../utils/config"));
const whatsapp_1 = require("../../libs/whatsapp");
const format_1 = require("../../utils/format");
exports.default = {
    aliases: ["help"],
    category: "general",
    desc: "Landing menu",
    maintenance: false,
    execute: async ({ message, prefix, user, args, isOwner }) => {
        if (args.length === 1) {
            const name = args[0].toLowerCase();
            const cmd = whatsapp_1.command.commands.get(name) ?? whatsapp_1.command.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(name));
            if (!cmd || (cmd.category === "owner" && !isOwner))
                return await message.reply(international_1.default.translate("commands.general.menu.cmd.zero", {}, user.language), true);
            const text = "┏━━「 𓆩 𝐻ɪᴅᴅᴇɴ 𝐹ɪɴᴅᴇʀ ⁣𓆪 」\n" +
                "┃\n" +
                `┃ *${international_1.default.translate("commands.general.menu.cmd.one", {}, user.language)} :* ${cmd.aliases ? [name].concat(cmd.aliases).join(", ").trim() : name}\n` +
                `┃ *${international_1.default.translate("commands.general.menu.cmd.two", {}, user.language)} :* ${cmd.category || "-"}\n` +
                `┃ *${international_1.default.translate("commands.general.menu.cmd.three", {}, user.language)} :* ${cmd.desc || "-"}\n` +
                `┃ *${international_1.default.translate("commands.general.menu.cmd.four", {}, user.language)} :* ${cmd.example
                    ? cmd.example
                        .replace(/@PREFIX/g, prefix)
                        .replace(/@CMD/g, name)
                        .trimEnd()
                        .split(/\r\n|\r|\n/)
                        .join("\n┃ ")
                        .trimEnd()
                    : `${prefix}${name}`}\n` +
                `┃ *${international_1.default.translate("commands.general.menu.cmd.five", {}, user.language)} :* ${cmd.groupOnly ? "✔️" : "✖️"}\n` +
                (message.isGroupMsg
                    ? `┃ *${international_1.default.translate("commands.general.menu.cmd.six", {}, user.language)}:* ${cmd.adminGroup ? "✔️" : "✖️"}\n` +
                        `┃ *${international_1.default.translate("commands.general.menu.cmd.seven", {}, user.language)} :* ${cmd.ownerGroup ? "✔️" : "✖️"}\n`
                    : "") +
                `┃ *${international_1.default.translate("commands.general.menu.cmd.eight", {}, user.language)} :* ${cmd.privateOnly ? "✔️" : "✖️"}\n` +
                `┃ *${international_1.default.translate("commands.general.menu.cmd.nine", {}, user.language)} :* ${cmd.premiumOnly ? "✔️" : "✖️"}\n` +
                `┃ *${international_1.default.translate("commands.general.menu.cmd.ten", {}, user.language)} :* ${cmd.ownerOnly ? "✔️" : "✖️"}\n` +
                `┃ *${international_1.default.translate("commands.general.menu.cmd.eleven", {}, user.language)} :* ${cmd.limit ? cmd.limit : "✖️"}\n` +
                `┃ *${international_1.default.translate("commands.general.menu.cmd.twelve", {}, user.language)} :* ${cmd.cd ? (cmd.cd % 1000) + "s" : "3s"}\n` +
                `┃ *${international_1.default.translate("commands.general.menu.cmd.thirteen", {}, user.language)} :* ${cmd.maintenance ? "✔️" : "✖️"}\n` +
                "┃\n" +
                `┗━━「 ꗥ${config_1.default.name}ꗥ 」`;
            return await message.reply(text, true);
        }
        let listCmd = "";
        for (const category of [
            ...new Set(whatsapp_1.command.commands
                .map((v) => v.category)
                .filter((v) => (!isOwner && v === "owner" ? null : v && (!message.isGroupMsg && v === "group" ? null : v)))
                .sort())
        ]) {
            listCmd += `┣━━━━━━━━━━━━━━━━━━\n┃\n┃${(0, format_1.upperFormat)(category + " ")}\n`;
            for (const eachCmd of whatsapp_1.command.commands.map((v) => v.category === category && v).filter((v) => (!isOwner && v.ownerOnly ? null : v))) {
                const title = whatsapp_1.command.commands.findKey((v) => v === eachCmd);
                listCmd += `┃ ${prefix}menu ${title}\n┃ > ${eachCmd.desc}\n┃\n`;
            }
        }
        const text = "┏━━「 𓆩 𝐻ɪᴅᴅᴇɴ 𝐹ɪɴᴅᴇʀ ⁣𓆪 」\n" +
            "┃\n" +
            `┃ ${international_1.default.translate("commands.general.menu.intro.one", { "@PUSHNAME": message.pushname }, user.language)}\n` +
            `┃ ${international_1.default.translate("commands.general.menu.intro.two", {}, user.language)}\n` +
            "┃\n" +
            "┣━━━━━━━━━━━━━━━━━━\n" +
            "┃\n" +
            `┃ ${international_1.default.translate("commands.general.menu.detail.one", { "@SZEE": `${(0, format_1.sizeFormat)(process.memoryUsage().heapTotal)} / ${(0, format_1.sizeFormat)(os_1.default.totalmem())}` }, user.language)}\n` +
            `┃ ${international_1.default.translate("commands.general.menu.detail.two", { "@CMDS": whatsapp_1.command.commands.size }, user.language)}\n` +
            `┃ ${international_1.default.translate("commands.general.menu.detail.three", { "@UPTMS": (0, format_1.timeFormat)(os_1.default.uptime() * 1000) }, user.language)}\n` +
            `┃ ${international_1.default.translate("commands.general.menu.detail.four", {}, user.language)}\n` +
            "┃\n" +
            "┣━━━━━━━━━━━━━━━━━━\n" +
            "┃\n" +
            `┃ ${international_1.default.translate("commands.general.menu.info.one", {}, user.language)}\n` +
            `┃ ${international_1.default.translate("commands.general.menu.info.two", {}, user.language)}\n` +
            `┃ ${international_1.default.translate("commands.general.menu.info.three", { "@COMMANDS": `${prefix}language` }, user.language)}\n` +
            "┃\n" +
            "┣━━━━━━━━━━━━━━━━━━\n" +
            "┃\n" +
            `┃ ${international_1.default.translate("commands.general.menu.bottom", {}, user.language)}\n` +
            "┃\n" +
            listCmd +
            `┗━━「 ꗥ${config_1.default.name}ꗥ 」`;
        return await message.reply(text, true);
    }
};
