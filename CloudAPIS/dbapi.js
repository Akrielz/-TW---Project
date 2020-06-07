const {Server} = require('./Server');

let server = new Server('db');
server.start().then();
