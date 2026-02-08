require("dotenv").config();
const http = require('http');
const { Server } = require('socket.io');
const app = require("./app");
const connectDB = require("./config/db");
const { init: initSocket } = require('./helpers/socket');
const { verifyToken } = require('./helpers/jwt.helper');
const { startAutoSkip } = require('./helpers/autoSkip');

// fail fast if JWT secret is not configured
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set. Please add JWT_SECRET to your .env or environment.');
  process.exit(1);
}

const PORT = process.env.PORT || 3000;

connectDB();

// --- Create HTTP server & attach Socket.IO ---
const server = http.createServer(app);
const io = new Server(server);
initSocket(io); // store the io instance so controllers can call getIO()

/**
 * Socket.IO authentication middleware
 *
 * Reads the JWT from the browser's httpOnly cookie.
 * On success, socket.userId and socket.userRole are set for later use.
 */
io.use((socket, next) => {
  try {
    const raw = socket.handshake.headers.cookie || '';
    // Parse the cookie string manually (cookie-parser isn't available here)
    const cookies = {};
    raw.split(';').forEach(pair => {
      const [key, ...v] = pair.trim().split('=');
      if (key) cookies[key.trim()] = decodeURIComponent(v.join('='));
    });

    const token = cookies.token;
    if (!token) return next(new Error('Not authenticated'));

    const payload = verifyToken(token);
    socket.userId = payload.id;
    socket.userRole = payload.role;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

/**
 * When a client connects, automatically join them to their own room
 * so we can push targeted events (e.g. "your token was called").
 *
 * Room naming:
 *   user:<userId>   — personal events for a specific patient/staff
 *   queue:<queueId> — broadcast for everyone watching a queue
 */
io.on('connection', (socket) => {
  // Every connected user joins their personal room
  socket.join(`user:${socket.userId}`);

  // Clients can join a specific queue's room to watch live updates
  socket.on('watch:queue', (queueId) => {
    socket.join(`queue:${queueId}`);
  });

  // Clients can leave a queue room
  socket.on('unwatch:queue', (queueId) => {
    socket.leave(`queue:${queueId}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startAutoSkip(); // start the auto-skip cron job
});
