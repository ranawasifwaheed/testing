"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommand = exports.execute = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const util_1 = require("util");
const child_process_1 = require("child_process");
const queue_1 = require("@arugaz/queue");
const timers_1 = require("timers");
const international_1 = __importDefault(require("../libs/international"));
const color_1 = __importDefault(require("../utils/color"));
const config_1 = __importDefault(require("../utils/config"));
const format_1 = require("../utils/format");
const whatsapp_1 = require("../libs/whatsapp");
const readdirSync = fs_1.readdirSync;
const lstatSync = fs_1.lstatSync;
const join = path_1.join;
const sep = path_1.sep;
const basename = path_1.basename;
const inspect = util_1.inspect;
const exec = child_process_1.exec;
const setImmediate = timers_1.setImmediate;
const setTimeout = timers_1.setTimeout;
const i18n = international_1.default;
const color = color_1.default;
const config = config_1.default;
const timeFormat = format_1.rtfFormat;
const commands = whatsapp_1.command.commands;
const events = whatsapp_1.command.events;
const cooldowns = whatsapp_1.command.cooldowns;
const commandQueues = whatsapp_1.command.commandQueues;
const getUser = whatsapp_1.database.getUser;
const createUser = whatsapp_1.database.createUser;
const getGroup = whatsapp_1.database.getGroup;
const createGroup = whatsapp_1.database.createGroup;
const execute = async (aruga, message) => {
    const group = message.isGroupMsg && ((await getGroup(message.from)) ?? (await createGroup(message.from, { name: message.groupMetadata.subject })));
    const user = message.sender && ((await getUser(message.sender)) ?? (await createUser(message.sender, { name: message.pushname })));
    const isOwner = message.sender && (config.self ? config.ownerNumber.concat([aruga.decodeJid(aruga.user.id).split("@")[0]]) : config.ownerNumber).includes(message.sender.replace(/\D+/g, ""));
    if (message.sender && user.ban && !isOwner)
        return;
    if (message.isGroupMsg && group.ban && !isOwner)
        return;
    const prefix = message.body && ([[new RegExp("^[" + (config.prefix || "/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.\\-").replace(/[|\\{}()[\]^$+*?.\-^]/g, "\\$&") + "]").exec(message.body), config.prefix || "/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.\\-"]].find((p) => p[1])[0] || [""])[0];
    const cmd = message.body && !!prefix && message.body.startsWith(prefix) && message.body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase();
    const args = message.body.trim().split(/ +/).slice(1) || [];
    const arg = message.body.indexOf(" ") !== -1 ? message.body.trim().substring(message.body.indexOf(" ") + prefix.length) : "";
    const command = commands.get(cmd) ?? commands.find((v) => v.aliases && v.aliases.includes(cmd));
    const groupAdmins = message.isGroupMsg && message.groupMetadata.participants.reduce((memberAdmin, memberNow) => (memberNow.admin ? memberAdmin.push({ id: memberNow.id, admin: memberNow.admin }) : [...memberAdmin]) && memberAdmin, []);
    const isGroupOwner = message.isGroupMsg && !!groupAdmins.find((member) => member.admin === "superadmin" && member.id === message.sender);
    const isGroupAdmin = message.isGroupMsg && !!groupAdmins.find((member) => member.id === message.sender);
    const isBotGroupAdmin = message.isGroupMsg && !!groupAdmins.find((member) => member.id === aruga.decodeJid(aruga.user.id));
    setImmediate(() => events.forEach((event, key) => {
        try {
            typeof event.execute === "function" && event.execute({ aruga, message, command: cmd, prefix, args, arg, isGroupOwner, isGroupAdmin, isBotGroupAdmin, isOwner, user, group });
        }
        catch {
            aruga.log(`${color.red("[ERRS]")} ${color.cyan(`${key} [${message.body.length}]`)} from ${color.blue(user.name)} ${message.isGroupMsg ? `in ${color.blue(message.groupMetadata.subject || "unknown")}` : ""}`.trim(), "error", message.timestamps);
        }
    }));
    if (command) {
        if (cooldowns.has(message.sender + cmd)) {
            await message.reply(i18n.translate("handlers.message.cooldown", { "@SKNDS": timeFormat(Math.abs((command.cd || 3) - (Date.now() - cooldowns.get(message.sender + cmd)) / 1000), "seconds").replace(/-/g, "") }, user.language), true);
            return aruga.log(`${color.yellow("[SPAM]")} ${color.cyan(`${cmd} [${arg.length}]`)} from ${color.blue(message.pushname)} ${message.isGroupMsg ? `in ${color.blue(message.groupMetadata.subject || "unknown")}` : ""}`.trim(), "warning", message.timestamps);
        }
        if (message.isGroupMsg && group.mute && !isOwner && !command.adminGroup && !isGroupAdmin)
            return;
        if (command.maintenance && !isOwner)
            return await message.reply(i18n.translate("handlers.message.maintenance", {}, user.language));
        if (command.ownerOnly && !isOwner)
            return await message.reply(i18n.translate("handlers.message.ownerOnly", {}, user.language));
        if (command.premiumOnly && user.role !== "vip" && user.role !== "premium" && !isOwner)
            return await message.reply(i18n.translate("handlers.message.premiumOnly", {}, user.language));
        if (command.privateOnly && message.isGroupMsg)
            return await message.reply(i18n.translate("handlers.message.privateOnly", {}, user.language));
        if (command.groupOnly && !message.isGroupMsg)
            return await message.reply(i18n.translate("handlers.message.groupOnly", {}, user.language));
        if (command.botGroupAdmin && message.isGroupMsg && !isBotGroupAdmin)
            return await message.reply(i18n.translate("handlers.message.botGroupAdmin", {}, user.language));
        if (command.ownerGroup && message.isGroupMsg && !isGroupOwner && !isOwner)
            return await message.reply(i18n.translate("handlers.message.ownerGroup", {}, user.language));
        if (command.adminGroup && message.isGroupMsg && !isGroupAdmin && !isOwner)
            return await message.reply(i18n.translate("handlers.message.adminGroup", {}, user.language));
        try {
            if (command.category !== "general" && user.role !== "vip" && user.role !== "premium" && !isOwner) {
                cooldowns.set(message.sender + cmd, Date.now());
                setTimeout(() => cooldowns.delete(message.sender + cmd), (command.cd || 3) * 1000);
            }
            typeof command.execute === "function" &&
                (await commandQueues.add(() => command.execute({ aruga, message, command: cmd, prefix, args, arg, isGroupOwner, isGroupAdmin, isBotGroupAdmin, isOwner, user, group }), {
                    priority: isOwner ? 30 : user.role === "vip" ? 20 : user.role === "premium" ? 10 : 0
                }));
            return aruga.log(`${color.green("[CMDS]")} ${color.cyan(`${commands.findKey((v) => v === command)} [${arg.length}]`)} from ${color.blue(user.name)} ${message.isGroupMsg ? `in ${color.blue(message.groupMetadata.subject || "unknown")}` : ""}`.trim(), "success", message.timestamps);
        }
        catch (e) {
            if (typeof e === "string" && e === "noCmd") {
                await message.reply(i18n.translate("handlers.message.errorMessage.noCmd", { "@CMD": `"${prefix}menu ${cmd}"` }, user.language), true);
            }
            else if (e instanceof queue_1.TimeoutError) {
                await message.reply(i18n.translate("handlers.message.errorMessage.timeout", {}, user.language), true);
            }
            else if (typeof e === "string" || e instanceof Error) {
                await message.reply(i18n.translate("handlers.message.errorMessage.error", { "@ERRMSG": typeof e === "string" ? e : e.message }, user.language), true);
            }
            else {
                await message.reply(i18n.translate("handlers.message.errorMessage.unknown", {}, user.language), true);
            }
            return aruga.log(`${color.red("[ERRS]")} ${color.cyan(`${commands.findKey((v) => v === command)} [${arg.length}]`)} from ${color.blue(user.name)} ${message.isGroupMsg ? `in ${color.blue(message.groupMetadata.subject || "unknown")}` : ""}`.trim(), "error", message.timestamps);
        }
    }
    if (message.body.startsWith(">>") && isOwner) {
        new Promise((resolve, reject) => {
            try {
                resolve(eval("(async() => {" + arg + "})()"));
            }
            catch (err) {
                reject(err);
            }
        })
            .then((res) => message.reply(inspect(res, true)))
            .catch((err) => message.reply(inspect(err, true)))
            .finally(() => aruga.log(`${color.purple("[EVAL]")} ${color.cyan(`>> [${arg.length}]`)} from ${color.blue(message.pushname)} ${message.isGroupMsg ? `in ${color.blue(message.groupMetadata.subject || "unknown")}` : ""}`.trim(), "info", message.timestamps));
    }
    if (message.body.startsWith("$") && isOwner) {
        new Promise((resolve, reject) => {
            exec(`${arg}`, { windowsHide: true }, (err, stdout, stderr) => {
                if (err)
                    return reject(err);
                if (stderr)
                    return reject(stderr);
                resolve(stdout);
            });
        })
            .then((res) => message.reply(inspect(res, true)))
            .catch((err) => message.reply(inspect(err, true)))
            .finally(() => aruga.log(`${color.purple("[EXEC]")} ${color.cyan(`$ [${arg.length}]`)} from ${color.blue(message.pushname)} ${message.isGroupMsg ? `in ${color.blue(message.groupMetadata.subject || "unknown")}` : ""}`.trim(), "info", message.timestamps));
    }
};
exports.execute = execute;
const registerCommand = async (pathname = "commands") => {
    const files = readdirSync(join(__dirname, "..", pathname));
    for (const file of files) {
        const filePath = join(__dirname, "..", pathname, file);
        const isDirectory = lstatSync(filePath).isDirectory();
        if (isDirectory)
            await (0, exports.registerCommand)(pathname + sep + file);
        const baseFilename = basename(file, file.includes(".ts") ? ".ts" : ".js").toLowerCase();
        if (!isDirectory) {
            const importFile = await Promise.resolve(`${filePath}`).then(s => __importStar(require(s)));
            const name = importFile?.name || baseFilename;
            if (!commands.has(name) && !name.endsWith("_")) {
                const cmd = importFile?.default || importFile;
                commands.set(name, cmd);
            }
            if (!events.has(name) && name.endsWith("_")) {
                const evt = importFile?.default || importFile;
                events.set(name, evt);
            }
        }
    }
    commands.sort();
    return commands.size + events.size;
};
exports.registerCommand = registerCommand;
