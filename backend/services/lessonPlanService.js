import { ObjectId } from 'mongodb';
import * as lessonPlanData from '../data/lessonPlanData.js';

// Helper to convert module and lesson IDs to ObjectId
function convertIdsToObjectId(modules) {
  if (!modules) return [];
  
  return modules.map(module => {
    let moduleId;
    try {
      // Try to use existing ID if it's a valid ObjectId string
      moduleId = module.id && ObjectId.isValid(module.id) ? new ObjectId(module.id) : new ObjectId();
    } catch (e) {
      // Generate new ObjectId if conversion fails
      moduleId = new ObjectId();
    }
    
    return {
      ...module,
      id: moduleId,
      referenceMaterials: module.referenceMaterials || '',
      lessons: module.lessons?.map(lesson => {
        let lessonId;
        try {
          lessonId = lesson.id && ObjectId.isValid(lesson.id) ? new ObjectId(lesson.id) : new ObjectId();
        } catch (e) {
          lessonId = new ObjectId();
        }
        return {
          ...lesson,
          id: lessonId
        };
      }) || []
    };
  });
}

export async function createLessonPlan(lessonPlanInfo) {
  if (!lessonPlanInfo.name) {
    throw new Error('Lesson plan name is required');
  }
  
  const lessonPlan = {
    name: lessonPlanInfo.name,
    description: lessonPlanInfo.description || '',
    modules: convertIdsToObjectId(lessonPlanInfo.modules),
    assignments: lessonPlanInfo.assignments || []
  };
  
  return await lessonPlanData.createLessonPlan(lessonPlan);
}

export async function getAllLessonPlans() {
  return await lessonPlanData.getAllLessonPlans();
}

export async function getLessonPlanById(id) {
  return await lessonPlanData.getLessonPlanById(id);
}

export async function updateLessonPlan(id, updateInfo) {
  const updateData = {};
  
  if (updateInfo.name) updateData.name = updateInfo.name;
  if (updateInfo.description !== undefined) updateData.description = updateInfo.description;
  if (updateInfo.modules) updateData.modules = convertIdsToObjectId(updateInfo.modules);
  if (updateInfo.assignments !== undefined) updateData.assignments = updateInfo.assignments;
  
  return await lessonPlanData.updateLessonPlan(id, updateData);
}

export async function deleteLessonPlan(id) {
  return await lessonPlanData.deleteLessonPlan(id);
}
