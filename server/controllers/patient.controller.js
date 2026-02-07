const Token = require('../models/Token');
const Store = require('../models/Store');
const Queue = require('../models/Queue');

/**
 * GET /api/patient/dashboard
 *
 * Fetches two things for the logged-in patient:
 *  1. activeTokens  — tokens with status WAITING or CALLED (the queues they're currently in)
 *  2. historyTokens — tokens with status SERVED or MISSED (past visits)
 *
 * For each active token we also compute a rough "predicted wait time":
 *   (number of tokens ahead of you in the same queue) × 3 minutes each.
 *
 * We populate storeId and queueId so the view has access to store name, queue type, etc.
 */
async function patientDashboard(req, res) {
  try {
    const patientId = req.user._id;

    // --- Active tokens (WAITING / CALLED) ---
    const activeTokens = await Token.find({
      patientId,
      status: { $in: ['WAITING', 'CALLED'] },
    })
      .populate('storeId')   // gives us store.name, store.address, etc.
      .populate('queueId')   // gives us queue.type, queue.date, etc.
      .sort({ createdAt: -1 })
      .lean();

    // For each active token, compute how many people are ahead in the same queue
    for (const t of activeTokens) {
      if (t.status === 'WAITING') {
        const ahead = await Token.countDocuments({
          queueId: t.queueId._id,
          status: 'WAITING',
          number: { $lt: t.number },
        });
        // Also count the currently-called token (1 person being served)
        const calledCount = await Token.countDocuments({
          queueId: t.queueId._id,
          status: 'CALLED',
        });
        t.peopleAhead = ahead + calledCount;
        t.predictedWaitMinutes = t.peopleAhead * 3; // ~3 min per patient
      } else {
        // Token is CALLED — patient is up now
        t.peopleAhead = 0;
        t.predictedWaitMinutes = 0;
      }
    }

    // --- History tokens (SERVED / MISSED) ---
    const historyTokens = await Token.find({
      patientId,
      status: { $in: ['SERVED', 'MISSED'] },
    })
      .populate('storeId')
      .populate('queueId')
      .sort({ updatedAt: -1 })
      .lean();

    // Browser vs API
    if (req.headers.accept?.includes('text/html')) {
      return res.render('patient-dashboard', { activeTokens, historyTokens });
    }

    res.json({ activeTokens, historyTokens });
  } catch (err) {
    console.error('patientDashboard error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { patientDashboard };
