/**
 * helpers/autoSkip.js
 *
 * Auto-skip logic for the SmartQ queue system.
 *
 * WHAT IT DOES:
 *   Every 30 seconds, looks for tokens that:
 *     1. Have status = 'CALLED'
 *     2. Were called more than 3 minutes ago (grace period)
 *     3. Belong to a queue that is NOT paused
 *   For each one it finds, it sets status → 'MISSED' and emits
 *   a socket event so dashboards update in real time.
 *
 * WHY node-cron?
 *   setInterval works fine but node-cron gives us a cron expression that's
 *   easy to read and change later (e.g. run every minute in production).
 */

const cron = require('node-cron');
const Token = require('../models/Token');
const Queue = require('../models/Queue');
const { getIO } = require('./socket');

const GRACE_PERIOD_MS = 3 * 60 * 1000; // 3 minutes

function startAutoSkip() {
  // Cron: "*/30 * * * * *" = every 30 seconds
  cron.schedule('*/30 * * * * *', async () => {
    try {
      const cutoff = new Date(Date.now() - GRACE_PERIOD_MS);

      // Find all CALLED tokens whose calledAt is older than the grace period
      const expiredTokens = await Token.find({
        status: 'CALLED',
        calledAt: { $lt: cutoff },
      });

      for (const token of expiredTokens) {
        // Check if the queue is paused — don't auto-skip in a paused queue
        const queue = await Queue.findById(token.queueId);
        if (queue && queue.isPaused) continue;

        token.status = 'MISSED';
        await token.save();

        console.log(`[AutoSkip] Token #${token.number} (ID: ${token._id}) marked MISSED`);

        // Emit socket events so dashboards refresh
        try {
          const io = getIO();
          const payload = {
            tokenId: token._id,
            tokenNumber: token.number,
            queueId: token.queueId,
            status: 'MISSED',
          };
          io.to(`user:${token.patientId}`).emit('token:completed', payload);
          io.to(`queue:${token.queueId}`).emit('token:completed', payload);
        } catch (_) { /* socket not ready — non-fatal */ }
      }
    } catch (err) {
      console.error('[AutoSkip] Error:', err.message);
    }
  });

  console.log('[AutoSkip] Scheduler started — checking every 30s, grace period 3 min');
}

module.exports = { startAutoSkip };
