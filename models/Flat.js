const mongoose = require('mongoose');

const flatSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  bedrooms: Number,
  bathrooms: Number,
  area: Number,
  description: String,
  features: [String],
  image: String, // Main image filename
  imageGallery: [String], // Gallery image filenames
}, { timestamps: true });

module.exports = mongoose.model('Flat', flatSchema);