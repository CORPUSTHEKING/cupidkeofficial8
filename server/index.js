'use strict';

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const routes = require('./routes');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json());
app.use('/', routes);

io.on('connection', (socket) => {
  console.log('[socket] client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('[socket] client disconnected:', socket.id);
  });
});

const port = Number(process.env.PORT) || 3000;

server.listen(port, () => {
  console.log('[server] listening on port', port);
});
