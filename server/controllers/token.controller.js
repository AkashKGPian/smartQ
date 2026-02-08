const Queue = require('../models/Queue');
const Token = require('../models/Token');
const { getIO } = require('../helpers/socket');

async function generateToken(queue, patientId) {
  queue.currentTokenNumber += 1;
  await queue.save();

  const token = await Token.create({
    queueId: queue._id,
    storeId: queue.storeId,
    patientId,
    number: queue.currentTokenNumber,
  });

  return token;
}

async function callNextToken(queueId) {
  const token = await Token.findOne({
    queueId,
    status: 'WAITING',
  }).sort({ number: 1 });

  if (!token) return null;

  token.status = 'CALLED';
  token.calledAt = new Date();
  await token.save();

  // --- Socket.IO: notify the patient and the queue room ---
  try {
    const io = getIO();
    io.to(`user:${token.patientId}`).emit('token:called', {
      tokenId: token._id,
      tokenNumber: token.number,
      queueId: token.queueId,
    });
    io.to(`queue:${queueId}`).emit('token:called', {
      tokenId: token._id,
      tokenNumber: token.number,
      queueId: token.queueId,
    });
  } catch (_) { /* non-fatal */ }

  return token;
}

async function completeToken(tokenId, status) {
  const token = await Token.findById(tokenId);
  if (!token) return null;

  token.status = status;
  if (status === 'SERVED') {
    token.servedAt = new Date();
  }

  await token.save();

  // --- Socket.IO: notify the patient and the queue room ---
  try {
    const io = getIO();
    io.to(`user:${token.patientId}`).emit('token:completed', {
      tokenId: token._id,
      tokenNumber: token.number,
      queueId: token.queueId,
      status: token.status,
    });
    io.to(`queue:${token.queueId}`).emit('token:completed', {
      tokenId: token._id,
      tokenNumber: token.number,
      queueId: token.queueId,
      status: token.status,
    });
  } catch (_) { /* non-fatal */ }

  return token;
}

module.exports = {
  generateToken,
  callNextToken,
  completeToken,
};
