import { MongoClient } from 'mongodb';

let client = null;
let db = null;

export async function connectDB(mongoHost, dbName) {
  const host = mongoHost || process.env.MONGODB_HOST || 'mongodb://localhost:27017';
  const database = dbName || process.env.DB_NAME || 'lesson-scheduler-dev';
  
  console.log(`Connecting to MongoDB: ${host}`);
  try {
    client = new MongoClient(host);
    await client.connect();
    db = client.db(database);
    console.log(`Connected to MongoDB: ${database}`);
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
}

export function getDB() {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
}

export async function closeDB() {
  await client.close();
}
