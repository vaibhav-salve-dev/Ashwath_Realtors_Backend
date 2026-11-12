const express = require('express');
const router = express.Router();
const multer = require('multer');
const flatController = require('../controllers/flatController');

// In-memory buffer storage for direct Cloudinary upload streaming
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 }
});

// CREATE Flat
router.post(
  "/",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "imageGallery", maxCount: 10 },
  ]),
  flatController.createFlat
);

// GET all flats
router.get('/', flatController.getFlats);

// GET a single flat
router.get('/:id', flatController.getFlat);

// PUT (Update) an existing flat
router.put(
  '/:id',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'imageGallery', maxCount: 10 },
  ]),
  flatController.updateFlat
);

// DELETE a flat
router.delete('/:id', flatController.deleteFlat);

module.exports = router;
