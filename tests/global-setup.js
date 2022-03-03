// global-setup.js
const { setup: setupDevServer } = require('jest-dev-server');

module.exports = async function globalSetup() {
    await setupDevServer({
        command: `node tests/server-static.js`,
        launchTimeout: 50000,
    });
};
