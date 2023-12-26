"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const format_1 = require("../../utils/format");
exports.default = {
    category: "misc",
    desc: "Ping bot",
    execute: ({ message, arg }) => {
        const ping = Date.now() - message.timestamps;
        return message.reply(`pong!  ${(0, format_1.rtfFormat)(ping / 1000, "seconds")} ${arg}`, true);
    }
};
