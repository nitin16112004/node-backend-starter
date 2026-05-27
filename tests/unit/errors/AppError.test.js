import { describe, expect, test } from "@jest/globals";
import AppErrorDefault, { AppError } from "../../../src/errors/AppError.js";
import { ERROR_CODES, HTTP_STATUS } from "../../../src/constants/index.js";

describe("AppError", () => {
    test("creates operational errors with defaults", () => {
        const error = new AppError("Failure");
        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe("AppError");
        expect(error.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(error.code).toBe(ERROR_CODES.INTERNAL_ERROR);
        expect(error.isOperational).toBe(true);
    });

    test("accepts custom status, code, and details", () => {
        const error = new AppError("Bad request", 400, "BAD", true, { field: "a" });
        expect(error.statusCode).toBe(400);
        expect(error.code).toBe("BAD");
        expect(error.details).toEqual({ field: "a" });
    });

    test("normalizes invalid status and code", () => {
        const error = new AppError("Bad", "invalid", 123);
        expect(error.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(error.code).toBe(ERROR_CODES.INTERNAL_ERROR);
    });

    test("throws when message is invalid", () => {
        expect(() => new AppError("")).toThrow(TypeError);
    });

    test("serializes to JSON", () => {
        const error = new AppError("Boom", 500, "ERR", false, { info: true });
        expect(error.toJSON()).toEqual({
            name: "AppError",
            message: "Boom",
            statusCode: 500,
            code: "ERR",
            isOperational: false,
            details: { info: true },
        });
    });

    test("default export equals AppError", () => {
        expect(AppErrorDefault).toBe(AppError);
    });
});
