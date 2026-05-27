/**
 * Plugin system for backend-kit.
 * @module plugins/system
 */

import { isObject } from "../utils/helpers.js";

const normalizeOrder = (order) => {
    const value = Number(order);
    return Number.isFinite(value) ? value : 0;
};

export class PluginSystem {
    constructor() {
        this._plugins = new Map();
    }

    /**
     * Register a plugin.
     * @param {string} name
     * @param {(context: object, meta: object) => Promise<void> | void} handler
     * @param {object} [options]
     * @param {number} [options.order=0]
     * @param {object} [options.meta]
     * @returns {PluginSystem}
     */
    register(name, handler, options = {}) {
        if (typeof name !== "string" || name.trim() === "") {
            throw new TypeError("Plugin name must be a non-empty string");
        }
        if (typeof handler !== "function") {
            throw new TypeError("Plugin handler must be a function");
        }
        if (this._plugins.has(name)) {
            throw new Error(`Plugin "${name}" is already registered`);
        }

        const plugin = {
            name,
            handler,
            order: normalizeOrder(options.order),
            meta: isObject(options.meta) ? options.meta : {},
            registeredAt: new Date().toISOString(),
        };

        this._plugins.set(name, plugin);
        return this;
    }

    /**
     * Execute plugins in order.
     * @param {object} [context]
     * @returns {Promise<object>}
     */
    async execute(context = {}) {
        if (!isObject(context)) {
            throw new TypeError("Plugin context must be an object");
        }
        const plugins = Array.from(this._plugins.values()).sort(
            (a, b) => a.order - b.order,
        );
        for (const plugin of plugins) {
            await plugin.handler(context, plugin.meta);
        }
        return context;
    }

    /**
     * Get registered plugins metadata.
     * @returns {Array<object>}
     */
    list() {
        return Array.from(this._plugins.values()).map((plugin) => ({
            name: plugin.name,
            order: plugin.order,
            meta: plugin.meta,
            registeredAt: plugin.registeredAt,
        }));
    }

    /**
     * Clear all plugins.
     */
    clear() {
        this._plugins.clear();
    }
}

export default PluginSystem;
