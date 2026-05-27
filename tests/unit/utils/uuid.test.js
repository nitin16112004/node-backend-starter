import { describe, expect, test } from "@jest/globals";
import uuid, { isUuid, uuidv4 } from "../../../src/utils/uuid.js";

describe("utils/uuid exports", () => {
    test("exports expected functions and default object", () => {
        expect(typeof uuidv4).toBe("function");
        expect(typeof isUuid).toBe("function");
        expect(uuid).toEqual({ uuidv4, isUuid });
        expect(Object.isFrozen(uuid)).toBe(true);
    });
});

describe("uuidv4", () => {
    test("returns a valid UUID v4 string", () => {
        const value = uuidv4();
        expect(typeof value).toBe("string");
        expect(isUuid(value)).toBe(true);
    });
});

describe("isUuid", () => {
    test("returns true for valid UUID v4 strings", () => {
        const value = uuidv4();
        expect(isUuid(value)).toBe(true);
    });

    test("returns false for invalid UUID strings", () => {
        expect(isUuid("not-a-uuid")).toBe(false);
        expect(isUuid("12345678-1234-1234-1234-1234567890ab")).toBe(false);
    });

    test("returns false for non-string values", () => {
        expect(isUuid(123)).toBe(false);
        expect(isUuid(null)).toBe(false);
        expect(isUuid(undefined)).toBe(false);
    });
});
