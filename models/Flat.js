const mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/Construction")
.then(()=>{console.log("Mongo connected for flat")})
.catch((err)=>console.log("error of mongo flat : ",err))

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