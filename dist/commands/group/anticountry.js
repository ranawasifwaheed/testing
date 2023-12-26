"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const awesome_phonenumber_1 = require("awesome-phonenumber");
const international_1 = __importDefault(require("../../libs/international"));
const whatsapp_1 = require("../../libs/whatsapp");
const config_1 = __importDefault(require("../../utils/config"));
const format_1 = require("./../../utils/format");
exports.default = {
    category: "group",
    desc: "Filter incoming members and kick those that are not allowed in the group",
    groupOnly: true,
    adminGroup: true,
    botGroupAdmin: true,
    example: `
  Add the country code to the list
  @PREFIX@CMD add countryCodeList

  eg, @PREFIX@CMD add 62 55 7
  --------
  Remove the country code from the list
  @PREFIX@CMD remove countryCode list

  eg, @PREFIX@CMD remove 55 7
  --------
  Turn on / Activate @CMD
  @PREFIX@CMD on
  --------
  Turn off / Deactivate @CMD
  @PREFIX@CMD off
  --------
  Check status of @CMD
  @PREFIX@CMD status
  --------
  Get all country code list
  @PREFIX@CMD list
  --------
  `.trimEnd(),
    execute: async ({ aruga, message, args, group, user, command, isBotGroupAdmin }) => {
        if (args[0] && args[0].toLowerCase() === "add" && args.length >= 2) {
            const supportCode = (0, awesome_phonenumber_1.getSupportedCallingCodes)();
            for (const numberCode of args.slice(1)) {
                if (supportCode.includes(parseInt(numberCode, 10)) && !group.anticountry.number.includes(numberCode))
                    group.anticountry.number.push(numberCode);
            }
            await whatsapp_1.database.updateGroup(message.from, {
                anticountry: {
                    active: group.anticountry.active,
                    number: group.anticountry.number
                }
            });
            const text = "┏━━「 𓆩 𝐻ɪᴅᴅᴇɴ 𝐹ɪɴᴅᴇʀ ⁣𓆪 」\n" +
                "┃\n" +
                `┃ ${international_1.default.translate("commands.group.anticountry.add", { "@NUM": group.anticountry.number.join(", ").trim() }, user.language)}\n` +
                "┃\n" +
                `┗━━「 ꗥ${config_1.default.name}ꗥ 」`;
            return await message.reply(text, true);
        }
        if (args[0] && args[0].toLowerCase() === "remove" && args.length >= 2) {
            const supportCode = (0, awesome_phonenumber_1.getSupportedCallingCodes)();
            for (const numberCode of args.slice(1)) {
                if (supportCode.includes(parseInt(numberCode, 10)) && group.anticountry.number.includes(numberCode))
                    group.anticountry.number.splice(group.anticountry.number.findIndex((num) => num === numberCode), 1);
            }
            await whatsapp_1.database.updateGroup(message.from, {
                anticountry: {
                    active: group.anticountry.active,
                    number: group.anticountry.number
                }
            });
            const text = "┏━━「 𓆩 𝐻ɪᴅᴅᴇɴ 𝐹ɪɴᴅᴇʀ ⁣𓆪 」\n" +
                "┃\n" +
                `┃ ${international_1.default.translate("commands.group.anticountry.remove", { "@NUM": group.anticountry.number.length ? group.anticountry.number.join(", ").trim() : "➰" }, user.language)}\n` +
                "┃\n" +
                `┗━━「 ꗥ${config_1.default.name}ꗥ 」`;
            return await message.reply(text, true);
        }
        if (args[0] && (args[0].toLowerCase() === "on" || args[0].toLowerCase() === "enable")) {
            if (!group.anticountry.active) {
                await whatsapp_1.database.updateGroup(message.from, {
                    anticountry: {
                        active: true,
                        number: group.anticountry.number
                    }
                });
                process.nextTick(async () => {
                    for (const participant of message.groupMetadata.participants.filter((user) => !user.admin && group.anticountry.number.includes((0, format_1.phoneFormat)(user.id).countryCode))) {
                        if (isBotGroupAdmin)
                            await aruga.groupParticipantsUpdate(message.from, [participant.id], "remove");
                    }
                });
            }
            const text = "┏━━「 𓆩 𝐻ɪᴅᴅᴇɴ 𝐹ɪɴᴅᴇʀ ⁣𓆪 」\n" +
                "┃\n" +
                `┃ ${international_1.default.translate("commands.group.anticountry.enable", { "@CMD": command, "@NUM": group.anticountry.number.length ? group.anticountry.number.join(", ").trim() : "➰" }, user.language)}\n` +
                "┃\n" +
                `┗━━「 ꗥ${config_1.default.name}ꗥ 」`;
            return await message.reply(text, true);
        }
        if (args[0] && (args[0].toLowerCase() === "off" || args[0].toLowerCase() === "disable")) {
            if (group.anticountry.active)
                await whatsapp_1.database.updateGroup(message.from, {
                    anticountry: {
                        active: false,
                        number: group.anticountry.number
                    }
                });
            const text = "┏━━「 𓆩 𝐻ɪᴅᴅᴇɴ 𝐹ɪɴᴅᴇʀ ⁣𓆪 」\n" +
                "┃\n" +
                `┃ ${international_1.default.translate("commands.group.anticountry.disable", { "@CMD": command, "@NUM": group.anticountry.number.length ? group.anticountry.number.join(", ").trim() : "➰" }, user.language)}\n` +
                "┃\n" +
                `┗━━「 ꗥ${config_1.default.name}ꗥ 」`;
            return await message.reply(text, true);
        }
        if (args[0] && args[0].toLowerCase() === "status") {
            const text = "┏━━「 𓆩 𝐻ɪᴅᴅᴇɴ 𝐹ɪɴᴅᴇʀ ⁣𓆪 」\n" +
                "┃\n" +
                `┃ ${international_1.default.translate("commands.group.anticountry.status.text", {}, user.language)}\n` +
                "┃\n" +
                `┃ ${international_1.default.translate("commands.group.anticountry.status.isActive", { "@STS": group.anticountry.active ? "✔️" : "✖️" }, user.language)}\n` +
                `┃ ${international_1.default.translate("commands.group.anticountry.status.numList", { "@NUM": group.anticountry.number.length ? group.anticountry.number.join(", ").trim() : "➰" }, user.language)}\n` +
                "┃\n" +
                `┗━━「 ꗥ${config_1.default.name}ꗥ 」`;
            return await message.reply(text, true);
        }
        if (args[0] && args[0].toLowerCase() === "list") {
            const text = "┏━━「 𓆩 𝐻ɪᴅᴅᴇɴ 𝐹ɪɴᴅᴇʀ ⁣𓆪 」\n" +
                "┃\n" +
                `┃ ${international_1.default.translate("commands.group.anticountry.list", { "@URL": "https://countrycode(.)org" }, user.language)}\n` +
                `┃ \n${(0, awesome_phonenumber_1.getSupportedCallingCodes)()
                    .map((num) => `${num} ${(0, awesome_phonenumber_1.getRegionCodeForCountryCode)(num).replace(/\d+/g, "")}`.trim())
                    .join(", ")
                    .trim()}\n` +
                "┃\n" +
                `┗━━「 ꗥ${config_1.default.name}ꗥ 」`;
            return await message.reply(text, true);
        }
        throw "noCmd";
    }
};
