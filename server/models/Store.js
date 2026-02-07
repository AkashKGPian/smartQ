const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ['HOSPITAL', 'PHARMACY', 'CLINIC'],
      required: true,
    },

    address: {
      type: String,
    },

    isActive: {//lets you disable a store without deleting data
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Store', storeSchema);
