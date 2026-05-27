/**
 * JWT helpers.
 * @module auth/jwt
 */

import jwt from "jsonwebtoken";
import { AppError } from "../errors/AppError.js";
import { ERROR_CODES, TOKEN_TYPES, HTTP_STATUS } from "../constants/index.js";
import { isObject } from "../utils/helpers.js";

const ensureSecret = (secret) => {
    if (typeof secret !== "string" || secret.trim() === "") {
        throw new TypeError("JWT secret must be a non-empty string");
    }
};

const ensurePayload = (payload) => {
    if (!isObject(payload)) {
        throw new TypeError("JWT payload must be a plain object");
    }
};

const signToken = (payload, options = {}) => {
    ensurePayload(payload);
    const {
        secret,
        expiresIn,
        issuer,
        audience,
        subject,
        jwtid,
        tokenType,
        algorithm,
    } = options;

    ensureSecret(secret);
    if (typeof expiresIn !== "string" || expiresIn.trim() === "") {
        throw new TypeError("expiresIn must be a non-empty string");
    }

    const safeIssuer =
        typeof issuer === "string" && issuer.trim() !== ""
            ? issuer
            : "backend-kit";
    const safeAudience =
        typeof audience === "string" && audience.trim() !== ""
            ? audience
            : "backend-kit-users";

    const fullPayload = {
        ...payload,
        tokenType,
    };

    const signOptions = {
        expiresIn,
        issuer: safeIssuer,
        audience: safeAudience,
        subject,
        jwtid,
        algorithm,
    };

    for (const key of Object.keys(signOptions)) {
        if (signOptions[key] === undefined) {
            delete signOptions[key];
        }
    }

    return jwt.sign(fullPayload, secret, signOptions);
};

/**
 * Sign an access token.
 * @param {Record<string, unknown>} payload
 * @param {object} options
 * @param {string} options.secret
 * @param {string} [options.expiresIn="15m"]
 * @param {string} [options.issuer]
 * @param {string} [options.audience]
 * @param {string} [options.subject]
 * @param {string} [options.jwtid]
 * @returns {string}
 */
export const signAccessToken = (payload, options) =>
    signToken(payload, {
        ...options,
        expiresIn: options?.expiresIn ?? "15m",
        tokenType: TOKEN_TYPES.ACCESS,
    });

/**
 * Sign a refresh token.
 * @param {Record<string, unknown>} payload
 * @param {object} options
 * @param {string} options.secret
 * @param {string} [options.expiresIn="7d"]
 * @param {string} [options.issuer]
 * @param {string} [options.audience]
 * @param {string} [options.subject]
 * @param {string} [options.jwtid]
 * @returns {string}
 */
export const signRefreshToken = (payload, options) =>
    signToken(payload, {
        ...options,
        expiresIn: options?.expiresIn ?? "7d",
        tokenType: TOKEN_TYPES.REFRESH,
    });

/**
 * Verify a token and optionally enforce token type.
 * @param {string} token
 * @param {object} options
 * @param {string} options.secret
 * @param {string} [options.issuer]
 * @param {string} [options.audience]
 * @param {number} [options.clockTolerance]
 * @param {boolean} [options.ignoreExpiration=false]
 * @param {"access"|"refresh"} [options.expectedType]
 * @returns {Record<string, unknown>}
 */
export const verifyToken = (token, options) => {
    if (typeof token !== "string" || token.trim() === "") {
        throw new TypeError("JWT token must be a non-empty string");
    }
    const {
        secret,
        issuer,
        audience,
        clockTolerance,
        ignoreExpiration = false,
        expectedType,
    } = options ?? {};

    ensureSecret(secret);

    try {
        const decoded = jwt.verify(token, secret, {
            issuer,
            audience,
            clockTolerance,
            ignoreExpiration,
        });
        if (!decoded || typeof decoded !== "object") {
            throw new AppError(
                "Invalid token payload",
                HTTP_STATUS.UNAUTHORIZED,
                ERROR_CODES.INVALID_TOKEN,
                true,
            );
        }
        if (expectedType && decoded.tokenType !== expectedType) {
            throw new AppError(
                "Invalid token type",
                HTTP_STATUS.UNAUTHORIZED,
                ERROR_CODES.INVALID_TOKEN,
                true,
            );
        }
        return decoded;
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw error;
    }
};

/**
 * Extract bearer token from authorization header.
 * @param {string | string[] | undefined} headerValue
 * @returns {string | null}
 */
export const extractBearerToken = (headerValue) => {
    if (!headerValue) {
        return null;
    }
    const value = Array.isArray(headerValue) ? headerValue[0] : headerValue;
    if (typeof value !== "string") {
        return null;
    }
    const match = value.match(/^Bearer\s+(.+)$/i);
    return match ? match[1].trim() : null;
};

export default Object.freeze({
    signAccessToken,
    signRefreshToken,
    verifyToken,
    extractBearerToken,
});
