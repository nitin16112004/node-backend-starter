/**
 * Structured logger utility.
 * @module utils/logger
 */

import { isObject } from "./helpers.js";

export const LOG_LEVELS = Object.freeze({
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
});

const normalizeLevel = (level) => {
    if (typeof level !== "string") {
        return "info";
    }
    const normalized = level.toLowerCase();
    return Object.prototype.hasOwnProperty.call(LOG_LEVELS, normalized)
        ? normalized
        : "info";
};

const normalizeMeta = (meta) => {
    if (!isObject(meta)) {
        return {};
    }
    const output = {};
    for (const [key, value] of Object.entries(meta)) {
        if (value instanceof Error) {
            output[key] = {
                name: value.name,
                message: value.message,
                stack: value.stack,
            };
        } else {
            output[key] = value;
        }
    }
    return output;
};

const defaultWrite = (level, line) => {
    const stream = level === "error" || level === "warn" ? process.stderr : process.stdout;
    stream.write(line);
};

/**
 * Create a structured logger.
 * @param {object} [options]
 * @param {"error"|"warn"|"info"|"debug"} [options.level="info"]
 * @param {string} [options.name]
 * @param {boolean} [options.timestamp=true]
 * @param {Record<string, unknown>} [options.bindings]
 * @param {(level: string, line: string) => void} [options.write]
 * @returns {{info: Function, warn: Function, error: Function, debug: Function, child: Function}}
 */
export const createLogger = (options = {}) => {
  const { level = "info", name, timestamp = true, bindings = {}, write } = options;

  const normalizedLevel = normalizeLevel(level);
  const minLevel = LOG_LEVELS[normalizedLevel];
    const baseBindings = isObject(bindings) ? bindings : {};
    const writeLine = typeof write === "function" ? write : defaultWrite;

    const log = (currentLevel, message, meta = {}) => {
        if (LOG_LEVELS[currentLevel] > minLevel) {
            return;
        }
        if (typeof message !== "string" || message.trim() === "") {
            throw new TypeError("Logger message must be a non-empty string");
        }
        const record = {
            level: currentLevel,
            message,
            ...baseBindings,
            ...normalizeMeta(meta),
        };
        if (name) {
            record.logger = name;
        }
        if (timestamp) {
            record.time = new Date().toISOString();
        }
        writeLine(currentLevel, `${JSON.stringify(record)}\n`);
    };

    const logger = {
        info: (message, meta) => log("info", message, meta),
        warn: (message, meta) => log("warn", message, meta),
        error: (message, meta) => log("error", message, meta),
        debug: (message, meta) => log("debug", message, meta),
    child: (childBindings = {}) =>
      createLogger({
        level: normalizedLevel,
        name,
        timestamp,
        write: writeLine,
        bindings: { ...baseBindings, ...(isObject(childBindings) ? childBindings : {}) },
      }),
    };

    return Object.freeze(logger);
};

export default createLogger;
