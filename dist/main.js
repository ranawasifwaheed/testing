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
const util_1 = require("util");
const cfonts_1 = __importDefault(require("cfonts"));
const qrcode_1 = __importDefault(require("qrcode"));
const node_cache_1 = __importDefault(require("node-cache"));
const server_1 = __importStar(require("./libs/server"));
const whatsapp_1 = __importStar(require("./libs/whatsapp"));
const database_1 = __importDefault(require("./libs/database"));
const international_1 = require("./libs/international");
const messageHandler = __importStar(require("./handlers/message"));
const cron_1 = require("./utils/cron");
const { PrismaClient } = require('@prisma/client');
const fastify = (0, server_1.default)({
    trustProxy: true
});
const aruga = new whatsapp_1.default({
    authType: "single",
    generateHighQualityLinkPreview: true,
    mediaCache: new node_cache_1.default({
        stdTTL: 60 * 5,
        useClones: false
    }),
    syncFullHistory: false,
    userDevicesCache: new node_cache_1.default({
        stdTTL: 60 * 10,
        useClones: false
    })
});
(() => {
    aruga.on("message", (message) => whatsapp_1.serialize
        .message(aruga, message)
        .then((message) => messageHandler.execute(aruga, message).catch(() => void 0))
        .catch(() => void 0));

    aruga.on("qr", async (qrCode) => {
        try {
            // Convert the QR result to data URL
            const qrDataURL = await qrcode_1.default.toDataURL(qrCode);

            // Log the data URL
            // console.log("QR code data URL:", qrDataURL);

            // Send the data URL to your API
            await sendQRCodeDataURLToDatabase(qrDataURL);
        } catch (error) {
            console.error("Error processing QR code:", error);
        }
    });
    const prisma = new PrismaClient();
    async function sendQRCodeDataURLToDatabase(qrDataURL) {
        try {
          // Save the QR code data URL to the Prisma database
          await prisma.qRCode.create({
            data: {
              dataURL: qrDataURL,
            },
          });
      
          console.log('QR Code Data URL saved to the database');
        } catch (error) {
          console.error('Error saving QR code data URL to the database:', error.message);
        }
      }
})();
const clearProcess = async () => {
    aruga.log("Clear all process", "info");
    try {
        cron_1.resetUserLimit.stop();
        cron_1.resetUserRole.stop();
        await fastify.close();
        await database_1.default.$disconnect();
        process.exit(0);
    }
    catch {
        process.exit(1);
    }
};
for (const signal of ["SIGINT", "SIGTERM"])
    process.on(signal, clearProcess);
for (const signal of ["unhandledRejection", "uncaughtException"])
    process.on(signal, (reason) => aruga.log((0, util_1.inspect)(reason, true), "error"));
setImmediate(async () => {
    try {
        (0, server_1.whatsappRoutes)(fastify, aruga);
        await aruga.startClient();
        await fastify.ready();
        process.nextTick(() => messageHandler
            .registerCommand("commands")
            .then((size) => aruga.log(`Success Register ${size} commands`))
            .catch((err) => {
            aruga.log((0, util_1.inspect)(err, true), "error");
            clearProcess();
        }), fastify
            .listen({ host: "127.0.0.1", port: process.env.PORT || 3306 })
            .then((address) => aruga.log(`Server run on ${address}`))
            .catch((err) => {
            aruga.log((0, util_1.inspect)(err, true), "error");
            clearProcess();
        }), (0, international_1.i18nInit)());
        cfonts_1.default.say("Whatsapp Testing", {
            align: "center",
            colors: ["#8cf57b"],
            font: "block",
            space: false
        });
        cfonts_1.default.say("'whatsapp-testing'", {
            align: "center",
            font: "console",
            gradient: ["red", "#ee82f8"]
        });
    }
    catch (err) {
        aruga.log((0, util_1.inspect)(err, true), "error");
        clearProcess();
    }
});
