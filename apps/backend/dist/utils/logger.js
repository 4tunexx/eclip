"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const log = (level, message, meta) => {
    const payload = { level, message, meta, ts: new Date().toISOString() };
    const serialized = JSON.stringify(payload);
    if (level === "error") {
        console.error(serialized);
        return;
    }
    if (level === "warn") {
        console.warn(serialized);
        return;
    }
    console.log(serialized);
};
exports.logger = {
    info: (message, meta) => log("info", message, meta),
    warn: (message, meta) => log("warn", message, meta),
    error: (message, meta) => log("error", message, meta),
    debug: (message, meta) => log("debug", message, meta)
};
//# sourceMappingURL=logger.js.map