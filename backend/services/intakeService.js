import * as intakeData from '../data/intakeData.js';

export async function createIntake(intakeInfo) {
  const intake = {
    name: intakeInfo.name,
    lessonPlanId: intakeInfo.lessonPlanId || null,
    startDate: new Date(intakeInfo.startDate),
    classSlotPatterns: intakeInfo.classSlotPatterns || [],
    exceptions: intakeInfo.exceptions || [],
    classSlots: intakeInfo.classSlots || [],
    dayGapBetweenModules: intakeInfo.dayGapBetweenModules || 0,
    status: 'active'
  };
  
  return await intakeData.createIntake(intake);
}

export async function getAllIntakes() {
  return await intakeData.getAllIntakes();
}

export async function getIntakeById(id) {
  return await intakeData.getIntakeById(id);
}

export async function updateIntake(id, updateInfo) {
  const updateData = {};
  
  if (updateInfo.name) updateData.name = updateInfo.name;
  if (updateInfo.lessonPlanId !== undefined) updateData.lessonPlanId = updateInfo.lessonPlanId;
  if (updateInfo.startDate) updateData.startDate = new Date(updateInfo.startDate);
  if (updateInfo.classSlotPatterns) updateData.classSlotPatterns = updateInfo.classSlotPatterns;
  if (updateInfo.exceptions) updateData.exceptions = updateInfo.exceptions;
  if (updateInfo.classSlots) updateData.classSlots = updateInfo.classSlots;
  if (updateInfo.dayGapBetweenModules !== undefined) updateData.dayGapBetweenModules = updateInfo.dayGapBetweenModules;
  if (updateInfo.status) updateData.status = updateInfo.status;
  
  return await intakeData.updateIntake(id, updateData);
}

export async function deleteIntake(id) {
  return await intakeData.deleteIntake(id);
}

export async function updateClassSlots(id, classSlots) {
  return await intakeData.updateClassSlots(id, classSlots);
}

export async function regenerateIntake(id, newPatterns, newExceptions, newClassSlots) {
  const updateData = {
    classSlotPatterns: newPatterns,
    exceptions: newExceptions,
    classSlots: newClassSlots
  };
  
  return await intakeData.updateIntake(id, updateData);
}
