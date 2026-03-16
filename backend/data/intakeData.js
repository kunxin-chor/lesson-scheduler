import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';

const COLLECTION = 'intakes';

export async function createIntake(intakeData) {
  const db = getDB();
  const result = await db.collection(COLLECTION).insertOne({
    ...intakeData,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  const createdIntake = await db.collection(COLLECTION).findOne({ _id: result.insertedId });
  return createdIntake;
}

export async function getAllIntakes() {
  const db = getDB();
  return await db.collection(COLLECTION).find().toArray();
}

export async function getIntakeById(id) {
  const db = getDB();
  try {
    return await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
  } catch (error) {
    // If ObjectId is invalid, return null (controller will handle as 404)
    if (error.message.includes('ObjectId')) {
      return null;
    }
    throw error;
  }
}

export async function updateIntake(id, updateData) {
  const db = getDB();
  try {
    const result = await db.collection(COLLECTION).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...updateData, 
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    return result || null;
  } catch (error) {
    // If ObjectId is invalid, return null (controller will handle as 404)
    if (error.message.includes('ObjectId')) {
      return null;
    }
    throw error;
  }
}

export async function deleteIntake(id) {
  const db = getDB();
  try {
    const result = await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  } catch (error) {
    // If ObjectId is invalid, return false (controller will handle as 404)
    if (error.message.includes('ObjectId')) {
      return false;
    }
    throw error;
  }
}

export async function updateClassSlots(id, classSlots) {
  const db = getDB();
  try {
    const result = await db.collection(COLLECTION).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          classSlots, 
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    return result || null;
  } catch (error) {
    // If ObjectId is invalid, return null (controller will handle as 404)
    if (error.message.includes('ObjectId')) {
      return null;
    }
    throw error;
  }
}
