/**
 * Wrap async Express handlers to forward errors.
 * @module errors/asyncHandler
 */

/**
 * @param {Function} fn
 * @returns {Function}
 */
export const asyncHandler = (fn) => {
    if (typeof fn !== "function") {
        throw new TypeError("asyncHandler expects a function");
    }
    return (req, res, next) => {
        try {
            Promise.resolve(fn(req, res, next)).catch(next);
        } catch (error) {
            next(error);
        }
    };
};

export default asyncHandler;
