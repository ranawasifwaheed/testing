"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSingleAuthState = exports.useMultiAuthState = void 0;
const baileys_1 = require("baileys");
const useMultiAuthState = async (Database) => {
    const fixFileName = (fileName) => fileName.replace(/\//g, "__")?.replace(/:/g, "-");
    const writeData = async (data, fileName) => {
        try {
            const sessionId = fixFileName(fileName);
            const session = JSON.stringify(data, baileys_1.BufferJSON.replacer);
            await Database.session.upsert({
                where: {
                    sessionId
                },
                update: {
                    sessionId,
                    session
                },
                create: {
                    sessionId,
                    session
                }
            });
        }
        catch { }
    };
    const readData = async (fileName) => {
        try {
            const sessionId = fixFileName(fileName);
            const data = await Database.session.findFirst({
                where: {
                    sessionId
                }
            });
            return JSON.parse(data?.session, baileys_1.BufferJSON.reviver);
        }
        catch {
            return null;
        }
    };
    const removeData = async (fileName) => {
        try {
            const sessionId = fixFileName(fileName);
            await Database.session.delete({
                where: {
                    sessionId
                }
            });
        }
        catch { }
    };
    const creds = (await readData("creds")) || (0, baileys_1.initAuthCreds)();
    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const data = {};
                    await Promise.all(ids.map(async (id) => {
                        let value = await readData(`${type}-${id}`);
                        if (type === "app-state-sync-key" && value)
                            value = baileys_1.proto.Message.AppStateSyncKeyData.fromObject(value);
                        data[id] = value;
                    }));
                    return data;
                },
                set: async (data) => {
                    const tasks = [];
                    for (const category in data) {
                        for (const id in data[category]) {
                            const value = data[category][id];
                            const file = `${category}-${id}`;
                            tasks.push(value ? writeData(value, file) : removeData(file));
                        }
                    }
                    try {
                        await Promise.all(tasks);
                    }
                    catch { }
                }
            }
        },
        saveState: async () => {
            try {
                await writeData(creds, "creds");
            }
            catch { }
        },
        clearState: async () => {
            try {
                await Database.session.deleteMany({});
            }
            catch { }
        }
    };
};
exports.useMultiAuthState = useMultiAuthState;
const useSingleAuthState = async (Database) => {
    const KEY_MAP = {
        "pre-key": "preKeys",
        session: "sessions",
        "sender-key": "senderKeys",
        "app-state-sync-key": "appStateSyncKeys",
        "app-state-sync-version": "appStateVersions",
        "sender-key-memory": "senderKeyMemory"
    };
    let creds;
    let keys = {};
    const storedCreds = await Database.session.findFirst({
        where: {
            sessionId: "creds"
        }
    });
    if (storedCreds && storedCreds.session) {
        const parsedCreds = JSON.parse(storedCreds.session, baileys_1.BufferJSON.reviver);
        creds = parsedCreds.creds;
        keys = parsedCreds.keys;
    }
    else {
        if (!storedCreds)
            await Database.session.create({
                data: {
                    sessionId: "creds"
                }
            });
        creds = (0, baileys_1.initAuthCreds)();
    }
    const saveState = async () => {
        try {
            const session = JSON.stringify({ creds, keys }, baileys_1.BufferJSON.replacer);
            await Database.session.update({ where: { sessionId: "creds" }, data: { session } });
        }
        catch { }
    };
    return {
        state: {
            creds,
            keys: {
                get: (type, ids) => {
                    const key = KEY_MAP[type];
                    return ids.reduce((dict, id) => {
                        const value = keys[key]?.[id];
                        if (value) {
                            if (type === "app-state-sync-key")
                                dict[id] = baileys_1.proto.Message.AppStateSyncKeyData.fromObject(value);
                            dict[id] = value;
                        }
                        return dict;
                    }, {});
                },
                set: async (data) => {
                    for (const _key in data) {
                        const key = KEY_MAP[_key];
                        keys[key] = keys[key] || {};
                        Object.assign(keys[key], data[_key]);
                    }
                    try {
                        await saveState();
                    }
                    catch { }
                }
            }
        },
        saveState,
        clearState: async () => {
            try {
                await Database.session.delete({
                    where: { sessionId: "creds" }
                });
            }
            catch { }
        }
    };
};
exports.useSingleAuthState = useSingleAuthState;
