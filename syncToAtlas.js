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

if (!atlasUri) {
  console.error("Error: MONGODB_URI not found in Backend/.env");
  process.exit(1);
}

async function sync() {
  console.log("=========================================");
  console.log("  Syncing Local MongoDB -> MongoDB Atlas ");
  console.log("=========================================");

  console.log(`Connecting to Local DB: ${localUri}`);
  const localConn = await mongoose.createConnection(localUri).asPromise();
  console.log("Connected to Local MongoDB!");

  console.log(`Connecting to Atlas DB: ${atlasUri.replace(/:([^@]+)@/, ':****@')}`);
  const atlasConn = await mongoose.createConnection(atlasUri, { serverSelectionTimeoutMS: 15000 }).asPromise();
  console.log("Connected to MongoDB Atlas!");

  const collections = ['companies', 'projects', 'flats', 'contacts', 'enquirys'];

  for (const colName of collections) {
    const localCollection = localConn.collection(colName);
    const atlasCollection = atlasConn.collection(colName);

    const docs = await localCollection.find({}).toArray();
    console.log(`\nFound ${docs.length} document(s) in local "${colName}"`);

    if (docs.length > 0) {
      // Clear existing in Atlas collection to prevent duplicates
      await atlasCollection.deleteMany({});
      await atlasCollection.insertMany(docs);
      console.log(`-> Successfully transferred ${docs.length} doc(s) into Atlas "${colName}"`);
    } else {
      console.log(`-> Skipped (empty collection)`);
    }
  }

  console.log("\n=========================================");
  console.log("  Atlas Synchronization Complete! ");
  console.log("=========================================");

  await localConn.close();
  await atlasConn.close();
  process.exit(0);
}

sync().catch((err) => {
  console.error("Sync Failed:", err);
  process.exit(1);
});

