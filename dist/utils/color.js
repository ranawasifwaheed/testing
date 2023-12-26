"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color = {
    black: (text) => `\x1B[30m${text}\x1B[39m`,
    red: (text) => `\x1B[31m${text}\x1B[39m`,
    green: (text) => `\x1B[32m${text}\x1B[39m`,
    yellow: (text) => `\x1B[33m${text}\x1B[39m`,
    blue: (text) => `\x1B[34m${text}\x1B[39m`,
    purple: (text) => `\x1B[35m${text}\x1B[39m`,
    cyan: (text) => `\x1B[36m${text}\x1B[39m`,
    hex: (hex) => (text) => `\x1B[38;2;${hex
        .replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => `${m ? m : "#"}` + r + r + g + g + b + b)
        .substring(1)
        .match(/.{2}/g)
        .map((x) => parseInt(x, 16))
        .join(";")}m${text}\x1B[39m`
};
exports.default = color;
