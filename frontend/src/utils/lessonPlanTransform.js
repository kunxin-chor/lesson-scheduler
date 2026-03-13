// Transform backend lesson plan data to frontend format
export function transformFromBackend(backendPlan) {
  if (!backendPlan) return null;

  // Flatten modules and lessons for the board view
  const modules = backendPlan.modules || [];
  const lessons = [];

  modules.forEach((module) => {
    if (module.lessons && Array.isArray(module.lessons)) {
      module.lessons.forEach((lesson) => {
        lessons.push({
          ...lesson,
          moduleId: module.id,
        });
      });
    }
  });

  return {
    id: backendPlan._id,
    name: backendPlan.name,
    description: backendPlan.description || '',
    modules: modules.map(m => ({
      id: m.id,
      name: m.name,
      order: m.order,
    })),
    lessons: lessons,
    createdAt: backendPlan.createdAt,
    updatedAt: backendPlan.updatedAt,
  };
}

// Transform frontend lesson plan data to backend format
export function transformToBackend(plan, modulesData, lessonsData) {
  // Transform flat lessons array into nested structure within modules
  const modulesWithLessons = modulesData.map((module, moduleIndex) => ({
    id: module.id,
    name: module.name,
    order: moduleIndex,
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

  return {
    name: plan.name,
    description: plan.description || '',
    modules: modulesWithLessons,
  };
}
