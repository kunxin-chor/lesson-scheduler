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
  return { _id: result.insertedId, ...intakeData };
}

export async function getAllIntakes() {
  const db = getDB();
  return await db.collection(COLLECTION).find().toArray();
}

export async function getIntakeById(id) {
  const db = getDB();
  return await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
}

export async function updateIntake(id, updateData) {
  const db = getDB();
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
  return result.value;
}

export async function deleteIntake(id) {
  const db = getDB();
  const result = await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

export async function updateClassSlots(id, classSlots) {
  const db = getDB();
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
  return result.value;
}
