/**
 * Utility helpers with safe defaults.
 * @module utils/helpers
 */

/**
 * Check if a value is a plain object.
 * @param {unknown} value
 * @returns {boolean}
 */
export const isObject = (value) =>
    Object.prototype.toString.call(value) === "[object Object]";

/**
 * Deep freeze an object or array.
 * @template T
 * @param {T} value
 * @returns {Readonly<T>}
 */
export const deepFreeze = (value) => {
    if (Array.isArray(value)) {
        value.forEach((item) => deepFreeze(item));
        return Object.freeze(value);
    }
    if (isObject(value)) {
        Object.keys(value).forEach((key) => deepFreeze(value[key]));
        return Object.freeze(value);
    }
    return value;
};

/**
 * Deep clone a value safely, handling arrays, objects, maps, sets, and dates.
 * @template T
 * @param {T} value
 * @param {WeakMap<object, unknown>} [seen]
 * @returns {T}
 */
export const deepClone = (value, seen = new WeakMap()) => {
    if (value === null || typeof value !== "object") {
        return value;
    }
    if (value instanceof Date) {
        return new Date(value.getTime());
    }
    if (value instanceof Map) {
        const map = new Map();
        if (seen.has(value)) {
            return /** @type {T} */ (seen.get(value));
        }
        seen.set(value, map);
        for (const [key, val] of value.entries()) {
            map.set(key, deepClone(val, seen));
        }
        return /** @type {T} */ (map);
    }
    if (value instanceof Set) {
        const set = new Set();
        if (seen.has(value)) {
            return /** @type {T} */ (seen.get(value));
        }
        seen.set(value, set);
        for (const item of value.values()) {
            set.add(deepClone(item, seen));
        }
        return /** @type {T} */ (set);
    }
    if (Array.isArray(value)) {
        if (seen.has(value)) {
            return /** @type {T} */ (seen.get(value));
        }
        const cloned = [];
        seen.set(value, cloned);
        for (const item of value) {
            cloned.push(deepClone(item, seen));
        }
        return /** @type {T} */ (cloned);
    }
    if (isObject(value)) {
        if (seen.has(value)) {
            return /** @type {T} */ (seen.get(value));
        }
        const cloned = {};
        seen.set(value, cloned);
        for (const [key, val] of Object.entries(value)) {
            cloned[key] = deepClone(val, seen);
        }
        return /** @type {T} */ (cloned);
    }
    return value;
};

const mergeTwo = (target, source) => {
    if (!isObject(source) && !Array.isArray(source)) {
        return deepClone(source);
    }
    if (Array.isArray(source)) {
        return source.map((item) => deepClone(item));
    }
    const output = isObject(target) ? deepClone(target) : {};
    for (const [key, value] of Object.entries(source)) {
        const existing = output[key];
        if (isObject(value) && isObject(existing)) {
            output[key] = mergeTwo(existing, value);
        } else if (Array.isArray(value)) {
            output[key] = value.map((item) => deepClone(item));
        } else {
            output[key] = deepClone(value);
        }
    }
    return output;
};

/**
 * Deep merge objects without mutation. Arrays are replaced by default.
 * @param  {...unknown} sources
 * @returns {object}
 */
export const deepMerge = (...sources) => {
  if (sources.length === 0) {
    return {};
  }
  return sources.reduce((acc, source) => {
    if (source === null || source === undefined) {
      return acc;
    }
    return mergeTwo(acc, source);
  }, {});
};

/**
 * Pick a subset of keys from an object.
 * @param {Record<string, unknown>} obj
 * @param {string[]} keys
 * @returns {Record<string, unknown>}
 */
export const pick = (obj, keys) => {
    if (!isObject(obj) || !Array.isArray(keys)) {
        return {};
    }
    const output = {};
    for (const key of keys) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            output[key] = obj[key];
        }
    }
    return output;
};

/**
 * Omit a subset of keys from an object.
 * @param {Record<string, unknown>} obj
 * @param {string[]} keys
 * @returns {Record<string, unknown>}
 */
export const omit = (obj, keys) => {
    if (!isObject(obj)) {
        return {};
    }
    const output = {};
    const omitKeys = new Set(Array.isArray(keys) ? keys : []);
    for (const [key, value] of Object.entries(obj)) {
        if (!omitKeys.has(key)) {
            output[key] = value;
        }
    }
    return output;
};

/**
 * Sleep for the provided milliseconds.
 * @param {number} ms
 * @returns {Promise<void>}
 */
export const sleep = (ms) => {
    const delay = Number(ms);
    if (!Number.isFinite(delay) || delay < 0) {
        return Promise.reject(
            new TypeError("sleep expects a non-negative finite number"),
        );
    }
    return new Promise((resolve) => {
        setTimeout(resolve, delay);
    });
};

/**
 * Parse JSON safely with fallback.
 * @template T
 * @param {string} value
 * @param {T} [fallback=null]
 * @returns {T | null}
 */
export const safeJSONParse = (value, fallback = null) => {
    if (typeof value !== "string") {
        return fallback;
    }
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
};

export const helpers = Object.freeze({
    isObject,
    deepFreeze,
    deepClone,
    deepMerge,
    pick,
    omit,
    sleep,
    safeJSONParse,
});

export default helpers;
