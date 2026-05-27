/**
 * Request validation middleware.
 * @module validation/validate
 */

import { AppError } from "../errors/AppError.js";
import { ERROR_CODES, HTTP_STATUS } from "../constants/index.js";

const formatIssues = (issues) =>
    issues.map((issue) => ({
        message: issue.message,
        path: issue.path,
        code: issue.code,
    }));

/**
 * Create request validation middleware.
 * @param {object} schemas
 * @param {import("zod").ZodSchema} [schemas.body]
 * @param {import("zod").ZodSchema} [schemas.query]
 * @param {import("zod").ZodSchema} [schemas.params]
 * @returns {import("express").RequestHandler}
 */
export const validate = (schemas = {}) => {
    if (!schemas || typeof schemas !== "object" || Array.isArray(schemas)) {
        throw new TypeError("validate expects a schema object");
    }

    const { body, query, params } = schemas;

  return (req, _res, next) => {
        const errors = [];

        if (body) {
            const result = body.safeParse(req.body);
            if (!result.success) {
                errors.push({ location: "body", issues: formatIssues(result.error.issues) });
            } else {
                req.body = result.data;
            }
        }

        if (query) {
            const result = query.safeParse(req.query);
            if (!result.success) {
                errors.push({ location: "query", issues: formatIssues(result.error.issues) });
            } else {
                req.query = result.data;
            }
        }

        if (params) {
            const result = params.safeParse(req.params);
            if (!result.success) {
                errors.push({ location: "params", issues: formatIssues(result.error.issues) });
            } else {
                req.params = result.data;
            }
        }

        if (errors.length > 0) {
            return next(
                new AppError(
                    "Validation failed",
                    HTTP_STATUS.BAD_REQUEST,
                    ERROR_CODES.VALIDATION_ERROR,
                    true,
                    { errors },
                ),
            );
        }

        return next();
    };
};

export default validate;
