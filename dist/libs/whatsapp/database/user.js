"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUsers = exports.getUser = exports.user = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
const database_1 = __importDefault(require("../../../libs/database"));
const config_1 = __importDefault(require("../../../utils/config"));
exports.user = new node_cache_1.default({
    stdTTL: 60 * 10,
    useClones: false
});
const getUser = async (userId) => {
    try {
        if (exports.user.has(userId))
            return exports.user.get(userId);
        const userData = await database_1.default.user.findUnique({
            where: { userId }
        });
        if (userData)
            exports.user.set(userId, userData);
        return userData;
    }
    catch {
        return null;
    }
};
exports.getUser = getUser;
const getUsers = async (opts) => {
    try {
        const userData = await database_1.default.user.findMany(opts);
        return userData;
    }
    catch {
        return null;
    }
};
exports.getUsers = getUsers;
const createUser = async (userId, metadata) => {
    try {
        if (exports.user.has(userId))
            return exports.user.get(userId);
        const userData = await database_1.default.user.create({
            data: {
                userId,
                name: metadata?.name || "",
                language: config_1.default.language,
                limit: config_1.default.user.basic.limit || 30,
                ban: metadata?.ban || false
            }
        });
        if (userData)
            exports.user.set(userId, userData);
        return userData;
    }
    catch {
        return null;
    }
};
exports.createUser = createUser;
const updateUser = async (userId, metadata) => {
    try {
        const userData = await database_1.default.user.update({
            where: { userId },
            data: { ...metadata }
        });
        if (userData)
            exports.user.set(userId, userData);
        return userData;
    }
    catch {
        return null;
    }
};
exports.updateUser = updateUser;
const deleteUser = async (userId) => {
    try {
        if (exports.user.has(userId))
            exports.user.del(userId);
        return await database_1.default.user.delete({ where: { userId } });
    }
    catch {
        return null;
    }
};
exports.deleteUser = deleteUser;
