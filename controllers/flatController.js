const Flat = require('../models/Flat');
const path = require('path');
const fs = require('fs');
const { uploadToCloudinary, deleteFromCloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

// Helper to remove local file if needed
const removeLocalFile = (filename) => {
    if (!filename) return;
    const filePath = path.join(__dirname, '..', 'uploads', path.basename(filename));
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.error(`Failed to delete local file ${filename}:`, error.message);
        }
    }
};

// Helper to safely delete an asset from Cloudinary or local disk
const cleanupAsset = async (imageUrl) => {
    if (!imageUrl) return;
    if (imageUrl.includes('cloudinary.com')) {
        await deleteFromCloudinary(imageUrl).catch(err => console.error("Cloudinary cleanup error:", err.message));
    } else if (imageUrl.includes('/uploads/')) {
        removeLocalFile(imageUrl);
    }
};

// @route   GET /api/flats
exports.getFlats = async (req, res) => {
    try {
        const flats = await Flat.find().sort({ _id: -1 });
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
        const featuresRaw = req.body.features || '';
        const featuresArray = Array.isArray(featuresRaw)
            ? featuresRaw
            : typeof featuresRaw === 'string' && featuresRaw.trim()
                ? featuresRaw.split(',').map(f => f.trim()).filter(Boolean)
                : [];

        // 1. Process Main Image
        let mainImage = req.body.image || "";
        if (req.files && req.files["image"] && req.files["image"][0]) {
            const file = req.files["image"][0];
            if (isCloudinaryConfigured()) {
                try {
                    const uploadResult = await uploadToCloudinary(file.buffer, {
                        folder: "ashwath-realtors/flats"
                    });
                    mainImage = uploadResult.secure_url;
                } catch (uploadErr) {
                    console.error("Cloudinary upload failed for flat main image:", uploadErr.message);
                    const uploadsDir = path.join(__dirname, "..", "uploads");
                    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
                    const localFileName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname || '.jpg');
                    fs.writeFileSync(path.join(uploadsDir, localFileName), file.buffer);
                    mainImage = `http://localhost:5100/uploads/${localFileName}`;
                }
            } else {
                const uploadsDir = path.join(__dirname, "..", "uploads");
                if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
                const localFileName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname || '.jpg');
                fs.writeFileSync(path.join(uploadsDir, localFileName), file.buffer);
                mainImage = `http://localhost:5100/uploads/${localFileName}`;
            }
        } else if (mainImage.startsWith('data:image/') && isCloudinaryConfigured()) {
            try {
                const uploadResult = await uploadToCloudinary(mainImage, { folder: "ashwath-realtors/flats" });
                mainImage = uploadResult.secure_url;
            } catch (err) {
                console.error("Base64 upload failed for flat main image:", err.message);
            }
        }

        // 2. Process Gallery Images
        let galleryImages = [];
        if (req.files && req.files["imageGallery"] && req.files["imageGallery"].length > 0) {
            for (const file of req.files["imageGallery"]) {
                if (isCloudinaryConfigured()) {
                    try {
                        const uploadResult = await uploadToCloudinary(file.buffer, {
                            folder: "ashwath-realtors/flats"
                        });
                        galleryImages.push(uploadResult.secure_url);
                    } catch (err) {
                        console.error("Cloudinary upload failed for flat gallery image:", err.message);
                    }
                } else {
                    const uploadsDir = path.join(__dirname, "..", "uploads");
                    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
                    const localFileName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname || '.jpg');
                    fs.writeFileSync(path.join(uploadsDir, localFileName), file.buffer);
                    galleryImages.push(`http://localhost:5100/uploads/${localFileName}`);
                }
            }
        }

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

        res.status(201).json({ message: "Flat added successfully", flat });
    } catch (err) {
        console.error("Flat create error:", err);
        res.status(500).json({ message: "Error creating flat", error: err.message });
    }
};

// @route   PUT /api/flats/:id
exports.updateFlat = async (req, res) => {
    try {
        const flatId = req.params.id;
        const existingFlat = await Flat.findById(flatId);

        if (!existingFlat) {
            return res.status(404).json({ message: "Flat not found" });
        }

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

        const updateData = {
            title: title || existingFlat.title,
            category: category || existingFlat.category,
            price: price !== undefined ? Number(price) : existingFlat.price,
            location: location || existingFlat.location,
            bedrooms: bedrooms !== undefined ? Number(bedrooms) : existingFlat.bedrooms,
            bathrooms: bathrooms !== undefined ? Number(bathrooms) : existingFlat.bathrooms,
            area: area !== undefined ? Number(area) : existingFlat.area,
            description: description !== undefined ? description : existingFlat.description,
            features: features
                ? (Array.isArray(features) ? features : features.split(",").map((f) => f.trim()).filter(Boolean))
                : existingFlat.features,
        };

        // 1. Handle main image
        if (req.files && req.files["image"] && req.files["image"][0]) {
            const file = req.files["image"][0];
            // Clean up previous image
            if (existingFlat.image) {
                await cleanupAsset(existingFlat.image);
            }

            if (isCloudinaryConfigured()) {
                try {
                    const uploadResult = await uploadToCloudinary(file.buffer, {
                        folder: "ashwath-realtors/flats"
                    });
                    updateData.image = uploadResult.secure_url;
                } catch (uploadErr) {
                    console.error("Cloudinary upload failed for flat main image update:", uploadErr.message);
                    const uploadsDir = path.join(__dirname, "..", "uploads");
                    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
                    const localFileName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname || '.jpg');
                    fs.writeFileSync(path.join(uploadsDir, localFileName), file.buffer);
                    updateData.image = `http://localhost:5100/uploads/${localFileName}`;
                }
            } else {
                const uploadsDir = path.join(__dirname, "..", "uploads");
                if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
                const localFileName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname || '.jpg');
                fs.writeFileSync(path.join(uploadsDir, localFileName), file.buffer);
                updateData.image = `http://localhost:5100/uploads/${localFileName}`;
            }
        } else {
            updateData.image = existingImage || existingFlat.image || "";
        }

        // 2. Handle gallery images
        let newGalleryUrls = [];
        if (req.files && req.files["imageGallery"] && req.files["imageGallery"].length > 0) {
            for (const file of req.files["imageGallery"]) {
                if (isCloudinaryConfigured()) {
                    try {
                        const uploadResult = await uploadToCloudinary(file.buffer, {
                            folder: "ashwath-realtors/flats"
                        });
                        newGalleryUrls.push(uploadResult.secure_url);
                    } catch (err) {
                        console.error("Cloudinary upload failed for flat gallery update:", err.message);
                    }
                } else {
                    const uploadsDir = path.join(__dirname, "..", "uploads");
                    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
                    const localFileName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname || '.jpg');
                    fs.writeFileSync(path.join(uploadsDir, localFileName), file.buffer);
                    newGalleryUrls.push(`http://localhost:5100/uploads/${localFileName}`);
                }
            }
        }

        // Kept gallery images
        const existingGalleryToKeep = Array.isArray(existingGallery)
            ? existingGallery
            : existingGallery
                ? [existingGallery]
                : [];

        // Delete gallery images removed by user
        if (Array.isArray(existingFlat.imageGallery)) {
            const filesToDelete = existingFlat.imageGallery.filter(
                (imgUrl) => !existingGalleryToKeep.includes(imgUrl)
            );
            for (const imgUrl of filesToDelete) {
                await cleanupAsset(imgUrl);
            }
        }

        updateData.imageGallery = [...existingGalleryToKeep, ...newGalleryUrls];

        const updatedFlat = await Flat.findByIdAndUpdate(flatId, updateData, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            message: "Flat updated successfully",
            flat: updatedFlat,
        });
    } catch (err) {
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

        if (flat.image) await cleanupAsset(flat.image);
        if (Array.isArray(flat.imageGallery)) {
            for (const image of flat.imageGallery) {
                await cleanupAsset(image);
            }
        }

        await Flat.findByIdAndDelete(flatId);
        res.status(200).json({ message: 'Flat deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
