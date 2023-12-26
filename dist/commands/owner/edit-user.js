"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.name = void 0;
const client_1 = require("@prisma/client");
const international_1 = __importDefault(require("../../libs/international"));
const whatsapp_1 = require("../../libs/whatsapp");
const config_1 = __importDefault(require("../../utils/config"));
exports.name = "user";
exports.default = {
    category: "owner",
    desc: "Show/Change user information",
    cd: 1,
    ownerOnly: true,
    example: `
  Change user role
  @PREFIX@CMD role <number> <role>
  
  eg, @PREFIX@CMD role 62895xx basic
  
  Role list: ${Object.keys(client_1.Role).join(", ").trimEnd()}
  --------
  `.trimEnd(),
    execute: async ({ aruga, message, args, user }) => {
        if (args.length === 3 && args[0].toLowerCase() === "role") {
            const number = args[1].replace(/\D+/g, "").trim();
            const role = args[2].toLowerCase().trim();
            const members = await aruga.onWhatsApp(number);
            if (!members.length || !members[0].exists) {
                const text = "┏━━「 𓆩 𝐻ɪᴅᴅᴇɴ 𝐹ɪɴᴅᴇʀ ⁣𓆪 」\n" +
                    "┃\n" +
                    `┃ ${international_1.default.translate("default.onWhatsApp", { "@NUM": number }, user.language)}\n` +
                    "┃\n" +
                    `┗━━「 ꗥ${config_1.default.name}ꗥ 」`;
                return await message.reply(text, true);
            }
            if (!Object.keys(client_1.Role).includes(role))
                throw "noCmd";
            const expire = new Date(Date.now());
            expire.setDate(expire.getDate() + config_1.default.user[role].expires ? config_1.default.user[role].expires : 0);
            const updatedUser = await whatsapp_1.database.updateUser(members[0].jid, {
                role: role,
                expire: config_1.default.user[role].expires ? expire.getTime() : 0,
                limit: config_1.default.user[role].limit || 30
            });
            return await message.reply(JSON.stringify(updatedUser, null, 2));
        }
        throw "noCmd";
    }
};
