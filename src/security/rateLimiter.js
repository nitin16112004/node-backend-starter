/**
 * Rate limiter middleware.
 * @module security/rateLimiter
 */

import rateLimit from "express-rate-limit";
import { ERROR_CODES, HTTP_STATUS } from "../constants/index.js";

/**
 * Create a rate limiter.
 * @param {object} [options]
 * @param {number} [options.windowMs=900000]
 * @param {number} [options.max=100]
 * @param {string} [options.message="Too many requests"]
 * @param {boolean} [options.standardHeaders=true]
 * @param {boolean} [options.legacyHeaders=false]
 * @param {(req: import("express").Request) => string} [options.keyGenerator]
 * @returns {import("express").RequestHandler}
 */
export const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000,
    max = 100,
    message = "Too many requests",
        standardHeaders = true,
        legacyHeaders = false,
        keyGenerator,
    } = options;

    if (!Number.isFinite(windowMs) || windowMs <= 0) {
        throw new TypeError("windowMs must be a positive number");
    }
  if (!Number.isFinite(max) || max <= 0) {
    throw new TypeError("max must be a positive number");
  }
  if (typeof message !== "string" || message.trim() === "") {
    throw new TypeError("message must be a non-empty string");
  }

    return rateLimit({
        windowMs,
        max,
        standardHeaders,
        legacyHeaders,
        keyGenerator,
    handler: (_req, res) => {
            res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
                success: false,
                message,
                code: ERROR_CODES.RATE_LIMITED,
                timestamp: new Date().toISOString(),
            });
        },
    });
};

export default createRateLimiter;
