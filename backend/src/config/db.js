const mongoose = require('mongoose');
const env = require('./env');

let memoryServer = null;

/**
 * Connects to MongoDB using MONGO_URI from backend/.env.
 * In development, if local MongoDB is unreachable and ALLOW_IN_MEMORY_DB_FALLBACK=true,
 * falls back to an embedded MongoDB server.
 */
const connectDB = async (customUri) => {
  const uri = customUri || env.mongoUri;

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3500,
    });
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
    return { conn, isMemoryFallback: false };
  } catch (error) {
    const allowFallback = env.nodeEnv !== 'production' && env.allowInMemoryDbFallback;

    if (!allowFallback) {
      console.error(`[MongoDB] Connection error: ${error.message}`);
      throw error;
    }

    console.warn(
      `[MongoDB] Primary database unreachable (${error.message}). Starting embedded dev MongoDB...`
    );
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    const memoryUri = memoryServer.getUri('user_management_platform');
    const conn = await mongoose.connect(memoryUri);
    console.log('[MongoDB] Connected to embedded dev MongoDB instance');
    return { conn, isMemoryFallback: true };
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
};

module.exports = {
  connectDB,
  disconnectDB,
};
