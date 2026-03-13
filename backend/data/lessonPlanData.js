import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';

const COLLECTION = 'lessonPlans';

export async function createLessonPlan(lessonPlanData) {
  if (!lessonPlanData.name) {
    throw new Error('Lesson plan name is required');
  }
  
  const db = getDB();
  const result = await db.collection(COLLECTION).insertOne({
    ...lessonPlanData,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return { _id: result.insertedId, ...lessonPlanData };
}

export async function getAllLessonPlans() {
  const db = getDB();
  return await db.collection(COLLECTION).find().toArray();
}

export async function getLessonPlanById(id) {
  const db = getDB();
  try {
    return await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
  } catch (error) {
    // If ObjectId is invalid, return null (controller will handle as 404)
    console.log('ObjectId error:', error.message);
    if (error.message.includes('ObjectId') || error.message.includes('BSON')) {
      return null;
    }
    throw error;
  }
}

export async function updateLessonPlan(id, updateData) {
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
    return result || null; // Return null if result or result.value is null
  } catch (error) {
    // If ObjectId is invalid, return null (controller will handle as 404)
    if (error.message.includes('ObjectId') || error.message.includes('BSON')) {
      return null;
    }
    throw error;
  }
}

export async function deleteLessonPlan(id) {
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
