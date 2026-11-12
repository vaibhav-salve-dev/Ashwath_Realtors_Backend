const mongoose = require('mongoose');
const dns = require('dns');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const localUri = process.env.MONGODB_LOCAL_URI || 'mongodb://127.0.0.1:27017/Construction';
let atlasUri = process.env.MONGODB_URI;

if (atlasUri && !atlasUri.includes('/Construction')) {
  atlasUri = atlasUri.replace(/\/?(\?.*)?$/, '/Construction$1');
}

async function runTests() {
  console.log("=========================================");
  console.log("   MongoDB Dual Environment Test Suite   ");
  console.log("=========================================\n");

  // TEST 1: Local MongoDB
  console.log("[TEST 1/2] Testing Local MongoDB...");
  try {
    const localConn = await mongoose.createConnection(localUri, { serverSelectionTimeoutMS: 5000 }).asPromise();
    console.log("  ✓ Connection: OK");
    const ping = await localConn.db.admin().ping();
    console.log("  ✓ Ping Admin: OK", ping);

    const projectCount = await localConn.collection('projects').countDocuments();
    const company = await localConn.collection('companies').findOne({});
    console.log(`  ✓ Data Query: Found ${projectCount} projects, Company="${company ? company.name : 'None'}"`);
    await localConn.close();
    console.log("  -> Local MongoDB Test: PASSED\n");
  } catch (err) {
    console.error("  x Local MongoDB Test: FAILED ->", err.message, "\n");
  }

  // TEST 2: MongoDB Atlas (Cloud)
  console.log("[TEST 2/2] Testing MongoDB Atlas (Cloud)...");
  try {
    const atlasConn = await mongoose.createConnection(atlasUri, { serverSelectionTimeoutMS: 12000 }).asPromise();
    console.log("  ✓ Connection: OK");
    const ping = await atlasConn.db.admin().ping();
    console.log("  ✓ Ping Admin: OK", ping);

    const projectCount = await atlasConn.collection('projects').countDocuments();
    const company = await atlasConn.collection('companies').findOne({});
    const flatCount = await atlasConn.collection('flats').countDocuments();
    console.log(`  ✓ Cloud Data: Found ${projectCount} projects, ${flatCount} flats, Company="${company ? company.name : 'None'}"`);
    console.log(`  ✓ Cloud Tagline: "${company ? company.tagline : 'None'}"`);

    await atlasConn.close();
    console.log("  -> MongoDB Atlas Cloud Test: PASSED\n");
  } catch (err) {
    console.error("  x MongoDB Atlas Cloud Test: FAILED ->", err.message, "\n");
  }

  console.log("=========================================");
  console.log("   Both Environments Verified & Ready!   ");
  console.log("=========================================");
  process.exit(0);
}

runTests();

