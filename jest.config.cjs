module.exports = {
    testEnvironment: "node",

    transform: {},

    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
        "^csurf$": "<rootDir>/tests/setup/mocks/csurf.js",
        "^xss-clean$": "<rootDir>/tests/setup/mocks/xss-clean.js",
    },

    testMatch: ["**/tests/**/*.test.js"],

    setupFilesAfterEnv: [
        "<rootDir>/tests/setup/jest.setup.js",
    ],

    collectCoverageFrom: [
        "src/**/*.js",
        "!src/index.js",
    ],

    clearMocks: true,

    verbose: true,
};
