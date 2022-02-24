/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    globalSetup: './tests/global-setup.js',
    globalTeardown: './tests/global-teardown.js',
};
