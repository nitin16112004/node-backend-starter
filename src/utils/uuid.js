/**
 * UUID utilities.
 * @module utils/uuid
 */

import { randomUUID } from "node:crypto";

const UUID_V4_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Generate a UUID v4 string.
 * @returns {string}
 */
export const uuidv4 = () => randomUUID();

/**
 * Validate a UUID v4 string.
 * @param {string} value
 * @returns {boolean}
 */
export const isUuid = (value) =>
    typeof value === "string" && UUID_V4_REGEX.test(value);

export const uuid = Object.freeze({
    uuidv4,
    isUuid,
});

export default uuid;
