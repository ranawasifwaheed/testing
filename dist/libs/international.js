"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.i18nInit = void 0;
const translator_1 = __importDefault(require("@arugaz/translator"));
const path_1 = require("path");
const fs_1 = require("fs");
const config_1 = __importDefault(require("../utils/config"));
const i18n = (0, translator_1.default)();
i18n.locale(config_1.default.language);
const i18nInit = () => {
    const listISO = JSON.parse((0, fs_1.readFileSync)((0, path_1.join)(__dirname, "..", "..", "database", "languages.json"), { encoding: "utf-8" })).map((v) => v.iso);
    const files = (0, fs_1.readdirSync)((0, path_1.join)(__dirname, "..", "..", "languages"));
    for (const file of files) {
        const filePath = (0, path_1.join)(__dirname, "..", "..", "languages", file);
        const isDirectory = (0, fs_1.lstatSync)(filePath).isDirectory();
        if (isDirectory || !file.endsWith(".json"))
            continue;
        const iso = file.split(".")[0];
        if (listISO.includes(iso))
            i18n.set(iso, JSON.parse((0, fs_1.readFileSync)(filePath, "utf-8")));
    }
};
exports.i18nInit = i18nInit;
exports.default = i18n;
