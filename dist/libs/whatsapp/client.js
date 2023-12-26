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
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _WAClient_cfg, _WAClient_status;
Object.defineProperty(exports, "__esModule", { value: true });
const pino_1 = __importDefault(require("pino"));
const boom_1 = require("@hapi/boom");
const eventemitter_1 = __importDefault(require("@arugaz/eventemitter"));
const baileys_1 = __importStar(require("baileys"));
const whatsapp_1 = require("../../libs/whatsapp");
const database_1 = __importDefault(require("../../libs/database"));
const convert_1 = require("../../libs/convert");
const color_1 = __importDefault(require("../../utils/color"));
const config_1 = __importDefault(require("../../utils/config"));
let first = !0;
class WAClient extends eventemitter_1.default {
    constructor(cfg) {
        super();
        _WAClient_cfg.set(this, void 0);
        _WAClient_status.set(this, void 0);
        __classPrivateFieldSet(this, _WAClient_cfg, cfg, "f");
        __classPrivateFieldSet(this, _WAClient_status, "close", "f");
    }
    decodeJid(jid) {
        if (/:\d+@/gi.test(jid)) {
            const decode = (0, baileys_1.jidDecode)(jid);
            return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
        }
        else
            return jid;
    }
    async downloadMediaMessage(message) {
        return (await (0, baileys_1.downloadMediaMessage)(message, "buffer", {}, { logger: __classPrivateFieldGet(this, _WAClient_cfg, "f").logger, reuploadRequest: this.updateMediaMessage }));
    }
    async resendMessage(jid, message, opts) {
        message.message = message.message?.viewOnceMessage ? message.message.viewOnceMessage?.message : message.message?.viewOnceMessageV2 ? message.message.viewOnceMessage?.message : message.message?.viewOnceMessageV2Extension ? message.message.viewOnceMessageV2Extension?.message : message.message;
        if (message.message[message.type]?.viewOnce)
            delete message.message[message.type].viewOnce;
        const content = (0, baileys_1.generateForwardMessageContent)(baileys_1.proto.WebMessageInfo.fromObject(message), false);
        if (content.listMessage)
            content.listMessage.listType = 1;
        const contentType = Object.keys(content).find((x) => x !== "senderKeyDistributionMessage" && x !== "messageContextInfo" && x !== "inviteLinkGroupTypeV2");
        if (content[contentType]?.contextInfo) {
            delete content[contentType]?.contextInfo.forwardingScore;
            delete content[contentType]?.contextInfo.isForwarded;
        }
        content[contentType].contextInfo = {
            ...(message.message[message.type]?.contextInfo ? message.message[message.type].contextInfo : {}),
            ...content[contentType].contextInfo
        };
        const waMessage = (0, baileys_1.generateWAMessageFromContent)(jid, content, {
            userJid: this.decodeJid(this.user.id),
            ...opts
        });
        if (waMessage?.message?.buttonsMessage?.contentText)
            waMessage.message.buttonsMessage.headerType = baileys_1.proto.Message.ButtonsMessage.HeaderType.EMPTY;
        if (waMessage?.message?.buttonsMessage?.imageMessage)
            waMessage.message.buttonsMessage.headerType = baileys_1.proto.Message.ButtonsMessage.HeaderType.IMAGE;
        if (waMessage?.message?.buttonsMessage?.videoMessage)
            waMessage.message.buttonsMessage.headerType = baileys_1.proto.Message.ButtonsMessage.HeaderType.VIDEO;
        if (waMessage?.message?.buttonsMessage?.documentMessage)
            waMessage.message.buttonsMessage.headerType = baileys_1.proto.Message.ButtonsMessage.HeaderType.DOCUMENT;
        if (waMessage?.message?.buttonsMessage?.locationMessage)
            waMessage.message.buttonsMessage.headerType = baileys_1.proto.Message.ButtonsMessage.HeaderType.LOCATION;
        process.nextTick(() => this.upsertMessage(waMessage, "append"));
        await this.relayMessage(jid, waMessage.message, {
            ...opts,
            messageId: waMessage.key.id,
            cachedGroupMetadata: (jid) => whatsapp_1.database.getGroupMetadata(jid)
        });
        return waMessage;
    }
    async updateProfilePicture(jid, content, crop = false) {
        let bufferOrFilePath;
        if (Buffer.isBuffer(content)) {
            bufferOrFilePath = content;
        }
        else if ("url" in content) {
            bufferOrFilePath = content.url.toString();
        }
        else {
            bufferOrFilePath = await (0, baileys_1.toBuffer)(content.stream);
        }
        const img = (0, convert_1.WAProfile)(bufferOrFilePath, crop);
        await this.query({
            tag: "iq",
            attrs: {
                to: this.decodeJid(jid),
                type: "set",
                xmlns: "w:profile:picture"
            },
            content: [
                {
                    tag: "picture",
                    attrs: { type: "image" },
                    content: await img
                }
            ]
        });
    }
    async sendAcceptInviteV4(jid, node, participants, caption = "Invitation to join my WhatsApp group") {
        if (!jid.endsWith("g.us"))
            throw new TypeError("Invalid jid");
        const result = (0, baileys_1.getBinaryNodeChild)(node, "add_request");
        const inviteCode = result.attrs.code;
        const inviteExpiration = result.attrs.expration;
        const groupName = (await whatsapp_1.database.getGroup(jid)).name;
        const content = baileys_1.proto.Message.fromObject({
            groupInviteMessage: baileys_1.proto.Message.GroupInviteMessage.fromObject({
                inviteCode,
                inviteExpiration,
                groupJid: jid,
                groupName: groupName,
                caption
            })
        });
        const waMessage = (0, baileys_1.generateWAMessageFromContent)(participants, content, {
            userJid: this.decodeJid(this.user.id),
            ephemeralExpiration: 3 * 24 * 60 * 60
        });
        process.nextTick(() => this.upsertMessage(waMessage, "append"));
        await this.relayMessage(participants, waMessage.message, {
            messageId: waMessage.key.id,
            cachedGroupMetadata: (jid) => whatsapp_1.database.getGroupMetadata(jid)
        });
        return waMessage;
    }
    async startClient() {
        const logger = __classPrivateFieldGet(this, _WAClient_cfg, "f").logger || (0, pino_1.default)({ level: "silent" }).child({ level: "silent" });
        __classPrivateFieldGet(this, _WAClient_cfg, "f").logger = logger;
        const { saveState, clearState, state } = (__classPrivateFieldGet(this, _WAClient_cfg, "f").authType === "single" && (await whatsapp_1.auth.useSingleAuthState(database_1.default))) || (__classPrivateFieldGet(this, _WAClient_cfg, "f").authType === "multi" && (await whatsapp_1.auth.useMultiAuthState(database_1.default)));
        const { version, isLatest } = await (0, baileys_1.fetchLatestBaileysVersion)();
        const aruga = (0, baileys_1.default)({
            ...__classPrivateFieldGet(this, _WAClient_cfg, "f"),
            auth: {
                creds: state.creds,
                keys: (0, baileys_1.makeCacheableSignalKeyStore)(state.keys, logger)
            },
            browser: ["whatsapp-bot", "Safari", "3.0.0"],
            logger,
            patchMessageBeforeSending: (message) => {
                if (message.buttonsMessage || message.templateMessage || message.listMessage) {
                    message = {
                        viewOnceMessage: {
                            message: {
                                messageContextInfo: {
                                    deviceListMetadataVersion: 2,
                                    deviceListMetadata: {}
                                },
                                ...message
                            }
                        }
                    };
                }
                return message;
            },
            printQRInTerminal: false,
            version: version
        });
        aruga.ev.on("connection.update", async ({ qr, connection, lastDisconnect }) => {
            if (qr) {
                this.emit("qr", qr);
            }
            if (connection === "close") {
                __classPrivateFieldSet(this, _WAClient_status, "close", "f");
                const reason = new boom_1.Boom(lastDisconnect?.error)?.output?.statusCode;
                this.log("Disconnected!", "error");
                if (reason === baileys_1.DisconnectReason.loggedOut || reason === baileys_1.DisconnectReason.multideviceMismatch || reason === baileys_1.DisconnectReason.badSession) {
                    this.log("Deleting session...", "error");
                    await clearState();
                    this.log("Session deleted!", "error");
                    throw new Error("You have to re-scan QR Code! code: " + reason);
                }
                else {
                    this.log("Reconnecting...", "warning");
                    setTimeout(() => this.startClient().catch(() => this.startClient()), 1500);
                }
            }
            if (connection === "connecting") {
                __classPrivateFieldSet(this, _WAClient_status, "idle", "f");
                this.log("Connecting...", "warning");
            }
            if (connection === "open") {
                __classPrivateFieldSet(this, _WAClient_status, "open", "f");
                this.log("Connected!");
                if (first) {
                    console.log(" ");
                    this.log("Name    : " + (this.user?.name || "unknown"), "info");
                    this.log("Number  : " + (this.user?.id?.split(":")[0] || "unknown"), "info");
                    this.log("Version : " + version.join("."), "info");
                    this.log("Latest  : " + `${isLatest ? "yes" : "nah"}`, "info");
                    first = !first;
                    console.log(" ");
                }
            }
        });
        aruga.ev.on("creds.update", saveState);
        aruga.ev.on("call", (calls) => {
            for (const call of calls) {
                this.emit("call", call);
            }
        });
        aruga.ev.on("messages.upsert", (msg) => {
            for (const message of msg.messages) {
                if (message.message)
                    this.emit("message", message);
            }
        });
        aruga.ev.on("messages.upsert", (msg) => {
            for (const message of msg.messages) {
                if (message.messageStubType === baileys_1.WAMessageStubType.GROUP_CHANGE_SUBJECT ||
                    message.messageStubType === baileys_1.WAMessageStubType.GROUP_CHANGE_ICON ||
                    message.messageStubType === baileys_1.WAMessageStubType.GROUP_CHANGE_INVITE_LINK ||
                    message.messageStubType === baileys_1.WAMessageStubType.GROUP_CHANGE_DESCRIPTION ||
                    message.messageStubType === baileys_1.WAMessageStubType.GROUP_CHANGE_RESTRICT ||
                    message.messageStubType === baileys_1.WAMessageStubType.GROUP_CHANGE_ANNOUNCE)
                    this.emit("group", message);
            }
        });
        aruga.ev.on("messages.upsert", (msg) => {
            for (const message of msg.messages) {
                if (message.messageStubType === baileys_1.WAMessageStubType.GROUP_PARTICIPANT_ADD ||
                    message.messageStubType === baileys_1.WAMessageStubType.GROUP_PARTICIPANT_REMOVE ||
                    message.messageStubType === baileys_1.WAMessageStubType.GROUP_PARTICIPANT_PROMOTE ||
                    message.messageStubType === baileys_1.WAMessageStubType.GROUP_PARTICIPANT_DEMOTE ||
                    message.messageStubType === baileys_1.WAMessageStubType.GROUP_PARTICIPANT_INVITE ||
                    message.messageStubType === baileys_1.WAMessageStubType.GROUP_PARTICIPANT_LEAVE)
                    this.emit("group.participant", message);
            }
        });
        for (const events of [
            "blocklist.set",
            "blocklist.update",
            "call",
            "connection.update",
            "creds.update",
            "chats.delete",
            "chats.update",
            "chats.upsert",
            "contacts.update",
            "contacts.upsert",
            "group-participants.update",
            "groups.update",
            "groups.upsert",
            "message-receipt.update",
            "messages.delete",
            "messages.media-update",
            "messages.reaction",
            "messages.update",
            "messages.upsert",
            "messaging-history.set",
            "presence.update"
        ]) {
            if (events !== "call" && events !== "connection.update" && events !== "creds.update" && events !== "messages.upsert")
                aruga.ev.removeAllListeners(events);
        }
        for (const method of Object.keys(aruga)) {
            if (method !== "ev") {
                if (method !== "ws" && method !== "updateProfilePicture")
                    this[method] = aruga[method];
                delete aruga[method];
            }
        }
    }
    log(text, type = "success", date) {
        console.log(color_1.default[type === "error" ? "red" : type === "warning" ? "yellow" : type === "info" ? "blue" : "green"](`[ ${type === "error" ? "X" : type === "warning" ? "!" : "V"} ]`), color_1.default.hex("#ff7f00")(`${new Date(!date ? Date.now() : date).toLocaleString("en-US", {
            timeZone: config_1.default.timeZone
        })}`), text);
    }
    get status() {
        return __classPrivateFieldGet(this, _WAClient_status, "f");
    }
}
_WAClient_cfg = new WeakMap(), _WAClient_status = new WeakMap();
exports.default = WAClient;
