const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const flatController = require('../controllers/flatController');
const Flat = require('../models/Flat');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname));
  },
});

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
  async (req, res) => {
    try {
      const featuresRaw = req.body.features || '';
      const featuresArray = Array.isArray(featuresRaw) 
        ? featuresRaw 
        : typeof featuresRaw === 'string' && featuresRaw.trim()
          ? featuresRaw.split(',').map(f => f.trim()).filter(Boolean)
          : [];

      const mainImage = req.files && req.files["image"] ? req.files["image"][0].filename : (req.body.image || "");
      const galleryImages = req.files && req.files["imageGallery"]
        ? req.files["imageGallery"].map((file) => file.filename)
        : [];

      const flat = await Flat.create({
        title: req.body.title,
        category: req.body.category || 'available',
        price: Number(req.body.price) || 0,
        location: req.body.location || '',
        bedrooms: Number(req.body.bedrooms) || 0,
        bathrooms: Number(req.body.bathrooms) || 0,
        area: Number(req.body.area) || 0,
        description: req.body.description || '',
        features: featuresArray,
        image: mainImage,
        imageGallery: galleryImages.length > 0 ? galleryImages : (mainImage ? [mainImage] : []),
      });

      res.status(201).json({ message: "flat added successfully", flat });
    } catch (err) {
      console.error("Flat create error:", err);
      res.status(500).json({ message: "Error creating flat", error: err.message });
    }
  }
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
