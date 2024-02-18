"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const whatsapp_1 = require("../../libs/whatsapp");
exports.default = {
    category: "owner",
    aliases: ["upstatus", "upstory"],
    desc: "Upload bot status",
    ownerOnly: true,
    example: `
  Send a image/video message with caption
  @PREFIX@CMD status caption
  --------
  or Reply a image/video message with text
  @PREFIX@CMD status caption
  --------
  Send a text message
  @PREFIX@CMD status caption
  `.trimEnd(),
    execute: async ({ aruga, message, arg }) => {
        const contactList = await whatsapp_1.database.getUsers();
        await aruga.sendMessage("status@broadcast", {
            ...(message.type === "image" || (message.quoted && message.quoted.type === "image")
                ? {
                    image: await aruga.downloadMediaMessage(message.quoted || message),
                    caption: message.quoted?.body || arg
                }
                : message.type === "video" || (message.quoted && message.quoted.type === "video")
                    ? {
                        video: await aruga.downloadMediaMessage(message.quoted || message),
                        caption: message.quoted?.body || arg
                    }
                    : {
                        text: arg
                    })
        }, {
            backgroundColor: "#123456",
            font: 3,
            statusJidList: contactList.map((user) => user.userId).concat(aruga.decodeJid(aruga.user.id))
        });
        return await message.reply("Status uploaded successfully", true);
    }
};
