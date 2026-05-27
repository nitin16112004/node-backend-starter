/**
 * Authentication and authorization middleware.
 * @module auth/middleware
 */

import { AppError } from "../errors/AppError.js";
import { ERROR_CODES, HTTP_STATUS, DEFAULT_HEADERS } from "../constants/index.js";
import { extractBearerToken, verifyToken } from "./jwt.js";

const normalizeRoles = (roles) => {
    if (Array.isArray(roles)) {
        return roles.filter((role) => typeof role === "string" && role.trim() !== "");
    }
    if (typeof roles === "string" && roles.trim() !== "") {
        return [roles.trim()];
    }
    return [];
};

/**
 * Create authentication middleware.
 * @param {object} options
 * @param {string} options.secret
 * @param {"access"|"refresh"} [options.tokenType="access"]
 * @param {string} [options.header=DEFAULT_HEADERS.AUTHORIZATION]
 * @param {string} [options.userProperty="user"]
 * @param {boolean} [options.required=true]
 * @param {(req: import("express").Request) => string | null} [options.getToken]
 * @param {object} [options.verifyOptions]
 * @returns {import("express").RequestHandler}
 */
export const authenticate = (options) => {
    if (!options || typeof options !== "object") {
        throw new TypeError("authenticate expects an options object");
    }
  const {
    secret,
    tokenType = "access",
    header = DEFAULT_HEADERS.AUTHORIZATION,
    userProperty = "user",
        required = true,
        getToken,
        verifyOptions,
    } = options;

  if (typeof secret !== "string" || secret.trim() === "") {
    throw new TypeError("authenticate requires a JWT secret");
  }
  if (!["access", "refresh"].includes(tokenType)) {
    throw new TypeError("tokenType must be 'access' or 'refresh'");
  }
  if (typeof userProperty !== "string" || userProperty.trim() === "") {
    throw new TypeError("userProperty must be a non-empty string");
  }
  if (typeof header !== "string" || header.trim() === "") {
    throw new TypeError("header must be a non-empty string");
  }

  return (req, _res, next) => {
        try {
      const headerKey =
        typeof header === "string" && header.trim() !== ""
          ? header.toLowerCase()
          : DEFAULT_HEADERS.AUTHORIZATION;
      const token =
        typeof getToken === "function"
          ? getToken(req)
          : extractBearerToken(req?.headers?.[headerKey]);

            if (!token) {
                if (!required) {
                    return next();
                }
                return next(
                    new AppError(
                        "Authentication required",
                        HTTP_STATUS.UNAUTHORIZED,
                        ERROR_CODES.UNAUTHORIZED,
                        true,
                    ),
                );
            }

            const payload = verifyToken(token, {
                secret,
                expectedType: tokenType,
                ...verifyOptions,
            });

            req[userProperty] = payload;
            return next();
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return next(
                    new AppError(
                        "Token expired",
                        HTTP_STATUS.UNAUTHORIZED,
                        ERROR_CODES.TOKEN_EXPIRED,
                        true,
                    ),
                );
            }
            if (error.name === "JsonWebTokenError" || error.code === "INVALID_TOKEN") {
                return next(
                    new AppError(
                        "Invalid token",
                        HTTP_STATUS.UNAUTHORIZED,
                        ERROR_CODES.INVALID_TOKEN,
                        true,
                    ),
                );
            }
            return next(error);
        }
    };
};

/**
 * Create role-based authorization middleware.
 * @param {string[] | string} allowedRoles
 * @param {object} [options]
 * @param {string} [options.userProperty="user"]
 * @param {string} [options.roleProperty="role"]
 * @param {string} [options.rolesProperty="roles"]
 * @returns {import("express").RequestHandler}
 */
export const authorizeRoles = (allowedRoles, options = {}) => {
    const roles = normalizeRoles(allowedRoles);
    if (roles.length === 0) {
        throw new TypeError("authorizeRoles expects at least one role");
    }
  const {
    userProperty = "user",
    roleProperty = "role",
    rolesProperty = "roles",
  } = options;
  if (typeof userProperty !== "string" || userProperty.trim() === "") {
    throw new TypeError("userProperty must be a non-empty string");
  }
  if (typeof roleProperty !== "string" || roleProperty.trim() === "") {
    throw new TypeError("roleProperty must be a non-empty string");
  }
  if (typeof rolesProperty !== "string" || rolesProperty.trim() === "") {
    throw new TypeError("rolesProperty must be a non-empty string");
  }

  return (req, _res, next) => {
        const user = req?.[userProperty];
        if (!user || typeof user !== "object") {
            return next(
                new AppError(
                    "Authentication required",
                    HTTP_STATUS.UNAUTHORIZED,
                    ERROR_CODES.UNAUTHORIZED,
                    true,
                ),
            );
        }

        const userRoles = normalizeRoles(
            Array.isArray(user[rolesProperty]) ? user[rolesProperty] : user[roleProperty],
        );

        const isAllowed = roles.some((role) => userRoles.includes(role));
        if (!isAllowed) {
            return next(
                new AppError(
                    "Forbidden",
                    HTTP_STATUS.FORBIDDEN,
                    ERROR_CODES.FORBIDDEN,
                    true,
                ),
            );
        }

        return next();
    };
};

export default Object.freeze({
  authenticate,
  authorizeRoles,
});
