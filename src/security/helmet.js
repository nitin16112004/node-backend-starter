/**
 * Helmet middleware.
 * @module security/helmet
 */

import helmet from "helmet";

/**
 * Create helmet middleware.
 * @param {object} [options]
 * @returns {import("express").RequestHandler}
 */
export const createHelmet = (options = {}) => {
    if (options !== undefined && typeof options !== "object") {
        throw new TypeError("helmet options must be an object");
    }
    return helmet(options);
};

export default createHelmet;
