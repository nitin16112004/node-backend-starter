import { afterEach, beforeEach, describe, expect, jest, test } from "@jest/globals";
import errorHandlerDefault, {
    errorHandler,
    formatError,
} from "../../../src/errors/errorHandler.js";
import { AppError } from "../../../src/errors/AppError.js";
import { ERROR_CODES, HTTP_STATUS } from "../../../src/constants/index.js";

const createRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    headersSent: false,
});

describe("errors/errorHandler exports", () => {
    test("exports errorHandler and formatError", () => {
        expect(errorHandlerDefault).toBe(errorHandler);
        expect(typeof errorHandler).toBe("function");
        expect(typeof formatError).toBe("function");
    });
});

describe("errorHandler", () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
        process.env.NODE_ENV = "test";
    });

    afterEach(() => {
        process.env.NODE_ENV = originalEnv;
        jest.restoreAllMocks();
    });

    test("throws when next is invalid", () => {
        expect(() => errorHandler(new Error("x"), {}, {}, null)).toThrow(TypeError);
    });

    test("calls next when headers are sent", () => {
        const res = createRes();
        res.headersSent = true;
        const next = jest.fn();
        const err = new Error("boom");

        errorHandler(err, {}, res, next);

        expect(next).toHaveBeenCalledWith(err);
        expect(res.status).not.toHaveBeenCalled();
    });

    test("handles AppError instances", () => {
        const res = createRes();
        const next = jest.fn();
        const err = new AppError("Bad", 400, "BAD");

        errorHandler(err, {}, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        const payload = res.json.mock.calls[0][0];
        expect(payload).toMatchObject({
            success: false,
            message: "Bad",
            code: "BAD",
            statusCode: 400,
        });
        expect(payload.stack).toEqual(expect.any(String));
    });

    test("handles jwt errors", () => {
        const res = createRes();
        const next = jest.fn();
        const err = new Error("expired");
        err.name = "TokenExpiredError";

        errorHandler(err, {}, res, next);
        const payload = res.json.mock.calls[0][0];

        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
        expect(payload.code).toBe(ERROR_CODES.TOKEN_EXPIRED);
    });

    test("handles not-before jwt errors", () => {
        const res = createRes();
        const next = jest.fn();
        const err = new Error("nbf");
        err.name = "NotBeforeError";

        errorHandler(err, {}, res, next);
        const payload = res.json.mock.calls[0][0];

        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
        expect(payload.code).toBe(ERROR_CODES.INVALID_TOKEN);
    });

    test("handles validation errors from Joi", () => {
        const res = createRes();
        const next = jest.fn();
        const err = {
            isJoi: true,
            details: [{ message: "invalid", path: ["a"], type: "any" }],
        };

        errorHandler(err, {}, res, next);
        const payload = res.json.mock.calls[0][0];

        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(payload.code).toBe(ERROR_CODES.VALIDATION_ERROR);
        expect(payload.details).toEqual({
            details: [{ message: "invalid", path: ["a"], type: "any" }],
        });
    });

    test("handles validation errors from Zod", () => {
        const res = createRes();
        const next = jest.fn();
        const err = {
            name: "ZodError",
            errors: [{ message: "invalid", path: ["a"], code: "invalid_type" }],
        };

        errorHandler(err, {}, res, next);
        const payload = res.json.mock.calls[0][0];

        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(payload.details).toEqual({
            details: [
                {
                    message: "invalid",
                    path: ["a"],
                    code: "invalid_type",
                },
            ],
        });
    });

    test("handles validation errors from Zod issues", () => {
        const res = createRes();
        const next = jest.fn();
        const err = {
            name: "ZodError",
            issues: [{ message: "bad", path: ["b"], code: "too_small" }],
        };

        errorHandler(err, {}, res, next);
        const payload = res.json.mock.calls[0][0];

        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(payload.details).toEqual({
            details: [
                {
                    message: "bad",
                    path: ["b"],
                    code: "too_small",
                },
            ],
        });
    });

    test("handles malformed JSON errors", () => {
        const res = createRes();
        const next = jest.fn();
        const err = new SyntaxError("bad json");
        err.status = 400;
        err.body = "{}";

        errorHandler(err, {}, res, next);
        const payload = res.json.mock.calls[0][0];

        expect(payload.message).toBe("Malformed JSON payload");
        expect(payload.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    });

    test("handles CSRF errors", () => {
        const res = createRes();
        const next = jest.fn();
        const err = { code: "EBADCSRFTOKEN" };

        errorHandler(err, {}, res, next);
        const payload = res.json.mock.calls[0][0];

        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.FORBIDDEN);
        expect(payload.code).toBe(ERROR_CODES.CSRF_ERROR);
    });

    test("handles unknown errors", () => {
        const res = createRes();
        const next = jest.fn();
        const err = new Error("Unknown");

        errorHandler(err, {}, res, next);
        const payload = res.json.mock.calls[0][0];

        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(payload.code).toBe(ERROR_CODES.INTERNAL_ERROR);
    });

    test("handles missing error messages", () => {
        const res = createRes();
        const next = jest.fn();
        const err = { message: "   " };

        errorHandler(err, {}, res, next);
        const payload = res.json.mock.calls[0][0];

        expect(payload.message).toBe("Unexpected error");
        expect(payload.code).toBe(ERROR_CODES.INTERNAL_ERROR);
    });

    test("omits stack trace in production", () => {
        process.env.NODE_ENV = "production";
        const res = createRes();
        const next = jest.fn();
        const err = new AppError("Bad", 400, "BAD");

        errorHandler(err, {}, res, next);
        const payload = res.json.mock.calls[0][0];
        expect(payload.stack).toBeUndefined();
    });

    test("throws when response object is invalid", () => {
        expect(() =>
            errorHandler(new Error("x"), {}, { status: null }, jest.fn()),
        ).toThrow(TypeError);
    });
});

describe("formatError", () => {
    test("normalizes non-AppError inputs", () => {
        const formatted = formatError(new Error("Boom"));
        expect(formatted.name).toBe("AppError");
        expect(formatted.code).toBe(ERROR_CODES.INTERNAL_ERROR);
    });

    test("preserves AppError details", () => {
        const err = new AppError("Bad", 400, "BAD", true, { reason: "invalid" });
        const formatted = formatError(err);
        expect(formatted.details).toEqual({ reason: "invalid" });
    });

    test("preserves non-object details", () => {
        const err = new AppError("Bad", 400, "BAD", true, "detail");
        const formatted = formatError(err);
        expect(formatted.details).toBe("detail");
    });
});
