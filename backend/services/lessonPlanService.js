import * as lessonPlanData from '../data/lessonPlanData.js';

export async function createLessonPlan(lessonPlanInfo) {
  if (!lessonPlanInfo.name) {
    throw new Error('Lesson plan name is required');
  }
  
  const lessonPlan = {
    name: lessonPlanInfo.name,
    description: lessonPlanInfo.description || '',
    modules: lessonPlanInfo.modules || []
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
  if (updateInfo.modules) updateData.modules = updateInfo.modules;
  
  return await lessonPlanData.updateLessonPlan(id, updateData);
}

export async function deleteLessonPlan(id) {
  return await lessonPlanData.deleteLessonPlan(id);
}
