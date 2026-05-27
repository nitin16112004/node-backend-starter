/**
 * Custom security headers middleware.
 * @module security/headers
 */

const DEFAULT_HEADERS = Object.freeze({
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "X-XSS-Protection": "0",
});

/**
 * Apply security headers.
 * @param {object} [options]
 * @param {Record<string, string>} [options.headers]
 * @returns {import("express").RequestHandler}
 */
export const securityHeaders = (options = {}) => {
  const customHeaders =
    options &&
    typeof options === "object" &&
    options.headers &&
    typeof options.headers === "object"
      ? options.headers
      : {};

  return (_req, res, next) => {
    const headers = { ...DEFAULT_HEADERS, ...customHeaders };
    for (const [key, value] of Object.entries(headers)) {
      if (typeof value === "string" && value.trim() !== "") {
        res.setHeader(key, value);
      }
    }
    next();
  };
};

export default securityHeaders;
