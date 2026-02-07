const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },

    type: {
      type: String,
      enum: ['DOCTOR', 'DISPENSARY'],
      required: true,
    },

    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },

    isPaused: {//further can be controlled by doc/dispensry as well
      type: Boolean,
      default: false,
    },

    currentTokenNumber: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);
// Index guarantees no duplicate queues for same store, type and date
queueSchema.index({ storeId: 1, type: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Queue', queueSchema);
