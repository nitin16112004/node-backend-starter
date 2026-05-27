import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.js"],
    format: ["esm"],
    target: "node18",
    outDir: "dist",
    sourcemap: true,
    clean: true,
    splitting: false,
    dts: false,
});
