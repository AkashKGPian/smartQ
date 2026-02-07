const Queue = require('../models/Queue');
const Token = require('../models/Token');
const Store = require('../models/Store');

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

async function getOrCreateQueue(storeId, type) {
  const today = getTodayDate();

  let queue = await Queue.findOne({ storeId, type, date: today });

  if (!queue) {
    queue = await Queue.create({
      storeId,
      type,
      date: today,
    });
  }

  return queue;
}

async function joinQueue(req, res) {
  try {
  const { storeId, type } = req.body;
  const patientId = req.user._id;

  // 1️ Validate store
  const store = await Store.findById(storeId);
  if (!store || !store.isActive) {
    return res.status(404).json({ error: 'Invalid store' });
  }

  // 2️ Validate queue type
  if (!['DOCTOR', 'DISPENSARY'].includes(type)) {
    return res.status(400).json({ error: 'Invalid queue type' });
  }

  // 3️ Get or create queue
  const queue = await getOrCreateQueue(storeId, type);

  if (queue.isPaused) {
    return res.status(403).json({ error: 'Queue is currently paused' });
  }

  // 4️ Prevent duplicate active token
  const existingToken = await Token.findOne({
    queueId: queue._id,
    patientId,
    status: { $in: ['WAITING', 'CALLED'] },
  });

  if (existingToken) {
    return res.status(409).json({
      error: 'Already in queue',
      tokenId: existingToken._id,
      tokenNumber: existingToken.number,
      status: existingToken.status,
      queueType: queue.type,
      storeName: store.name,
    });
  }

  // 5️ Generate token (atomic at logical level)
  queue.currentTokenNumber += 1;
  await queue.save();

  const token = await Token.create({
    queueId: queue._id,
    storeId,
    patientId,
    number: queue.currentTokenNumber,
  });

  // 6️ API vs Browser response
  if (req.headers.accept?.includes('text/html')) {
    return res.render('token-card', { token, store, queue });
  }

  res.status(201).json({
    tokenId: token._id,
    tokenNumber: token.number,
    status: token.status,
    queueType: queue.type,
    storeName: store.name,
  });
  } catch (err) {
    console.error('joinQueue error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  getOrCreateQueue,
  joinQueue,
};
