/**
 * Standard API response helpers.
 * @module response
 */

import { HTTP_STATUS, ERROR_CODES } from "../constants/index.js";
import { isObject } from "../utils/helpers.js";

const assertResponse = (res) => {
    if (!res || typeof res.status !== "function" || typeof res.json !== "function") {
        throw new TypeError("Invalid response object provided");
    }
};

const normalizeStatusCode = (statusCode, fallback) => {
    const code = Number(statusCode);
    if (!Number.isFinite(code) || code < 100 || code > 599) {
        return fallback;
    }
    return code;
};

/**
 * Send a standardized success response.
 * @param {import("express").Response} res
 * @param {object} [options]
 * @param {number} [options.statusCode=200]
 * @param {string} [options.message="Success"]
 * @param {unknown} [options.data=null]
 * @param {Record<string, unknown>} [options.meta]
 * @returns {import("express").Response}
 */
export const sendSuccess = (res, options = {}) => {
    assertResponse(res);
    const {
        statusCode = HTTP_STATUS.OK,
        message = "Success",
        data = null,
        meta,
    } = options;

    if (typeof message !== "string" || message.trim() === "") {
        throw new TypeError("Success message must be a non-empty string");
    }

    const payload = {
        success: true,
        message,
        data,
        meta: isObject(meta) ? meta : null,
        timestamp: new Date().toISOString(),
    };

    return res.status(normalizeStatusCode(statusCode, HTTP_STATUS.OK)).json(payload);
};

/**
 * Send a standardized error response.
 * @param {import("express").Response} res
 * @param {object} [options]
 * @param {number} [options.statusCode=500]
 * @param {string} [options.message="Error"]
 * @param {string} [options.code=ERROR_CODES.INTERNAL_ERROR]
 * @param {unknown} [options.details=null]
 * @returns {import("express").Response}
 */
export const sendError = (res, options = {}) => {
    assertResponse(res);
    const {
        statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message = "Error",
        code = ERROR_CODES.INTERNAL_ERROR,
        details = null,
    } = options;

    if (typeof message !== "string" || message.trim() === "") {
        throw new TypeError("Error message must be a non-empty string");
    }

    const payload = {
        success: false,
        message,
        code: typeof code === "string" ? code : ERROR_CODES.INTERNAL_ERROR,
        details,
        timestamp: new Date().toISOString(),
    };

    return res
        .status(normalizeStatusCode(statusCode, HTTP_STATUS.INTERNAL_SERVER_ERROR))
        .json(payload);
};

export default Object.freeze({
  sendSuccess,
  sendError,
});
