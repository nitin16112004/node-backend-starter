/**
 * CSRF middleware.
 * @module security/csrf
 */

import csurf from "csurf";

/**
 * Create CSRF protection middleware.
 * @param {object} [options]
 * @param {boolean} [options.cookie=true]
 * @returns {import("express").RequestHandler}
 */
export const createCsrf = (options = {}) => {
    if (options !== undefined && typeof options !== "object") {
        throw new TypeError("csrf options must be an object");
    }
    const { cookie = true, ...rest } = options;
    return csurf({ cookie, ...rest });
};

export default createCsrf;
