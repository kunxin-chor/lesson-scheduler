import * as lessonPlanService from '../services/lessonPlanService.js';

// Transform MongoDB _id to id for frontend
function transformLessonPlan(plan) {
  if (!plan) return null;
  const { _id, ...rest } = plan;
  return { id: _id.toString(), ...rest };
}

function transformLessonPlans(plans) {
  return plans.map(transformLessonPlan);
}

export async function createLessonPlan(req, res) {
  try {
    const lessonPlan = await lessonPlanService.createLessonPlan(req.body);
    res.status(201).json(transformLessonPlan(lessonPlan));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getAllLessonPlans(req, res) {
  try {
    const lessonPlans = await lessonPlanService.getAllLessonPlans();
    res.json(transformLessonPlans(lessonPlans));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getLessonPlanById(req, res) {
  try {
    const lessonPlan = await lessonPlanService.getLessonPlanById(req.params.id);
    if (!lessonPlan) {
      return res.status(404).json({ error: 'Lesson plan not found' });
    }
    res.json(transformLessonPlan(lessonPlan));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateLessonPlan(req, res) {
  try {
    const lessonPlan = await lessonPlanService.updateLessonPlan(req.params.id, req.body);
    if (!lessonPlan) {
      return res.status(404).json({ error: 'Lesson plan not found' });
    }
    res.json(transformLessonPlan(lessonPlan));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteLessonPlan(req, res) {
  try {
    const success = await lessonPlanService.deleteLessonPlan(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Lesson plan not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
