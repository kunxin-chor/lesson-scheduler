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
  return await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
}

export async function updateLessonPlan(id, updateData) {
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

export async function deleteLessonPlan(id) {
  const db = getDB();
  const result = await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}
