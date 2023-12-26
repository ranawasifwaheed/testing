"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cooldowns = exports.events = exports.commandQueues = exports.commands = void 0;
const queue_1 = require("@arugaz/queue");
const collection_1 = __importDefault(require("@arugaz/collection"));
exports.commands = new collection_1.default();
exports.commandQueues = new queue_1.Queue({ concurrency: 25, timeout: 30 * 1000, throwOnTimeout: true });
exports.events = new Map();
exports.cooldowns = new Map();
