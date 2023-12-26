"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    execute: async ({ aruga, message, group }) => {
        if (message.isGroupMsg && group.antiviewonce && message.viewOnce) {
            return await aruga.resendMessage(message.from, message, { ephemeralExpiration: message.expiration });
        }
    }
};
