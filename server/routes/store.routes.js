const express = require('express');
const router = express.Router();
const { listStores, getStoreById } = require('../controllers/store.controller');

// GET /api/store?search=...&type=... — list/search stores
router.get('/', listStores);

// GET /api/store/:storeId — single store detail
router.get('/:storeId', getStoreById);

module.exports = router;
