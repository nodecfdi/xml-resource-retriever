const express = require('express');
const app = express();
const port = 8999;

app.use(express.static(__dirname + '/public'));
const server = app.listen(port, () => console.log(`Server listening on port: ${port}`));

module.exports = {
    server,
};
