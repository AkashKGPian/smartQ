const Store = require('../models/Store');

/**
 * GET /api/store?search=city&type=HOSPITAL
 * Lists active stores with optional search and type filter.
 */
async function listStores(req, res) {
  try {
    const { search, type } = req.query;
    const filter = { isActive: true };

    // text search on name or address (case-insensitive partial match)
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ name: regex }, { address: regex }];
    }

    // filter by store type
    if (type && ['HOSPITAL', 'PHARMACY', 'CLINIC'].includes(type.toUpperCase())) {
      filter.type = type.toUpperCase();
    }

    const stores = await Store.find(filter).sort({ name: 1 }).lean();

    // browser → render search page
    if (req.headers.accept?.includes('text/html')) {
      return res.render('store-search', { stores, search: search || '', type: type || '' });
    }

    res.json(stores);
  } catch (err) {
    console.error('listStores error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function getStoreById(req, res) {
  try {
    const { storeId } = req.params;

    const store = await Store.findById(storeId);

    if (!store) {
      return res.status(404).send('Store not found!');
    }
    if (!store.isActive) {
      return res.status(404).send('Store is inactive right now.');
    }

    // If accessed via browser → render EJS
    if (req.headers.accept?.includes('text/html')) {
      return res.render('store-landing', { store });
    }

    // If accessed via API
    res.status(200).json({
      id: store._id,
      name: store.name,
      type: store.type,
      address: store.address,
    });
  } catch (err) {
    console.error('getStoreById error:', err);
    res.status(500).send('Server error');
  }
}

module.exports = {
  listStores,
  getStoreById,
};
