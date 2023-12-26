"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const Database = new client_1.PrismaClient({
    errorFormat: "minimal"
});
exports.default = Database;
