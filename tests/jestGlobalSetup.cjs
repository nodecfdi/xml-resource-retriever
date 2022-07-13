// eslint-disable-next-line @typescript-eslint/no-var-requires
const { setup: setupDevServer } = require('jest-dev-server');

module.exports = async function globalSetup() {
    await setupDevServer({
        command: `node tests/server-static.cjs`,
        launchTimeout: 50000
    });
};
