import { describe, expect, jest, test } from "@jest/globals";
import { z } from "zod";
import { validate } from "../../../src/validation/validate.js";
import { AppError } from "../../../src/errors/AppError.js";
import { ERROR_CODES, HTTP_STATUS } from "../../../src/constants/index.js";

const createRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
});

describe("validation/validate", () => {
    test("throws when schemas are invalid", () => {
        expect(() => validate(null)).toThrow(TypeError);
        expect(() => validate([])).toThrow(TypeError);
    });

    test("allows empty schema objects", () => {
        const middleware = validate({});
        const req = { body: { a: 1 } };
        const res = createRes();
        const next = jest.fn();

        middleware(req, res, next);

        expect(next).toHaveBeenCalledWith();
        expect(req.body).toEqual({ a: 1 });
    });

    test("validates body, query, and params", () => {
        const middleware = validate({
            body: z.object({ name: z.string().min(1) }),
            query: z.object({ page: z.coerce.number().int().positive() }),
            params: z.object({ id: z.string().min(1) }),
        });

        const req = {
            body: { name: "kit" },
            query: { page: "2" },
            params: { id: "1" },
        };
        const res = createRes();
        const next = jest.fn();

        middleware(req, res, next);

        expect(req.query.page).toBe(2);
        expect(next).toHaveBeenCalledWith();
    });

    test("validates partial schemas and updates params", () => {
        const middleware = validate({
            params: z.object({ id: z.string().min(1) }),
        });

        const req = { params: { id: "123" } };
        const res = createRes();
        const next = jest.fn();

        middleware(req, res, next);

        expect(req.params).toEqual({ id: "123" });
        expect(next).toHaveBeenCalledWith();
    });

    test("returns AppError for missing query data", () => {
        const middleware = validate({
            query: z.object({ page: z.coerce.number().int().positive() }),
        });

        const req = {};
        const res = createRes();
        const next = jest.fn();

        middleware(req, res, next);

        const error = next.mock.calls[0][0];
        expect(error).toBeInstanceOf(AppError);
        expect(error.details.errors[0].location).toBe("query");
    });

    test("collects multiple validation errors", () => {
        const middleware = validate({
            body: z.object({ name: z.string().min(2) }),
            params: z.object({ id: z.string().min(3) }),
        });

        const req = { body: { name: "a" }, params: { id: "1" } };
        const res = createRes();
        const next = jest.fn();

        middleware(req, res, next);

        const error = next.mock.calls[0][0];
        expect(error).toBeInstanceOf(AppError);
        expect(error.details.errors).toHaveLength(2);
    });

    test("returns AppError for validation failures", () => {
        const middleware = validate({
            body: z.object({ name: z.string().min(2) }),
        });

        const req = { body: { name: "a" } };
        const res = createRes();
        const next = jest.fn();

        middleware(req, res, next);

        const error = next.mock.calls[0][0];
        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
        expect(error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
        expect(error.details.errors[0].location).toBe("body");
    });
});
