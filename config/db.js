const mongoose = require('mongoose');
const dns = require('dns');
const path = require('path');

// Ensure dotenv is loaded from Backend/.env if not already loaded
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// DNS server fix for Windows and certain networks where Node c-ares fails SRV lookup
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore in restricted environments
}

const getMongoUri = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const useAtlas = isProduction || process.env.USE_ATLAS === 'true' || process.env.DB_ENV === 'production';

  const localUri = process.env.MONGODB_LOCAL_URI || 'mongodb://127.0.0.1:27017/Construction';
  let atlasUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (atlasUri && !atlasUri.includes('/Construction')) {
    atlasUri = atlasUri.replace(/\/?(\?.*)?$/, '/Construction$1');
  }

  if (useAtlas && atlasUri) {
    return {
      uri: atlasUri,
      isAtlas: true,
      label: 'MongoDB Atlas (Cloud Production)'
    };
  }

  return {
    uri: localUri,
    isAtlas: false,
    label: 'Local MongoDB (Development)'
  };
};

let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const { uri, isAtlas, label } = getMongoUri();
  const safeUri = uri.replace(/:([^@]+)@/, ':****@');

  console.log(`[DB Config] Selected Target: ${label}`);
  console.log(`[DB Config] Connecting to: ${safeUri}`);

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });

    isConnected = true;
    console.log(`[DB Success] Connected to ${label}`);
    console.log(`[DB Success] Database: "${conn.connection.name}" | Host: "${conn.connection.host}"`);

    return conn;
  } catch (error) {
    console.error(`[DB Error] Connection failed to ${label}:`, error.message);

    // If Atlas failed while in development, fallback to local if available
    const { isAtlas: wasAtlas } = getMongoUri();
    if (wasAtlas && process.env.NODE_ENV !== 'production') {
      const fallbackLocal = process.env.MONGODB_LOCAL_URI || 'mongodb://127.0.0.1:27017/Construction';
      console.log(`[DB Fallback] Attempting fallback to local MongoDB: ${fallbackLocal}`);
      try {
        const localConn = await mongoose.connect(fallbackLocal);
        isConnected = true;
        console.log(`[DB Fallback Success] Connected to Local MongoDB`);
        return localConn;
      } catch (localErr) {
        console.error(`[DB Fallback Error] Local connection also failed:`, localErr.message);
      }
    }

    throw error;
  }
};

module.exports = { connectDB, getMongoUri };

