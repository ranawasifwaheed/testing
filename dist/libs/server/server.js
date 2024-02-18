"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({
    override: !1
});
const fastifyServer = (fastifyOpts) => {
    const fastify = (0, fastify_1.default)({ ...fastifyOpts });
    fastify
        .get("/healthcheck", () => {
        return {
            message: "I'm healthy!",
            error: "Success",
            statusCode: 200
        };
    });
    return fastify;
};
exports.default = fastifyServer;
