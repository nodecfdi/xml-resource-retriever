// global-setup.js
const server = require('./server-static');

module.exports = async function globalSetup() {
    global.server = server.server;
    // Your global setup
};
