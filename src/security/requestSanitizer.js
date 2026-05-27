/**
 * Request sanitization middleware.
 * @module security/requestSanitizer
 */

import { isObject } from "../utils/helpers.js";

const DANGEROUS_KEYS = new Set(["__proto__", "constructor", "prototype"]);

const sanitizeString = (value, options) => {
    const { trim, removeNullBytes } = options;
    let output = value;
    if (removeNullBytes) {
        output = output.replace(/\0/g, "");
    }
    if (trim) {
        output = output.trim();
    }
    return output;
};

const sanitizeValue = (value, options, depth, maxDepth) => {
    if (depth > maxDepth) {
        return value;
    }
    if (typeof value === "string") {
        return sanitizeString(value, options);
    }
    if (Array.isArray(value)) {
        return value.map((item) => sanitizeValue(item, options, depth + 1, maxDepth));
    }
    if (isObject(value)) {
        const output = {};
        for (const [key, val] of Object.entries(value)) {
            if (DANGEROUS_KEYS.has(key)) {
                continue;
            }
            output[key] = sanitizeValue(val, options, depth + 1, maxDepth);
        }
        return output;
    }
    return value;
};

/**
 * Create request sanitization middleware.
 * @param {object} [options]
 * @param {boolean} [options.trim=true]
 * @param {boolean} [options.removeNullBytes=true]
 * @param {number} [options.maxDepth=10]
 * @returns {import("express").RequestHandler}
 */
export const requestSanitizer = (options = {}) => {
    const {
        trim = true,
        removeNullBytes = true,
        maxDepth = 10,
    } = options;

    if (!Number.isFinite(maxDepth) || maxDepth <= 0) {
        throw new TypeError("maxDepth must be a positive number");
    }

    const sanitize = (value) =>
        sanitizeValue(value, { trim, removeNullBytes }, 0, maxDepth);

  return (req, _res, next) => {
        if (req.body) {
            req.body = sanitize(req.body);
        }
        if (req.query) {
            req.query = sanitize(req.query);
        }
        if (req.params) {
            req.params = sanitize(req.params);
        }
        next();
    };
};

export default requestSanitizer;
