"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("fs/promises");
const path_1 = require("path");
const international_1 = __importDefault(require("../../libs/international"));
const config_1 = __importDefault(require("../../utils/config"));
const whatsapp_1 = require("../../libs/whatsapp");
exports.default = {
    category: "general",
    aliases: ["lang"],
    desc: "Show/Set user language",
    privateOnly: true,
    execute: async ({ message, prefix, args, user, command }) => {
        const listLanguages = JSON.parse(await (0, promises_1.readFile)((0, path_1.join)(__dirname, "..", "..", "..", "database", "languages.json"), "utf-8"));
        if (args.length >= 1 && !!listLanguages.find((value) => value.iso === args[0])) {
            const lang = listLanguages.find((value) => value.iso === args[0]);
            const user = await whatsapp_1.database.updateUser(message.sender, { language: lang.iso });
            return await message.reply(international_1.default.translate("commands.general.language.changed", { "@LANGUAGE": lang.lang }, user.language), true);
        }
        let listLang = "";
        for (const lang of listLanguages.filter((v) => international_1.default.listLanguage().includes(v.iso)).sort((first, last) => first.lang.localeCompare(last.lang))) {
            listLang += `┃ > ${lang.lang}\n┃ ${prefix}${command} ${lang.iso}\n┃\n`;
        }
        const text = "┏━━「 𓆩 𝐻ɪᴅᴅᴇɴ 𝐹ɪɴᴅᴇʀ ⁣𓆪 」\n" +
            "┃\n" +
            `┃ ${international_1.default.translate("commands.general.language.text", {}, user.language)}\n` +
            "┃\n" +
            "┣━━━━━━━━━━━━━━━━━━\n" +
            "┃\n" +
            listLang +
            "┣━━━━━━━━━━━━━━━━━━\n" +
            "┃\n" +
            `┗━━「 ꗥ${config_1.default.name}ꗥ 」`;
        return await message.reply(text, true);
    }
};
