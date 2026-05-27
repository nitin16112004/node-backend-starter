/**
 * Security middleware exports.
 * @module security
 */

import { createRateLimiter } from "./rateLimiter.js";
import { createHelmet } from "./helmet.js";
import { createCors } from "./cors.js";
import { createCsrf } from "./csrf.js";
import { createXssClean } from "./xss.js";
import { securityHeaders } from "./headers.js";
import { ipFilter } from "./ipFilter.js";
import { requestSanitizer } from "./requestSanitizer.js";

export { createRateLimiter } from "./rateLimiter.js";
export { createHelmet } from "./helmet.js";
export { createCors } from "./cors.js";
export { createCsrf } from "./csrf.js";
export { createXssClean } from "./xss.js";
export { securityHeaders } from "./headers.js";
export { ipFilter } from "./ipFilter.js";
export { requestSanitizer } from "./requestSanitizer.js";

export default Object.freeze({
  createRateLimiter,
  createHelmet,
  createCors,
  createCsrf,
  createXssClean,
  securityHeaders,
  ipFilter,
  requestSanitizer,
});
