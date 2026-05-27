/**
 * IP filtering middleware.
 * @module security/ipFilter
 */

import { AppError } from "../errors/AppError.js";
import { ERROR_CODES, HTTP_STATUS } from "../constants/index.js";

const normalizeIp = (ip) => {
    if (typeof ip !== "string") {
        return "";
    }
    return ip.replace("::ffff:", "").trim();
};

/**
 * Create IP filter middleware.
 * @param {object} [options]
 * @param {string[]} [options.allow]
 * @param {string[]} [options.block]
 * @returns {import("express").RequestHandler}
 */
export const ipFilter = (options = {}) => {
  const normalizeList = (list) =>
    list
      .filter((item) => typeof item === "string" && item.trim() !== "")
      .map((item) => normalizeIp(item));
  const allow = Array.isArray(options.allow) ? normalizeList(options.allow) : [];
  const block = Array.isArray(options.block) ? normalizeList(options.block) : [];

  return (req, _res, next) => {
        const ip = normalizeIp(req.ip || req.connection?.remoteAddress || "");

        if (block.length && block.includes(ip)) {
            return next(
                new AppError(
                    "IP blocked",
                    HTTP_STATUS.FORBIDDEN,
                    ERROR_CODES.IP_BLOCKED,
                    true,
                ),
            );
        }

        if (allow.length && !allow.includes(ip)) {
            return next(
                new AppError(
                    "IP not allowed",
                    HTTP_STATUS.FORBIDDEN,
                    ERROR_CODES.IP_BLOCKED,
                    true,
                ),
            );
        }

        return next();
    };
};

export default ipFilter;
