/**
 * CORS middleware.
 * @module security/cors
 */

import cors from "cors";

/**
 * Create CORS middleware.
 * @param {object} [options]
 * @returns {import("express").RequestHandler}
 */
export const createCors = (options = {}) => {
    if (options !== undefined && typeof options !== "object") {
        throw new TypeError("cors options must be an object");
    }
    return cors(options);
};

export default createCors;
