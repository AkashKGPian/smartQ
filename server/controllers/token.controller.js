const Queue = require('../models/Queue');
const Token = require('../models/Token');

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
  return token;
}

module.exports = {
  generateToken,
  callNextToken,
  completeToken,
};
