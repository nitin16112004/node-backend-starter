/**
 * Reusable constants.
 * @module constants
 */

export const HTTP_STATUS = Object.freeze({
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
});

export const ERROR_CODES = Object.freeze({
    VALIDATION_ERROR: "VALIDATION_ERROR",
    UNAUTHORIZED: "UNAUTHORIZED",
    FORBIDDEN: "FORBIDDEN",
    NOT_FOUND: "NOT_FOUND",
    RATE_LIMITED: "RATE_LIMITED",
    INTERNAL_ERROR: "INTERNAL_ERROR",
    INVALID_TOKEN: "INVALID_TOKEN",
    TOKEN_EXPIRED: "TOKEN_EXPIRED",
    CSRF_ERROR: "CSRF_ERROR",
    IP_BLOCKED: "IP_BLOCKED",
});

export const TOKEN_TYPES = Object.freeze({
    ACCESS: "access",
    REFRESH: "refresh",
});

export const LOG_LEVELS = Object.freeze(["error", "warn", "info", "debug"]);

export const DEFAULT_HEADERS = Object.freeze({
    AUTHORIZATION: "authorization",
    REQUEST_ID: "x-request-id",
});

export const ROLES = Object.freeze({
    ADMIN: "admin",
    USER: "user",
});

export default Object.freeze({
    HTTP_STATUS,
    ERROR_CODES,
    TOKEN_TYPES,
    LOG_LEVELS,
    DEFAULT_HEADERS,
    ROLES,
});
