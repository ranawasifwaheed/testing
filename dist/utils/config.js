"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const configPath = (0, path_1.join)(__dirname, "..", "..", "config.json");
const config = JSON.parse(fs_1.default.readFileSync(configPath, "utf-8"));
exports.default = config;
