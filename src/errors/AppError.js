/**
 * Application error with operational flags.
 * @module errors/AppError
 */

import { HTTP_STATUS, ERROR_CODES } from "../constants/index.js";

export class AppError extends Error {
    /**
     * @param {string} message
     * @param {number} [statusCode=500]
     * @param {string} [code=ERROR_CODES.INTERNAL_ERROR]
     * @param {boolean} [isOperational=true]
     * @param {unknown} [details]
     */
    constructor(
        message,
        statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
        code = ERROR_CODES.INTERNAL_ERROR,
        isOperational = true,
        details,
    ) {
        if (typeof message !== "string" || message.trim() === "") {
            throw new TypeError("AppError message must be a non-empty string");
        }
        super(message);
        this.name = "AppError";
        this.statusCode = Number.isFinite(statusCode)
            ? statusCode
            : HTTP_STATUS.INTERNAL_SERVER_ERROR;
        this.code = typeof code === "string" ? code : ERROR_CODES.INTERNAL_ERROR;
        this.isOperational = Boolean(isOperational);
        this.details = details;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AppError);
        }
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            statusCode: this.statusCode,
            code: this.code,
            isOperational: this.isOperational,
            details: this.details,
        };
    }
}

export default AppError;
