require('dotenv').config();
const mongoose = require('mongoose');
const Store = require('../models/Store');

// node server/scripts/createStore.js
// Copy the printed Store ID → generate QR.

async function createStore() {
  if (!process.env.MONGODB_URI) {
    console.error('FATAL: MONGODB_URI is not set. Please add MONGODB_URI to your .env or environment.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const store = await Store.create({
    name: 'City Hospital OPD',
    type: 'HOSPITAL',
    address: 'Main Road, Sector 12',
  });

  console.log('Store created');
  console.log('Store ID:', store._id.toString());

  process.exit(0);
}

createStore();
