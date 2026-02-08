const Token = require('../models/Token');

/**
 * GET /api/prescription/upload?tokenId=...
 * Renders the upload form for a given token.
 */
async function showUploadForm(req, res) {
  try {
    const { tokenId } = req.query;

    if (!tokenId) {
      return res.status(400).json({ error: 'tokenId query param required' });
    }

    const token = await Token.findById(tokenId)
      .populate('storeId')
      .populate('queueId')
      .lean();

    if (!token) {
      return res.status(404).json({ error: 'Token not found' });
    }

    // Only the token owner can upload
    if (String(token.patientId) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Not your token' });
    }

    // Only SERVED tokens can receive prescriptions
    if (token.status !== 'SERVED') {
      return res.status(400).json({ error: 'Token must be SERVED before uploading' });
    }

    res.render('prescription-upload', { token });
  } catch (err) {
    console.error('showUploadForm error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

/**
 * POST /api/prescription/upload
 * Handles the file upload and saves path on the token.
 */
async function uploadPrescription(req, res) {
  try {
    const { tokenId } = req.body;

    if (!tokenId) {
      return res.status(400).json({ error: 'tokenId is required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const token = await Token.findById(tokenId);

    if (!token) {
      return res.status(404).json({ error: 'Token not found' });
    }

    if (String(token.patientId) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Not your token' });
    }

    if (token.status !== 'SERVED') {
      return res.status(400).json({ error: 'Token must be SERVED before uploading' });
    }

    // Save the file path (relative URL)
    token.prescription = `/uploads/prescriptions/${req.file.filename}`;
    await token.save();

    if (req.headers.accept?.includes('text/html')) {
      return res.redirect('/api/patient/dashboard');
    }

    res.json({ message: 'Prescription uploaded', prescription: token.prescription });
  } catch (err) {
    console.error('uploadPrescription error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

/**
 * DELETE /api/prescription/:tokenId
 * Removes the prescription from a token.
 */
async function deletePrescription(req, res) {
  try {
    const token = await Token.findById(req.params.tokenId);

    if (!token) {
      return res.status(404).json({ error: 'Token not found' });
    }

    if (String(token.patientId) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Not your token' });
    }

    token.prescription = null;
    await token.save();

    if (req.headers.accept?.includes('text/html')) {
      return res.redirect('/api/patient/dashboard');
    }

    res.json({ message: 'Prescription deleted' });
  } catch (err) {
    console.error('deletePrescription error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { showUploadForm, uploadPrescription, deletePrescription };
