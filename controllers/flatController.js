const Flat = require('../models/Flat'); // Make sure this path is correct: 'models' or 'model'
const fs = require('fs/promises'); // For file deletion
const path = require('path');

// Helper to remove files if they exist
const removeFile = async (filename) => {
    if (!filename) return;
    const filePath = path.join(__dirname, '..', 'uploads', filename); // Adjust path as needed
    try {
        await fs.unlink(filePath);
    } catch (error) {
        if (error.code !== 'ENOENT') { // Ignore "File not found" errors
            console.error(`Failed to delete file ${filename}:`, error.message);
        }
    }
};

// @route   GET /api/flats
exports.getFlats = async (req, res) => {
    try {
        const flats = await Flat.find();
        res.status(200).json(flats);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @route   GET /api/flats/:id
exports.getFlat = async (req, res) => {
    try {
        const flat = await Flat.findById(req.params.id);
        if (!flat) return res.status(404).json({ message: 'Flat not found' });
        res.status(200).json(flat);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @route   POST /api/flats
exports.createFlat = async (req, res) => {
    try {
        const {
            title, category, price, location, bedrooms, bathrooms, area, description, features,
        } = req.body;

        const featuresArray = features ? features.split(',').map(f => f.trim()).filter(f => f) : [];
        const mainImage = req.files && req.files['image'] ? req.files['image'][0].filename : '';
        const galleryImages = req.files && req.files['imageGallery']
            ? req.files['imageGallery'].map(file => file.filename)
            : [];

        // Mongoose automatically casts strings to Numbers for schema fields of type Number
        const newFlat = await Flat.create({
            title,
            category,
            price, // will be cast to Number
            location,
            bedrooms, // will be cast to Number
            bathrooms, // will be cast to Number
            area, // will be cast to Number
            description,
            features: featuresArray,
            image: mainImage,
            imageGallery: galleryImages,
        });

        res.status(201).json(newFlat);
    } catch (err) {
        // Remove uploaded files if saving to DB fails
        if (req.files) {
            if (req.files['image']) await removeFile(req.files['image'][0].filename);
            if (req.files['imageGallery']) {
                for (const file of req.files['imageGallery']) await removeFile(file.filename);
            }
        }
        res.status(400).json({ message: 'Error creating flat: ' + err.message });
    }
};

// @route   PUT /api/flats/:id
// exports.updateFlat = async (req, res) => {
//     try {
//         const flatId = req.params.id;
//         const existingFlat = await Flat.findById(flatId);
//         if (!existingFlat) return res.status(404).json({ message: 'Flat not found' });

//         const {
//             title, category, price, location, bedrooms, bathrooms, area, description, features,
//             existingImage, existingGallery
//         } = req.body;

//         const updateData = {
//             title, category, price, location, bedrooms, bathrooms, area, description,
//             features: features ? features.split(',').map(f => f.trim()).filter(f => f) : [],
//         };

//         // 1. Handle Main Image
//         const newMainImageFile = req.files && req.files['image'] ? req.files['image'][0].filename : null;
//         if (newMainImageFile) {
//             // Delete old image file
//             if (existingFlat.image) await removeFile(existingFlat.image);
//             updateData.image = newMainImageFile;
//         } else {
//             // No new file, use existingImage or clear if removed
//             updateData.image = existingImage || ''; 
//         }

//         // 2. Handle Gallery Images
//         const newGalleryFiles = req.files && req.files['imageGallery']
//             ? req.files['imageGallery'].map(file => file.filename)
//             : [];
        
//         // existingGallery is an array of filenames to keep
//         const existingGalleryToKeep = Array.isArray(existingGallery) ? existingGallery : (existingGallery ? [existingGallery] : []);

//         // Delete gallery files that were in the DB but not in existingGalleryToKeep
//         const filesToDelete = existingFlat.imageGallery.filter(
//             filename => !existingGalleryToKeep.includes(filename)
//         );
//         for (const filename of filesToDelete) await removeFile(filename);

//         // Combine existing and new files
//         updateData.imageGallery = [...existingGalleryToKeep, ...newGalleryFiles];


//         const updatedFlat = await Flat.findByIdAndUpdate(flatId, updateData, { new: true, runValidators: true });
//         res.status(200).json(updatedFlat);

//     } catch (err) {
//         // Remove newly uploaded files if DB update fails
//         if (req.files) {
//             if (req.files['image']) await removeFile(req.files['image'][0].filename);
//             if (req.files['imageGallery']) {
//                 for (const file of req.files['imageGallery']) await removeFile(file.filename);
//             }
//         }
//         res.status(400).json({ message: 'Error updating flat: ' + err.message });
//     }
// };
exports.updateFlat = async (req, res) => {
  try {
    const flatId = req.params.id;
    const existingFlat = await Flat.findById(flatId);

    if (!existingFlat) {
      return res.status(404).json({ message: "Flat not found" });
    }

    // Extract fields from request body
    const {
      title,
      category,
      price,
      location,
      bedrooms,
      bathrooms,
      area,
      description,
      features,
      existingImage,
      existingGallery,
    } = req.body;

    // Prepare update object
    const updateData = {
      title,
      category,
      price,
      location,
      bedrooms,
      bathrooms,
      area,
      description,
      features: features
        ? features.split(",").map((f) => f.trim()).filter((f) => f)
        : [],
    };

    // ✅ Handle main image (same as add)
    if (req.files && req.files["image"]) {
      // Delete old image from server
      if (existingFlat.image) await removeFile(existingFlat.image);

      // Assign new uploaded image
      updateData.image = req.files["image"][0].filename;
    } else {
      // No new image uploaded — keep existing one or clear if removed
      updateData.image = existingImage || existingFlat.image || "";
    }

    // ✅ Handle image gallery
    let newGallery = [];
    if (req.files && req.files["imageGallery"]) {
      newGallery = req.files["imageGallery"].map((file) => file.filename);
    }

    // existingGallery is a list of filenames to keep (from frontend)
    const existingGalleryToKeep = Array.isArray(existingGallery)
      ? existingGallery
      : existingGallery
      ? [existingGallery]
      : [];

    // Delete gallery images that are removed from frontend
    const filesToDelete = existingFlat.imageGallery.filter(
      (filename) => !existingGalleryToKeep.includes(filename)
    );
    for (const filename of filesToDelete) {
      await removeFile(filename);
    }

    // Combine kept + newly uploaded gallery images
    updateData.imageGallery = [...existingGalleryToKeep, ...newGallery];

    // ✅ Update database
    const updatedFlat = await Flat.findByIdAndUpdate(flatId, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      message: "Flat updated successfully",
      flat: updatedFlat,
    });
  } catch (err) {
    // Cleanup uploaded files if update fails
    if (req.files) {
      if (req.files["image"]) await removeFile(req.files["image"][0].filename);
      if (req.files["imageGallery"]) {
        for (const file of req.files["imageGallery"]) {
          await removeFile(file.filename);
        }
      }
    }

    console.error("Error updating flat:", err);
    res.status(500).json({ message: "Error updating flat", error: err.message });
  }
};


// @route   DELETE /api/flats/:id
exports.deleteFlat = async (req, res) => {
    try {
        const flatId = req.params.id;
        const flat = await Flat.findById(flatId);
        if (!flat) return res.status(404).json({ message: 'Flat not found' });

        // Delete associated files
        if (flat.image) await removeFile(flat.image);
        if (flat.imageGallery) {
            for (const image of flat.imageGallery) await removeFile(image);
        }

        await Flat.findByIdAndDelete(flatId);
        res.status(200).json({ message: 'Flat deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};