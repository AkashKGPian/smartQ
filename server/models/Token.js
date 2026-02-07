const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema(
  {
    queueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Queue',
      required: true,
    },

    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    number: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ['WAITING', 'CALLED', 'SERVED', 'MISSED'],
      default: 'WAITING',
    },

    calledAt: Date,
    servedAt: Date,
  },
  { timestamps: true }
);

tokenSchema.index({ queueId: 1, number: 1 }, { unique: true });

module.exports = mongoose.model('Token', tokenSchema);
