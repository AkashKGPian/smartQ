const Queue = require('../models/Queue');
const Token = require('../models/Token');

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * GET /api/staff/dashboard
 */
async function staffDashboard(req, res) {
  try {
    const today = getTodayDate();

    const queues = await Queue.find({ date: today }).populate('storeId').lean();

    const data = [];

    for (const queue of queues) {
      const waitingCount = await Token.countDocuments({
        queueId: queue._id,
        status: 'WAITING',
      });

      const currentToken = await Token.findOne({
        queueId: queue._id,
        status: 'CALLED',
      }).sort({ calledAt: -1 });

      data.push({
        queue,
        waitingCount,
        currentToken,
      });
    }

    if (req.headers.accept?.includes('text/html')) {
      return res.render('staff-dashboard', { queues: data });
    }

    res.json(data);
  } catch (err) {
    console.error('staffDashboard error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

/**
 * POST /api/staff/queue/:queueId/pause
 */
async function pauseQueue(req, res) {
  try {
    const queue = await Queue.findById(req.params.queueId);
    if (!queue) return res.status(404).json({ error: 'Queue not found' });

    queue.isPaused = true;
    await queue.save();

    // If browser request, redirect back to dashboard
    if (req.headers.accept?.includes('text/html')) {
      return res.redirect('/api/staff/dashboard');
    }
    res.json({ message: 'Queue paused' });
  } catch (err) {
    console.error('pauseQueue error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

/**
 * POST /api/staff/queue/:queueId/resume
 */
async function resumeQueue(req, res) {
  try {
    const queue = await Queue.findById(req.params.queueId);
    if (!queue) return res.status(404).json({ error: 'Queue not found' });

    queue.isPaused = false;
    await queue.save();

    // If browser request, redirect back to dashboard
    if (req.headers.accept?.includes('text/html')) {
      return res.redirect('/api/staff/dashboard');
    }
    res.json({ message: 'Queue resumed' });
  } catch (err) {
    console.error('resumeQueue error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  staffDashboard,
  pauseQueue,
  resumeQueue,
};
