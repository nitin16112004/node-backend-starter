module.exports = {
    env: {
        node: true,
        es2022: true,
    },
    extends: ["eslint:recommended"],
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
    },
    rules: {
        "no-console": "error",
        "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
        "no-unsafe-finally": "error",
        "no-implicit-coercion": "error",
    },
};
