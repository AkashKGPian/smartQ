const express = require('express');
const multer = require('multer');
const path = require('path');
const { isAuthenticated, requirePatient } = require('../middleware/auth.middleware');
const {
  showUploadForm,
  uploadPrescription,
  deletePrescription,
} = require('../controllers/prescription.controller');

const router = express.Router();

// Multer config — store in /uploads/prescriptions
const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads', 'prescriptions'));
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|pdf|webp/;
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowed.test(file.mimetype);
  cb(null, extOk && mimeOk);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// Routes
router.get('/upload', isAuthenticated, requirePatient, showUploadForm);
router.post('/upload', isAuthenticated, requirePatient, upload.single('prescription'), uploadPrescription);
router.delete('/:tokenId', isAuthenticated, requirePatient, deletePrescription);
// Browser fallback for delete (forms can't send DELETE)
router.post('/:tokenId/delete', isAuthenticated, requirePatient, deletePrescription);

module.exports = router;
