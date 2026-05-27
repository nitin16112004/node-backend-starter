/**
 * Plugin exports.
 * @module plugins
 */

import { PluginSystem } from "./system.js";

/**
 * Create a new plugin system instance.
 * @returns {PluginSystem}
 */
export const createPluginSystem = () => new PluginSystem();

export { PluginSystem };

export default Object.freeze({
  createPluginSystem,
  PluginSystem,
});
