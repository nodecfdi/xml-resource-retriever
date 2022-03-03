// global-teardown.js
module.exports = async function globalTeardown() {
    global.server.close();
};
