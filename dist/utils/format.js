"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rtfFormat = exports.phoneFormat = exports.timeFormat = exports.sizeFormat = exports.segmentWordFormat = exports.segmentCharFormat = exports.lowerFormat = exports.upperFormat = void 0;
const formatter_1 = __importDefault(require("@arugaz/formatter"));
const awesome_phonenumber_1 = require("awesome-phonenumber");
const config_1 = __importDefault(require("../utils/config"));
const upperFormat = (string, split = " ", join = " ") => {
    const chunks = string
        .split(split)
        .reduce((prev, curr) => (prev.charAt(0).toUpperCase() + prev.slice(1) + join + curr.charAt(0).toUpperCase() + curr.slice(1)).trim());
    return chunks;
};
exports.upperFormat = upperFormat;
const lowerFormat = (string, split = " ", join = " ") => {
    const chunks = string
        .split(split)
        .reduce((prev, curr) => (prev.charAt(0).toLowerCase() + prev.slice(1) + join + curr.charAt(0).toLowerCase() + curr.slice(1)).trim());
    return chunks;
};
exports.lowerFormat = lowerFormat;
const segmentCharFormat = (string, count = 1, join = " ") => {
    const chunks = [];
    if (count <= 0)
        count = 1;
    for (let i = 0, charsLength = string.length; i < charsLength; i += count) {
        chunks.push(string.substring(i, i + count));
    }
    return chunks.join(join);
};
exports.segmentCharFormat = segmentCharFormat;
const segmentWordFormat = (string, count = 2, split = " ", join = "\n") => {
    const strings = string.split(split);
    const chunks = [];
    while (strings.length) {
        chunks.push(strings.splice(0, count).join(" "));
    }
    return chunks.join(join);
};
exports.segmentWordFormat = segmentWordFormat;
const sf = formatter_1.default.sizeFormatter();
const sizeFormat = (number) => {
    return sf(number);
};
exports.sizeFormat = sizeFormat;
const tf = formatter_1.default.durationFormatter();
const timeFormat = (number) => {
    return tf(number);
};
exports.timeFormat = timeFormat;
const phoneFormat = (number) => {
    const chunks = (0, awesome_phonenumber_1.parsePhoneNumber)(`+${number.replace(/\D+/g, "")}`);
    return {
        countryCode: `${chunks.countryCode}`,
        regionCode: `${chunks.regionCode}`.toLowerCase(),
        international: `${chunks.number.international}`
    };
};
exports.phoneFormat = phoneFormat;
const rtf = new Intl.RelativeTimeFormat(config_1.default.language, { numeric: "auto" });
const rtfFormat = (value, unit) => {
    return rtf.format(value, unit);
};
exports.rtfFormat = rtfFormat;
