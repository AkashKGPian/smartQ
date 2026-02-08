/**
 * helpers/socket.js
 *
 * Singleton holder for the Socket.IO server instance.
 *
 * WHY a separate file?
 *   server.js creates the `io` instance and calls init(io).
 *   Controllers then call getIO() to emit events.
 *   This avoids circular dependencies — no controller imports server.js.
 *
 * USAGE:
 *   In server.js   →  require('./helpers/socket').init(io)
 *   In controllers  →  const { getIO } = require('../helpers/socket');
 *                        getIO().to(roomName).emit('event', data);
 */

let io = null;

function init(socketIOInstance) {
  io = socketIOInstance;
  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialised — call init() first in server.js');
  }
  return io;
}

module.exports = { init, getIO };
