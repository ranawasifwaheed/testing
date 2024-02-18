"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ffmpeg = void 0;
const child_process_1 = require("child_process");
const ffmpeg = (bufferData, options) => new Promise((resolve, reject) => {
    const result = [];
    options = ["-hide_banner", "-loglevel", "error", "-i", "pipe:0", ...options, "-y", "pipe:1"];
    const spawner = (0, child_process_1.spawn)("ffmpeg", options, { windowsHide: true });
    spawner.stdout.on("data", (data) => result.push(data));
    spawner.stdout.on("error", (err) => reject(err));
    spawner.on("error", (err) => reject(err));
    spawner.on("close", () => resolve(Buffer.concat(result)));
    spawner.stdin.on("error", (err) => reject(err));
    spawner.stdin.write(bufferData);
    spawner.stdin.end(() => (bufferData = null));
});
exports.ffmpeg = ffmpeg;
