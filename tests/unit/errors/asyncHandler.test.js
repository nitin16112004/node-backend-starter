import { describe, expect, jest, test } from "@jest/globals";
import asyncHandlerDefault, {
    asyncHandler,
} from "../../../src/errors/asyncHandler.js";

describe("asyncHandler", () => {
    test("throws when handler is not a function", () => {
        expect(() => asyncHandler()).toThrow(TypeError);
    });

    test("forwards async errors to next", async () => {
        const error = new Error("Failure");
        const handler = asyncHandler(async () => {
            throw error;
        });
        const next = jest.fn();

        await handler({}, {}, next);

        expect(next).toHaveBeenCalledWith(error);
    });

    test("forwards sync errors to next", async () => {
        const error = new Error("Sync failure");
        const handler = asyncHandler(() => {
            throw error;
        });
        const next = jest.fn();

        await handler({}, {}, next);

        expect(next).toHaveBeenCalledWith(error);
    });

    test("default export equals asyncHandler", () => {
        expect(asyncHandlerDefault).toBe(asyncHandler);
    });
});
