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

export function parseBulkSlotString(bulkString) {
  const entries = bulkString.split(',').map(s => s.trim()).filter(s => s);
  const slots = [];
  
  for (const entry of entries) {
    const match = entry.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s*([MAE])$/i);
    if (match) {
      const [, day, month, year] = match;
      const timeSlotCode = match[4].toUpperCase();
      
      const timeSlotMap = {
        'M': 'morning',
        'A': 'afternoon',
        'E': 'evening'
      };
      
      const timeSlot = timeSlotMap[timeSlotCode];
      if (!timeSlot) continue;
      
      const date = new Date(year, parseInt(month) - 1, parseInt(day));
      
      slots.push({
        id: `slot-${date.getTime()}-${timeSlot}-bulk`,
        date: date,
        dayOfWeek: date.getDay(),
        timeSlot: timeSlot,
        isManuallyAdded: true
      });
    }
  }
  
  return slots.sort((a, b) => a.date - b.date);
}

export async function addBulkSlots(id, bulkString) {
  const intake = await intakeData.getIntakeById(id);
  if (!intake) return null;
  
  const newSlots = parseBulkSlotString(bulkString);
  const existingSlots = intake.classSlots || [];
  
  const mergedSlots = [...existingSlots];
  for (const newSlot of newSlots) {
    const duplicate = existingSlots.find(
      s => new Date(s.date).toDateString() === newSlot.date.toDateString() && s.timeSlot === newSlot.timeSlot
    );
    if (!duplicate) {
      mergedSlots.push(newSlot);
    }
  }
  
  mergedSlots.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  return await intakeData.updateClassSlots(id, mergedSlots);
}
