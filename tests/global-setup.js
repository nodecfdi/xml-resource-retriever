// global-setup.js
const { setup: setupDevServer } = require('jest-dev-server');

module.exports = async function globalSetup() {
    await setupDevServer({
        command: 'yarn serve --no-warnings',
        launchTimeout: 50000,
    });
    // Your global setup
};
