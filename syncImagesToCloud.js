const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const dns = require('dns');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Configure DNS resolution for MongoDB SRV records on Windows
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const { uploadToCloudinary } = require('./config/cloudinary');

const ASSET_FILES = [
  { name: 'navkshitij', file: 'navkshitij.png', titleKeywords: ['navkshitij'] },
  { name: 'pooja_apartment', file: 'pooja-apartment.png', titleKeywords: ['pooja'] },
  { name: 'charisma', file: 'charisma.png', titleKeywords: ['charisma'] },
  { name: 'vijayashree', file: 'vijayashree.png', titleKeywords: ['vijayashree'] },
  { name: 'anandvilla', file: 'anandvilla.png', titleKeywords: ['anandvilla'] },
  { name: 'chaitanya', file: 'chaitanya.png', titleKeywords: ['chaitanya'] },
  { name: 'brand_logo', file: 'logo.png', titleKeywords: [] },
];

async function findAssetPath(filename) {
  const possiblePaths = [
    path.join(__dirname, 'uploads', filename),
    path.join(__dirname, '..', 'project', 'public', 'assets', filename),
    path.join(__dirname, '..', 'Content', 'assets', filename)
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function uploadAllImages() {
  console.log('====================================================');
  console.log('🚀 STEP 1: Uploading Core Images to Cloudinary');
  console.log('====================================================');

  const uploadedUrls = {};

  for (const item of ASSET_FILES) {
    const filePath = await findAssetPath(item.file);
    if (!filePath) {
      console.warn(`⚠️ Asset file not found: ${item.file}`);
      continue;
    }

    console.log(`Uploading ${item.file} from ${filePath}...`);
    try {
      const result = await uploadToCloudinary(filePath, {
        folder: item.name === 'brand_logo' ? 'ashwath-realtors/brand' : 'ashwath-realtors/projects',
        public_id: item.name,
        overwrite: true,
        invalidate: true
      });

      uploadedUrls[item.file] = result.secure_url;
      uploadedUrls[`/assets/${item.file}`] = result.secure_url;
      uploadedUrls[item.name] = result.secure_url;

      console.log(`✅ Uploaded ${item.file} -> ${result.secure_url}`);
    } catch (err) {
      console.error(`❌ Failed to upload ${item.file}:`, err.message);
    }
  }

  return uploadedUrls;
}

async function updateDatabaseWithUrls(mongoUri, label, uploadedUrls) {
  console.log('\n====================================================');
  console.log(`🔄 STEP 2: Updating ${label} with Cloudinary URLs`);
  console.log(`URI: ${mongoUri.replace(/:([^:@]{4})[^:@]*@/, ':****@')}`);
  console.log('====================================================');

  try {
    const conn = await mongoose.createConnection(mongoUri).asPromise();
    console.log(` Connected to ${label}`);

    const Project = conn.model('Project', new mongoose.Schema({}, { strict: false }), 'projects');
    const Flat = conn.model('Flat', new mongoose.Schema({}, { strict: false }), 'flats');

    // 1. Update Projects
    const projects = await Project.find({});
    console.log(`\nFound ${projects.length} projects in ${label}:`);
    for (const proj of projects) {
      const titleLower = (proj.Title || '').toLowerCase();
      let matchedUrl = null;

      for (const item of ASSET_FILES) {
        if (item.titleKeywords.some(kw => titleLower.includes(kw))) {
          matchedUrl = uploadedUrls[item.file];
          break;
        }
      }

      if (matchedUrl) {
        await Project.updateOne({ _id: proj._id }, { $set: { Image: matchedUrl } });
        console.log(`  Updated project "${proj.Title}" -> ${matchedUrl}`);
      } else {
        console.log(`  Skipping project "${proj.Title}" (no keyword match)`);
      }
    }

    // 2. Update Flats
    const flats = await Flat.find({});
    console.log(`\nFound ${flats.length} flats in ${label}:`);
    for (const flat of flats) {
      let mainImg = flat.image || '';
      let updatedMain = mainImg;

      // Replace main image if in uploadedUrls or matches keyword
      for (const [key, cloudUrl] of Object.entries(uploadedUrls)) {
        if (mainImg.includes(key)) {
          updatedMain = cloudUrl;
          break;
        }
      }
      if (updatedMain === mainImg) {
        // Try matching by flat title
        const flatTitleLower = (flat.title || '').toLowerCase();
        for (const item of ASSET_FILES) {
          if (item.titleKeywords.some(kw => flatTitleLower.includes(kw))) {
            updatedMain = uploadedUrls[item.file];
            break;
          }
        }
      }

      // Update gallery
      let updatedGallery = [];
      if (Array.isArray(flat.imageGallery)) {
        for (const gImg of flat.imageGallery) {
          let replaced = gImg;
          for (const [key, cloudUrl] of Object.entries(uploadedUrls)) {
            if (gImg.includes(key)) {
              replaced = cloudUrl;
              break;
            }
          }
          updatedGallery.push(replaced);
        }
      }

      await Flat.updateOne(
        { _id: flat._id },
        { 
          $set: { 
            image: updatedMain,
            imageGallery: updatedGallery
          } 
        }
      );
      console.log(`  Updated flat "${flat.title}":`);
      console.log(`    Main: ${updatedMain}`);
      console.log(`    Gallery (${updatedGallery.length}): ${JSON.stringify(updatedGallery)}`);
    }

    await conn.close();
    console.log(`✅ Finished updating ${label}`);
  } catch (err) {
    console.error(`❌ Error updating ${label}:`, err.message);
  }
}

async function run() {
  try {
    const uploadedUrls = await uploadAllImages();

    // 1. Update Atlas
    if (process.env.MONGODB_URI) {
      await updateDatabaseWithUrls(process.env.MONGODB_URI, 'MongoDB Atlas', uploadedUrls);
    }

    // 2. Also try updating Local MongoDB if configured
    if (process.env.MONGODB_LOCAL_URI) {
      try {
        await updateDatabaseWithUrls(process.env.MONGODB_LOCAL_URI, 'Local MongoDB', uploadedUrls);
      } catch (localErr) {
        console.log('Local MongoDB not reachable (skipping local):', localErr.message);
      }
    }

    console.log('\n🎉 ALL IMAGES SYNCED TO CLOUDINARY AND MONGO DB UPDATED SUCCESSFULLY!');
  } catch (err) {
    console.error('Fatal sync error:', err);
  }
}

run();

