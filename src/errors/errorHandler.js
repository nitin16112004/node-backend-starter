/**
 * Centralized Express error handler.
 * @module errors/errorHandler
 */

import { AppError } from "./AppError.js";
import { ERROR_CODES, HTTP_STATUS } from "../constants/index.js";
import { isObject } from "../utils/helpers.js";

const normalizeJwtError = (error) => {
    if (!error || typeof error !== "object") {
        return null;
    }
    if (error.name === "TokenExpiredError") {
        return new AppError(
            "Token expired",
            HTTP_STATUS.UNAUTHORIZED,
            ERROR_CODES.TOKEN_EXPIRED,
            true,
        );
    }
    if (error.name === "JsonWebTokenError") {
        return new AppError(
            "Invalid token",
            HTTP_STATUS.UNAUTHORIZED,
            ERROR_CODES.INVALID_TOKEN,
            true,
        );
    }
    if (error.name === "NotBeforeError") {
        return new AppError(
            "Token not active",
            HTTP_STATUS.UNAUTHORIZED,
            ERROR_CODES.INVALID_TOKEN,
            true,
        );
    }
    return null;
};

const normalizeValidationError = (error) => {
    if (!error || typeof error !== "object") {
        return null;
    }
    if (error.isJoi) {
        return new AppError(
            "Validation failed",
            HTTP_STATUS.BAD_REQUEST,
            ERROR_CODES.VALIDATION_ERROR,
            true,
            {
                details: error.details?.map((detail) => ({
                    message: detail.message,
                    path: detail.path,
                    type: detail.type,
                })),
            },
        );
    }
  const zodIssues = error?.issues || error?.errors;
  if (error.name === "ZodError" && Array.isArray(zodIssues)) {
    return new AppError(
      "Validation failed",
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.VALIDATION_ERROR,
      true,
      {
        details: zodIssues.map((detail) => ({
          message: detail.message,
          path: detail.path,
          code: detail.code,
        })),
      },
    );
  }
    return null;
};

const normalizeSyntaxError = (error) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return new AppError(
      "Malformed JSON payload",
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.VALIDATION_ERROR,
      true,
    );
  }
  if (error && error.code === "EBADCSRFTOKEN") {
    return new AppError(
      "Invalid CSRF token",
      HTTP_STATUS.FORBIDDEN,
      ERROR_CODES.CSRF_ERROR,
      true,
    );
  }
  return null;
};

const normalizeError = (error) => {
    if (error instanceof AppError) {
        return error;
    }
    const jwtError = normalizeJwtError(error);
    if (jwtError) {
        return jwtError;
    }
    const validationError = normalizeValidationError(error);
    if (validationError) {
        return validationError;
    }
    const syntaxError = normalizeSyntaxError(error);
    if (syntaxError) {
        return syntaxError;
    }
    const message =
        typeof error?.message === "string" && error.message.trim() !== ""
            ? error.message
            : "Unexpected error";
    return new AppError(
        message,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.INTERNAL_ERROR,
        false,
    );
};

const buildErrorResponse = (error, includeStack) => {
    const response = {
        success: false,
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        details: error.details ?? null,
    };
    if (includeStack && error.stack) {
        response.stack = error.stack;
    }
    return response;
};

/**
 * Express error handler middleware.
 * @param {Error} err
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const errorHandler = (err, _req, res, next) => {
  if (typeof next !== "function") {
    throw new TypeError("errorHandler expects Express middleware signature");
  }
  if (res && res.headersSent) {
    return next(err);
  }
  const normalized = normalizeError(err);
    const includeStack = process.env.NODE_ENV !== "production";
    const payload = buildErrorResponse(normalized, includeStack);

    if (!res || typeof res.status !== "function" || typeof res.json !== "function") {
        throw new TypeError("errorHandler requires a valid Express response object");
    }
    res.status(normalized.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        payload,
    );
};

export const formatError = (error) => {
    const normalized = normalizeError(error);
    return {
        ...normalized.toJSON(),
        details: isObject(normalized.details) ? normalized.details : normalized.details,
    };
};

export default errorHandler;
