// Transform backend lesson plan data to frontend format
export function transformFromBackend(backendPlan) {
  if (!backendPlan) return null;

  console.log('🔍 transformFromBackend - Raw backend plan:', backendPlan);
  console.log('🔍 Assignments from backend:', backendPlan.assignments);

  // Flatten modules and lessons for the board view
  const modules = backendPlan.modules || [];
  const lessons = [];

  modules.forEach((module) => {
    if (module.lessons && Array.isArray(module.lessons)) {
      module.lessons.forEach((lesson) => {
        console.log('🔍 Processing lesson:', {
          title: lesson.title,
          hasPrelearning: !!lesson.prelearningMaterials,
          hasInstructions: !!lesson.guidedInstructions,
          hasActivities: !!lesson.handsOnActivities,
          prelearningLength: lesson.prelearningMaterials?.length,
          lesson: lesson
        });
        lessons.push({
          ...lesson,
          moduleId: module.id,
        });
      });
    }
  });

  return {
    id: backendPlan.id,
    name: backendPlan.name,
    description: backendPlan.description || '',
    modules: modules.map(m => ({
      id: m.id,
      name: m.name,
      order: m.order,
      referenceMaterials: m.referenceMaterials || '',
    })),
    lessons: lessons,
    assignments: backendPlan.assignments || [],
    createdAt: backendPlan.createdAt,
    updatedAt: backendPlan.updatedAt,
  };
}

// Transform frontend lesson plan data to backend format
export function transformToBackend(plan, modulesData, lessonsData, assignmentsData = []) {
  // Transform flat lessons array into nested structure within modules
  const modulesWithLessons = modulesData.map((module) => ({
    id: module.id,
    name: module.name,
    order: module.order, // Keep the actual order from the unified list
    referenceMaterials: module.referenceMaterials || '',
    lessons: lessonsData
      .filter(lesson => lesson.moduleId === module.id)
      .map((lesson, lessonIndex) => ({
        id: lesson.id,
        title: lesson.title,
        prelearningMaterials: lesson.prelearningMaterials || '',
        guidedInstructions: lesson.guidedInstructions || '',
        handsOnActivities: lesson.handsOnActivities || '',
        order: lessonIndex,
      }))
  }));

  // Transform assignments - preserve their order in the unified list
  const assignments = assignmentsData.map((assignment) => ({
    id: assignment.id,
    title: assignment.title,
    description: assignment.description || '',
    durationDays: assignment.durationDays || 1,
    order: assignment.order, // Keep the actual order from the unified list
  }));

  return {
    name: plan.name,
    description: plan.description || '',
    modules: modulesWithLessons,
    assignments: assignments,
  };
}
