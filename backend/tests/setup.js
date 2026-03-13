import { beforeAll, afterAll, beforeEach } from 'vitest';
import { connectDB, closeDB, getDB } from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

beforeAll(async () => {
  try {
    const mongoHost = process.env.MONGODB_HOST;
    const dbName = process.env.DB_NAME;
    
    await connectDB(mongoHost, dbName);
    console.log('✓ Test database connected successfully');
    console.log(`  Database: ${dbName}`);
  } catch (error) {
    console.error('✗ Failed to connect to MongoDB');
    console.error(`  Host: ${process.env.MONGODB_HOST}`);
    console.error(`  Database: ${process.env.DB_NAME}`);
    console.error('  Error:', error.message);
    throw error;
  }
});

afterAll(async () => {
  try {
    await closeDB();
  } catch (error) {
    console.error('Error closing database:', error.message);
  }
});

beforeEach(async () => {
  try {
    const db = getDB();
    
    await db.collection('intakes').deleteMany({});
    await db.collection('lessonPlans').deleteMany({});
    
    console.log('✓ Database cleaned for next test');
  } catch (error) {
    console.error('Error cleaning database:', error.message);
    throw error;
  }
});
