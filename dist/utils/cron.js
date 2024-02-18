"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetUserRole = exports.resetUserLimit = void 0;
const croner_1 = require("croner");
const database_1 = __importDefault(require("../libs/database"));
const config_1 = __importDefault(require("../utils/config"));
const whatsapp_1 = require("../libs/whatsapp");
exports.resetUserLimit = new croner_1.Cron("0 0 0 * * *", {
    timezone: config_1.default.timeZone
}, async () => {
    await Promise.all([
        database_1.default.user.updateMany({
            where: {
                userId: {
                    contains: "s.whatsapp.net"
                },
                role: {
                    in: ["basic"]
                }
            },
            data: {
                limit: config_1.default.user.basic.limit
            }
        }),
        database_1.default.user.updateMany({
            where: {
                userId: {
                    contains: "s.whatsapp.net"
                },
                role: {
                    in: ["premium"]
                }
            },
            data: {
                limit: config_1.default.user.premium.limit
            }
        }),
        database_1.default.user.updateMany({
            where: {
                userId: {
                    contains: "s.whatsapp.net"
                },
                role: {
                    in: ["vip"]
                }
            },
            data: {
                limit: config_1.default.user.vip.limit
            }
        })
    ]);
    whatsapp_1.database.user.flushAll();
});
exports.resetUserRole = new croner_1.Cron("0 */15 * * * *", {
    timezone: config_1.default.timeZone
}, async () => {
    await database_1.default.user.updateMany({
        where: {
            userId: {
                contains: "s.whatsapp.net"
            },
            role: {
                in: ["premium", "vip"]
            },
            expire: {
                lte: Date.now()
            }
        },
        data: {
            role: "basic",
            expire: config_1.default.user.basic.expires ? config_1.default.user.basic.expires : 0
        }
    });
});
