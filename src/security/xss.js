/**
 * XSS protection middleware.
 * @module security/xss
 */

import xssClean from "xss-clean";

/**
 * Create XSS clean middleware.
 * @param {object} [options]
 * @returns {import("express").RequestHandler}
 */
export const createXssClean = (options = {}) => {
    if (options !== undefined && typeof options !== "object") {
        throw new TypeError("xss options must be an object");
    }
    return xssClean(options);
};

export default createXssClean;
