"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.name = void 0;
const promises_1 = require("fs/promises");
const path_1 = require("path");
const international_1 = __importDefault(require("../../libs/international"));
const config_1 = __importDefault(require("../../utils/config"));
const whatsapp_1 = require("../../libs/whatsapp");
exports.name = "glang";
exports.default = {
    category: "general",
    aliases: ["gclang", "glanguage", "gclanguage"],
    desc: "Show/Set group language",
    groupOnly: true,
    adminGroup: true,
    execute: async ({ message, prefix, args, group, command }) => {
        const listLanguages = JSON.parse(await (0, promises_1.readFile)((0, path_1.join)(__dirname, "..", "..", "..", "database", "languages.json"), "utf-8"));
        if (args.length >= 1 && !!listLanguages.find((value) => value.iso === args[0])) {
            const lang = listLanguages.find((value) => value.iso === args[0]);
            const group = await whatsapp_1.database.updateGroup(message.from, { language: lang.iso });
            return await message.reply(international_1.default.translate("commands.general.language.changed", { "@LANGUAGE": lang.lang }, group.language), true);
        }
        let listLang = "";
        for (const lang of listLanguages.filter((v) => international_1.default.listLanguage().includes(v.iso)).sort((first, last) => first.lang.localeCompare(last.lang))) {
            listLang += `┃ > ${lang.lang}\n┃ ${prefix}${command} ${lang.iso}\n┃\n`;
        }
        const text = "┏━━「 𓆩 𝐻ɪᴅᴅᴇɴ 𝐹ɪɴᴅᴇʀ ⁣𓆪 」\n" +
            "┃\n" +
            `┃ ${international_1.default.translate("commands.group.group-language", {}, group.language)}\n` +
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
